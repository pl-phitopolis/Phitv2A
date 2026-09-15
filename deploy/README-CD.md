# UAT continuous deployment — how a push to `main` reaches uat.phitopolis.io

Built 2026-09-14. Applies to **both** repos (Fresko `Phitv2A`, Heimdall
`Phitv2B-2`); the box-side files live in this repo under `deploy/box/`.

```
push main ──► GitHub Actions (deploy-uat.yml)            ──► GHCR
              verify (ci.yml) → build on ubuntu-24.04-arm    ghcr.io/yakovins-miletus/<img>:uat-<sha>
              label org.opencontainers.image.revision=<sha>   ghcr.io/yakovins-miletus/<img>:uat  (moves)

UAT box ◄──── systemd timer, every 60 s (phit-uat-deploy.timer → phit-uat-watch.sh)
              digest of :uat changed?  → docker pull → read revision label
              → git checkout <sha> in /srv/phit-uat/<app>/src
              → that commit's deploy/deploy-uat.sh (guards, snapshot, up --no-build, health gates)
```

## Why pull-based, and why nothing builds on the box

- **No self-hosted runner.** Both repos are public; a runner would let any
  fork PR run code on a host that also serves production. The box never
  accepts inbound work — it polls GHCR anonymously and only pulls images
  that CI built from `main`.
- **No builds on the box, ever.** 2 vCPU / 3.4 GB; the Fresko build has
  OOM-killed it. `deploy-uat.sh` uses `up -d --no-build` and refuses to run
  with < 700 MB free or < 3 GB disk. Images are built on GitHub's native
  arm64 runners (the box is aarch64).

## Images

| Repo | Image | Dockerfile target |
|---|---|---|
| Phitv2A | `ghcr.io/yakovins-miletus/fresko` | (single) |
| Phitv2B-2 | `ghcr.io/yakovins-miletus/heimdall-api` | `api` |
| Phitv2B-2 | `ghcr.io/yakovins-miletus/heimdall-admin` | `admin-ui` |

Packages must be **public** (GitHub → Packages → package settings → Change
visibility) or the box cannot pull. `docker manifest`/pull are anonymous.

## Box layout (`/srv/phit-uat/`)

```
bin/phit-uat-watch.sh      the poller (copy in deploy/box/)
fresko/   .env  ssl/  src/  deployed.digest  [attempted.digest]  [CONTRACT-DRIFT]
heimdall/ .env  data/ backups/  src/  deployed.digest  [attempted.digest]
```

- `.env`, `ssl/`, `data/` are the only box-specific state; they are outside
  any git checkout and referenced from compose via `PHIT_STATE_DIR`.
- `src/` is a read-only https mirror pinned to the deployed commit. Never
  edit it — it is reset on every deploy.
- `deployed.digest` = what is live. `attempted.digest` = a digest whose
  deploy **failed**; the watcher will not retry it until `:uat` moves or you
  `rm` the file.
- `CONTRACT-DRIFT` (Fresko) exists when the committed `schema.d.ts` differs
  from the live Heimdall OpenAPI — advisory; regenerate with `yarn typegen`.

## Installing the box side (once)

```bash
sudo cp deploy/box/phit-uat-watch.sh /srv/phit-uat/bin/
sudo cp deploy/box/phit-uat-deploy.{service,timer} /etc/systemd/system/
# SELinux is enforcing on this host: systemd may not exec a var_t file.
sudo semanage fcontext -a -t bin_t '/srv/phit-uat/bin(/.*)?' && sudo restorecon -R /srv/phit-uat/bin
sudo systemctl daemon-reload && sudo systemctl enable --now phit-uat-deploy.timer
```

## Operating it

```bash
journalctl -u phit-uat-deploy -f                       # live log
systemctl list-timers phit-uat-deploy.timer            # next poll
/srv/phit-uat/bin/phit-uat-watch.sh --force fresko     # redeploy :uat now
PHIT_STATE_DIR=/srv/phit-uat/heimdall IMAGE_TAG=uat-<sha> /srv/phit-uat/heimdall/src/deploy/deploy-uat.sh   # pin a tag by hand
```

Every compose call goes through `deploy/compose.sh` (it passes `--env-file
$PHIT_STATE_DIR/.env`, which carries the 80/443-vs-8080/8443 port mode).

## Rollback

Actions → *Build UAT image(s)* → **Run workflow** with `image_tag = uat-<old sha>`.
That retags `:uat` on GHCR; the box redeploys the older image (and, via its
revision label, the older compose file) within a minute.

**Heimdall is two steps**: `alembic upgrade head` ran at start, so first
restore the pre-deploy snapshot the box took
(`/srv/phit-uat/heimdall/backups/data.bak.<ts>`, procedure in
`deploy/BACKUP.md`), *then* retag.

## Port ownership (80/443)

Deploys never switch ports; `deploy-uat.sh` fails if the owner changed under
it. Switching stays manual, on the box:

```bash
cd /srv/phit-uat/fresko/src/deploy && PHIT_STATE_DIR=/srv/phit-uat/fresko ./switch-443.sh status|fresko|revamp
```
