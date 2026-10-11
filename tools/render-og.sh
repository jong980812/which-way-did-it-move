#!/bin/sh
# Render tools/og-card.html to static/images/og-card.png (1200×630) with headless Chrome.
set -e
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1200,630 --force-device-scale-factor=1 \
  --screenshot="$PWD/static/images/og-card.png" \
  --virtual-time-budget=3000 \
  "file://$PWD/tools/og-card.html" 2>/dev/null
echo "wrote static/images/og-card.png"
