#!/bin/bash
# Generate placeholder icons for development
# Replace icon.png with your actual 1024x1024 icon

# Create a simple placeholder PNG using base64 (a small blue square)
# This is a minimal valid 32x32 PNG

echo "To generate proper icons, create a 1024x1024 icon.png and run:"
echo ""
echo "# For macOS (requires sips):"
echo "sips -z 32 32 icon.png --out 32x32.png"
echo "sips -z 128 128 icon.png --out 128x128.png"
echo "sips -z 256 256 icon.png --out 128x128@2x.png"
echo ""
echo "# For icns (requires iconutil on macOS):"
echo "mkdir icon.iconset"
echo "sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png"
echo "sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png"
echo "sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png"
echo "sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png"
echo "sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png"
echo "sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png"
echo "sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png"
echo "sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png"
echo "sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png"
echo "sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png"
echo "iconutil -c icns icon.iconset -o icon.icns"
