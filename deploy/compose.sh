#!/usr/bin/env bash
# Single entry point for the UAT compose stack. Resolves where box-only state
# lives (.env, ssl/) and passes it to compose as --env-file, so the port-mode
# variables written by switch-443.sh are interpolated no matter where the
# checkout is (a CI runner's _work dir, or a hand checkout).
#
#   ./compose.sh up -d --no-build      # what CI runs
#   ./compose.sh ps
#   PHIT_STATE_DIR=/srv/phit-uat/fresko ./compose.sh logs -f
#
# Default is `.` (state next to this file) so a laptop checkout needs nothing.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
export PHIT_STATE_DIR="${PHIT_STATE_DIR:-.}"
ENV_FILE="$PHIT_STATE_DIR/.env"
[ -f "$ENV_FILE" ] || { echo "compose.sh: no $ENV_FILE (copy .env.sample there)" >&2; exit 1; }
exec docker compose --env-file "$ENV_FILE" -f docker-compose.uat.yml "$@"
