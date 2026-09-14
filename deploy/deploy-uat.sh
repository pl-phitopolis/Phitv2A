#!/usr/bin/env bash
# Deploy the Fresko UAT stack from an image that already exists in GHCR.
#
# Run by the box's watcher (/srv/phit-uat/bin/phit-uat-watch.sh, systemd timer)
# when the :uat digest changes, from a checkout of the commit the image was
# built from. Also fine to run by hand:
#
#   PHIT_STATE_DIR=/srv/phit-uat/fresko deploy/deploy-uat.sh            # deploy :uat
#   PHIT_STATE_DIR=/srv/phit-uat/fresko IMAGE_TAG=uat-<sha> deploy/deploy-uat.sh
#
# NEVER builds. This is a 2 vCPU / 3.4 GB host that the Fresko build has
# OOM-killed before; images come from .github/workflows/deploy-uat.yml on
# GitHub's arm64 runners. `up -d --no-build` is not optional here.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

export PHIT_STATE_DIR="${PHIT_STATE_DIR:-/srv/phit-uat/fresko}"
export IMAGE_TAG="${IMAGE_TAG:-uat}"
IMAGE="ghcr.io/yakovins-miletus/fresko:${IMAGE_TAG}"
CONTAINER=phit-uat-fresko
LOCK=/tmp/phit-uat-deploy.lock

log() { printf '[fresko-deploy] %s\n' "$*"; }
die() { log "ERROR: $*" >&2; exit 1; }

port_owner() {
  deploy/switch-443.sh status | head -3 | sed 's/\x1b\[[0-9;]*m//g' | awk '/port 443 holder:/{getline; print $1}'
}

# ── Resource guard ────────────────────────────────────────────────────────────
# Fail loudly instead of letting the kernel OOM-killer pick a victim (it may
# pick the production site sharing this box).
avail=$(free -m | awk '/^Mem:/{print $7}')
[ "$avail" -ge 700 ] || { free -h; docker stats --no-stream || true; die "only ${avail} MB available, need >= 700"; }
free_kb=$(df -Pk / | awk 'NR==2{print $4}')
[ "$free_kb" -ge $((3 * 1024 * 1024)) ] || { df -h /; die "less than 3 GB free on /"; }

prev_image=$(docker inspect "$CONTAINER" --format '{{.Config.Image}}@{{.Image}}' 2>/dev/null || echo none)
prev_owner=$(port_owner || echo unknown)
log "current: $prev_image  port-443 owner: $prev_owner"

# ── Live OpenAPI contract check (advisory) ────────────────────────────────────
# Heimdall runs on this box at :8001, so this is the one place the committed
# schema.d.ts can be compared with a REAL backend. Advisory, not blocking: a
# drift here means "regenerate types on main", and holding the whole site on an
# old build for it would hide the problem rather than surface it. The marker
# file is what the watcher reports.
if command -v node >/dev/null 2>&1 && curl -sf --max-time 5 http://127.0.0.1:8001/openapi.json -o /tmp/phit-openapi.json; then
  if npx --yes openapi-typescript@7 /tmp/phit-openapi.json -o /tmp/phit-schema.d.ts >/dev/null 2>&1 \
     && diff -q -b src/shared/api/schema.d.ts /tmp/phit-schema.d.ts >/dev/null; then
    rm -f "$PHIT_STATE_DIR/CONTRACT-DRIFT"
  else
    log "WARNING: src/shared/api/schema.d.ts differs from the live Heimdall schema — run 'yarn typegen' against Heimdall main and commit"
    date -u +%FT%TZ > "$PHIT_STATE_DIR/CONTRACT-DRIFT"
  fi
fi

# ── Pull + swap ───────────────────────────────────────────────────────────────
docker pull "$IMAGE" || die "pull failed for $IMAGE — is the GHCR package public?"
log "deploying $IMAGE ($(docker image inspect "$IMAGE" --format '{{index .RepoDigests 0}}'))"
flock -w 600 "$LOCK" deploy/compose.sh up -d --no-build

# ── Health gate ───────────────────────────────────────────────────────────────
for _ in $(seq 1 90); do
  [ "$(docker inspect "$CONTAINER" --format '{{.State.Health.Status}}' 2>/dev/null || true)" = healthy ] && break
  sleep 1
done
[ "$(docker inspect "$CONTAINER" --format '{{.State.Health.Status}}' 2>/dev/null || true)" = healthy ] \
  || { docker logs --tail 100 "$CONTAINER" || true; die "$CONTAINER not healthy after 90 s"; }

code=$(curl -sk -H "Host: uat.phitopolis.io" -o /dev/null -w '%{http_code}' https://127.0.0.1/)
[ "$code" = 200 ] || die "https://127.0.0.1/ returned $code"
# JSON, not the SPA's index.html fallback (which is also a 200).
body=$(curl -sk -H "Host: uat.phitopolis.io" https://127.0.0.1/api/v1/services | head -c 1)
case "$body" in '['|'{') ;; *) die "/api/v1/services did not return JSON (SPA fallback?)";; esac

# Deploys never switch ports — that is switch-443.sh, run deliberately.
now_owner=$(port_owner || echo unknown)
[ "$now_owner" = "$prev_owner" ] || die "port 443 owner changed during deploy: $prev_owner -> $now_owner"

docker image prune -f >/dev/null
log "OK: $IMAGE live (was $prev_image); port-443 owner: $now_owner"
