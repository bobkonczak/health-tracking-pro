#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon template
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="url(#gradient)" stroke="#ffffff" stroke-width="2"/>

  <!-- Health cross symbol -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Vertical bar -->
    <rect x="-${size/12}" y="-${size/4}" width="${size/6}" height="${size/2}" fill="white" rx="${size/24}"/>
    <!-- Horizontal bar -->
    <rect x="-${size/4}" y="-${size/12}" width="${size/2}" height="${size/6}" fill="white" rx="${size/24}"/>
  </g>

  <!-- Heart symbol (small) -->
  <g transform="translate(${size * 0.75}, ${size * 0.25}) scale(0.3)">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
  </g>
</svg>`;

// Define icon sizes needed
const iconSizes = [72, 96, 120, 128, 144, 152, 180, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA icons...');

// Generate SVG icons for each size
iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svgContent);
  console.log(`✓ Generated ${filename}`);
});

// Generate maskable icons (with padding for Android)
const createMaskableIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background circle with safe area -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#gradient)"/>

  <!-- Health cross symbol (smaller for safe area) -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Vertical bar -->
    <rect x="-${size/16}" y="-${size/5}" width="${size/8}" height="${size/2.5}" fill="white" rx="${size/32}"/>
    <!-- Horizontal bar -->
    <rect x="-${size/5}" y="-${size/16}" width="${size/2.5}" height="${size/8}" fill="white" rx="${size/32}"/>
  </g>
</svg>`;

// Generate maskable icons
[192, 512].forEach(size => {
  const svgContent = createMaskableIconSVG(size);
  const filename = `icon-${size}x${size}-maskable.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svgContent);
  console.log(`✓ Generated ${filename} (maskable)`);
});

console.log('\n🎯 Icon generation complete!');
console.log('📝 Note: SVG icons created. For PNG conversion, you can use:');
console.log('   - Online converters like CloudConvert');
console.log('   - ImageMagick: convert icon.svg icon.png');
console.log('   - Or deploy as SVG (modern browsers support SVG icons in PWAs)');