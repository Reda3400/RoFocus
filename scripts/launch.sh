#!/usr/bin/env sh
# One plain background command: serve the ready-made site, open its port, and
# stop when the tab closes. No build and no install happen here.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
PORT=${REFOCUS_PORT:-4173}
URL="http://localhost:$PORT/"

nohup python3 "$ROOT/scripts/serve.py" "$ROOT/dist" "$PORT" >/dev/null 2>&1 &
SERVER=$!
trap 'kill "$SERVER" 2>/dev/null || true' 0 INT TERM

# Open only once the port is answering.
i=0
while ! python3 -c "import socket,sys; s=socket.socket(); s.settimeout(0.2); sys.exit(s.connect_ex(('127.0.0.1', $PORT)))" 2>/dev/null; do
  i=$((i + 1))
  [ "$i" -lt 40 ] || break
  sleep 0.1
done

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "$URL" >/dev/null 2>&1 || true
else
  printf 'Open this address in a browser: %s\n' "$URL"
fi

wait "$SERVER"
