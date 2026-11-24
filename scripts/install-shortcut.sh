#!/usr/bin/env sh
# Create a RoFocus desktop shortcut for Linux or macOS.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
OS=$(uname -s 2>/dev/null || echo unknown)

if [ "$OS" = "Darwin" ]; then
  mkdir -p "$HOME/Desktop"
  TARGET="$HOME/Desktop/RoFocus.command"
  cat > "$TARGET" <<EOF
#!/bin/sh
exec sh "$ROOT/scripts/launch.sh"
EOF
  chmod +x "$TARGET"
  rm -f "$HOME/Desktop/ReFocus V1.command"
  printf 'RoFocus shortcut ready on the Desktop.\n'
else
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
fi
