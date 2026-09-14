#!/usr/bin/env bash
# UAT continuous deployment, pull-style. Runs from phit-uat-deploy.timer every
# minute as ec2-user. For each app: read the digest behind the `:uat` tag on
# GHCR (anonymous registry API — packages are public); if it differs from what
# is deployed, pull the image, check out the commit named in its
# org.opencontainers.image.revision label in the app's mirror, and run THAT
# commit's deploy/deploy-uat.sh. Nothing on GitHub can execute code here — the
# box only ever pulls an image that CI built from `main`. Heimdall goes first;
# Fresko proxies to it by container name.
#
#   journalctl -u phit-uat-deploy -f          # watch it
#   /srv/phit-uat/bin/phit-uat-watch.sh --force fresko   # redeploy even if unchanged
#
# State per app (in /srv/phit-uat/<app>/):
#   deployed.digest   digest currently live
#   attempted.digest  digest of a FAILED deploy — not retried until :uat moves
#                     again (or --force), so a broken image doesn't loop every
#                     minute. `rm` it to retry.
set -uo pipefail
ROOT=/srv/phit-uat
OWNER=yakovins-miletus
FORCE=0; ONLY=""
for a in "$@"; do case "$a" in --force) FORCE=1;; *) ONLY="$a";; esac; done

log() { printf '[phit-uat-watch] %s\n' "$*"; }

remote_digest() { # <image-name> <tag>
  local tok
  tok=$(curl -sf --max-time 10 "https://ghcr.io/token?scope=repository:${OWNER}/$1:pull" \
        | python3 -c 'import sys,json;print(json.load(sys.stdin).get("token",""))' 2>/dev/null) || return 1
  curl -sfI --max-time 10 -H "Authorization: Bearer $tok" \
    -H "Accept: application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json" \
    "https://ghcr.io/v2/${OWNER}/$1/manifests/$2" | awk 'tolower($1)=="docker-content-digest:"{print $2}' | tr -d '\r'
}

deploy_app() { # <app> <git-remote> <lead-image>
  local app=$1 remote=$2 img=$3 dir="$ROOT/$1" digest rev
  [ -z "$ONLY" ] || [ "$ONLY" = "$app" ] || return 0
  digest=$(remote_digest "$img" uat) || { log "$app: :uat not readable on GHCR (package missing or private) — skipping"; return 0; }
  [ -n "$digest" ] || { log "$app: empty digest — skipping"; return 0; }
  if [ "$FORCE" = 0 ]; then
    [ "$digest" != "$(cat "$dir/deployed.digest" 2>/dev/null)" ] || return 0
    [ "$digest" != "$(cat "$dir/attempted.digest" 2>/dev/null)" ] || { log "$app: $digest failed earlier, waiting for :uat to move"; return 0; }
  fi
  log "$app: :uat is $digest, deploying"
  echo "$digest" > "$dir/attempted.digest"

  docker pull -q "ghcr.io/$OWNER/$img:uat" >/dev/null || { log "$app: pull failed"; return 1; }
  rev=$(docker image inspect "ghcr.io/$OWNER/$img:uat" --format '{{index .Config.Labels "org.opencontainers.image.revision"}}')
  [ -n "$rev" ] || { log "$app: image has no revision label"; return 1; }

  # Mirror of the repo, pinned to the image's commit so compose + deploy script
  # always match the image. Fetched over the per-repo deploy key (~/.ssh/config
  # aliases github-fresko / github-heimdall) — works whether the repo is public
  # or private. Only ever fetch/checkout here; never commit from this path.
  [ -d "$dir/src/.git" ] || git clone -q "$remote" "$dir/src" || { log "$app: clone failed"; return 1; }
  git -C "$dir/src" fetch -q origin && git -C "$dir/src" checkout -q --force "$rev" \
    || { log "$app: cannot check out $rev"; return 1; }

  if PHIT_STATE_DIR="$dir" "$dir/src/deploy/deploy-uat.sh"; then
    echo "$digest" > "$dir/deployed.digest"; rm -f "$dir/attempted.digest"
    log "$app: deployed $rev ($digest)"
  else
    log "$app: DEPLOY FAILED for $rev ($digest) — see above; fix and push, or rm $dir/attempted.digest to retry"
    return 1
  fi
}

rc=0
deploy_app heimdall git@github-heimdall:yakovins-miletus/Phitv2B-2.git heimdall-api || rc=1
deploy_app fresko   git@github-fresko:yakovins-miletus/Phitv2A.git    fresko       || rc=1
exit $rc
