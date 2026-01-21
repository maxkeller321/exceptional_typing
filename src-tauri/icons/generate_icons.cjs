const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

// Generate a keyboard icon that scales well
function generatePNG(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const rawData = [];

  // App colors matching the dark-gold theme
  const bg = { r: 30, g: 32, b: 36 };       // --bg-primary
  const accent = { r: 226, g: 183, b: 20 }; // --accent (gold)
  const keyBg = { r: 50, g: 54, b: 62 };    // --bg-tertiary
  const cornerRadius = width * 0.22;

  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      if (!isInRoundedRect(x, y, width, height, cornerRadius)) {
        rawData.push(0, 0, 0, 0);
        continue;
      }

      let r = bg.r, g = bg.g, b = bg.b, a = 255;
      const centerX = width / 2;
      const centerY = height / 2;

      // Keyboard body dimensions
      const kbWidth = width * 0.72;
      const kbHeight = height * 0.45;
      const kbLeft = centerX - kbWidth / 2;
      const kbTop = centerY - kbHeight / 2;
      const kbRadius = width * 0.06;

      // Check if inside keyboard body
      if (isInRoundedRectAt(x, y, kbLeft, kbTop, kbWidth, kbHeight, kbRadius)) {
        r = keyBg.r; g = keyBg.g; b = keyBg.b;

        // Key dimensions
        const keySize = width * 0.08;
        const keyGap = width * 0.025;
        const keyRadius = width * 0.015;

        // Row 1: 4 keys (top row)
        const row1Y = kbTop + kbHeight * 0.18;
        const row1Keys = 4;
        const row1Width = row1Keys * keySize + (row1Keys - 1) * keyGap;
        const row1StartX = centerX - row1Width / 2;

        for (let k = 0; k < row1Keys; k++) {
          const kx = row1StartX + k * (keySize + keyGap);
          if (isInRoundedRectAt(x, y, kx, row1Y, keySize, keySize, keyRadius)) {
            r = accent.r; g = accent.g; b = accent.b;
          }
        }

        // Row 2: 4 keys (middle row)
        const row2Y = row1Y + keySize + keyGap;
        for (let k = 0; k < row1Keys; k++) {
          const kx = row1StartX + k * (keySize + keyGap);
          if (isInRoundedRectAt(x, y, kx, row2Y, keySize, keySize, keyRadius)) {
            r = accent.r; g = accent.g; b = accent.b;
          }
        }

        // Row 3: Space bar (bottom row)
        const row3Y = row2Y + keySize + keyGap;
        const spaceWidth = kbWidth * 0.65;
        const spaceX = centerX - spaceWidth / 2;
        if (isInRoundedRectAt(x, y, spaceX, row3Y, spaceWidth, keySize, keyRadius)) {
          r = accent.r; g = accent.g; b = accent.b;
        }
      }
      rawData.push(r, g, b, a);
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function isInRoundedRectAt(x, y, rx, ry, rw, rh, r) {
  if (x < rx || x >= rx + rw || y < ry || y >= ry + rh) return false;
  const lx = x - rx, ly = y - ry;
  if (lx < r && ly < r) return Math.sqrt((lx - r) ** 2 + (ly - r) ** 2) <= r;
  if (lx >= rw - r && ly < r) return Math.sqrt((lx - (rw - r)) ** 2 + (ly - r) ** 2) <= r;
  if (lx < r && ly >= rh - r) return Math.sqrt((lx - r) ** 2 + (ly - (rh - r)) ** 2) <= r;
  if (lx >= rw - r && ly >= rh - r) return Math.sqrt((lx - (rw - r)) ** 2 + (ly - (rh - r)) ** 2) <= r;
  return true;
}

function isInRoundedRect(x, y, w, h, r) {
  if (x < 0 || x >= w || y < 0 || y >= h) return false;
  if (x < r && y < r) return Math.sqrt((x - r) ** 2 + (y - r) ** 2) <= r;
  if (x >= w - r && y < r) return Math.sqrt((x - (w - r)) ** 2 + (y - r) ** 2) <= r;
  if (x < r && y >= h - r) return Math.sqrt((x - r) ** 2 + (y - (h - r)) ** 2) <= r;
  if (x >= w - r && y >= h - r) return Math.sqrt((x - (w - r)) ** 2 + (y - (h - r)) ** 2) <= r;
  return true;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = makeCrcTable();
  for (let i = 0; i < data.length; i++) crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c;
  }
  return table;
}

const iconsDir = __dirname;
const sizes = [
  { name: '16x16.png', size: 16 },
  { name: '16x16@2x.png', size: 32 },
  { name: '32x32.png', size: 32 },
  { name: '32x32@2x.png', size: 64 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
  { name: '256x256.png', size: 256 },
  { name: '256x256@2x.png', size: 512 },
  { name: '512x512.png', size: 512 },
  { name: '512x512@2x.png', size: 1024 },
];

console.log('Generating keyboard icon PNGs...');
sizes.forEach(({ name, size }) => {
  fs.writeFileSync(path.join(iconsDir, name), generatePNG(size, size));
  console.log('  Created ' + name);
});

console.log('\nGenerating macOS .icns file...');
try {
  const iconsetDir = path.join(iconsDir, 'icon.iconset');
  if (!fs.existsSync(iconsetDir)) fs.mkdirSync(iconsetDir);
  [
    ['16x16.png', 'icon_16x16.png'],
    ['16x16@2x.png', 'icon_16x16@2x.png'],
    ['32x32.png', 'icon_32x32.png'],
    ['32x32@2x.png', 'icon_32x32@2x.png'],
    ['128x128.png', 'icon_128x128.png'],
    ['128x128@2x.png', 'icon_128x128@2x.png'],
    ['256x256.png', 'icon_256x256.png'],
    ['256x256@2x.png', 'icon_256x256@2x.png'],
    ['512x512.png', 'icon_512x512.png'],
    ['512x512@2x.png', 'icon_512x512@2x.png'],
  ].forEach(([src, dst]) => {
    fs.copyFileSync(path.join(iconsDir, src), path.join(iconsetDir, dst));
  });
  execSync('iconutil -c icns "' + iconsetDir + '" -o "' + path.join(iconsDir, 'icon.icns') + '"', { stdio: 'inherit' });
  fs.rmSync(iconsetDir, { recursive: true });
  console.log('  Created icon.icns');
} catch (err) {
  console.log('  Error:', err.message);
}

console.log('\nGenerating Windows .ico file...');
try {
  const ico256 = fs.readFileSync(path.join(iconsDir, '256x256.png'));
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);
  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(0, 0);
  icoEntry.writeUInt8(0, 1);
  icoEntry.writeUInt8(0, 2);
  icoEntry.writeUInt8(0, 3);
  icoEntry.writeUInt16LE(1, 4);
  icoEntry.writeUInt16LE(32, 6);
  icoEntry.writeUInt32LE(ico256.length, 8);
  icoEntry.writeUInt32LE(22, 12);
  fs.writeFileSync(path.join(iconsDir, 'icon.ico'), Buffer.concat([icoHeader, icoEntry, ico256]));
  console.log('  Created icon.ico');
} catch (err) {
  console.log('  Error:', err.message);
}

console.log('\nDone! Keyboard icon with gold keys on dark background.');
