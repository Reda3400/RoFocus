#!/bin/sh
# macOS alias target: hands over to the shared launcher.
exec "$(dirname "$0")/launch.sh"
