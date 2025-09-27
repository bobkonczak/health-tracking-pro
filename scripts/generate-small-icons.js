#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create small icon SVG template (simplified for small sizes)
const createSmallIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#gradient)" rx="${size/8}"/>

  <!-- Simple health cross symbol -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Vertical bar -->
    <rect x="-${size/12}" y="-${size/4}" width="${size/6}" height="${size/2}" fill="white"/>
    <!-- Horizontal bar -->
    <rect x="-${size/4}" y="-${size/12}" width="${size/2}" height="${size/6}" fill="white"/>
  </g>
</svg>`;

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const smallSizes = [16, 32];

console.log('Generating small PWA icons...');

smallSizes.forEach(size => {
  const svgContent = createSmallIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svgContent);
  console.log(`✓ Generated ${filename}`);
});

console.log('✓ Small icons generation complete!');