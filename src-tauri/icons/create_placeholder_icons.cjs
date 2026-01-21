// Run with: node create_placeholder_icons.js
// Creates minimal placeholder icons for development

const fs = require('fs');
const path = require('path');

// Minimal valid PNG file (8x8 blue square)
// This is a real PNG file encoded as base64
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAQklEQVRYR+3Oyw' +
  'kAIRAD0c7+i9YVvHgTAqJ/wJkkhEhJkqRBVDwmxu7ufr6q+wdw7F/APYDkEyC5' +
  'BMjuAHw+AGfuBARpthVvAAAAAElFTkSuQmCC',
  'base64'
);

// Write the same minimal PNG to all icon files
// (they'll work for development, replace with real icons for production)
const iconFiles = ['32x32.png', '128x128.png', '128x128@2x.png'];

const iconsDir = __dirname;

iconFiles.forEach(file => {
  fs.writeFileSync(path.join(iconsDir, file), minimalPNG);
  console.log(`Created ${file}`);
});

// For .icns and .ico, we need proper binary formats
// For now, copy the PNG as a placeholder (won't work for final build)
console.log('\nNote: icon.icns and icon.ico need proper conversion tools.');
console.log('For macOS: Use iconutil to create .icns from .iconset folder');
console.log('For Windows: Use a tool like png2ico or ImageMagick');

console.log('\nDone! Replace these with proper icons before production build.');
