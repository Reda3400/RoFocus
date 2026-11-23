#!/usr/bin/env sh
# Put one RoFocus icon on the Desktop and in the applications menu.
# Clicking it only runs a shell command.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$HOME/Desktop" "$HOME/.local/share/applications"

for ICON in "$HOME/Desktop/RoFocus.desktop" "$HOME/.local/share/applications/RoFocus.desktop"; do
  cat > "$ICON" <<EOF
[Desktop Entry]
Type=Application
Name=RoFocus
Comment=Return to what matters
Exec=sh "$ROOT/scripts/launch.sh"
Icon=$ROOT/public/favicon.svg
Terminal=false
Categories=Education;Utility;
EOF
  chmod +x "$ICON"
done

rm -f "$HOME/Desktop/ReFocus V1.desktop" "$HOME/.local/share/applications/refocus-v1.desktop"

printf 'RoFocus shortcut ready on the Desktop and in the applications menu.\n'
