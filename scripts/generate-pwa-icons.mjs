#!/usr/bin/env node

/**
 * Script to generate PWA icons from the SVG logo using sharp
 * Requires: npm install sharp --save-dev
 */

import { existsSync, mkdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const sizes = [
  { size: 96, filename: 'android-chrome-96x96.png' },
  { size: 144, filename: 'android-chrome-144x144.png' },
  { size: 192, filename: 'android-chrome-192x192.png' },
  { size: 256, filename: 'android-chrome-256x256.png' },
  { size: 384, filename: 'android-chrome-384x384.png' },
  { size: 512, filename: 'android-chrome-512x512.png' },
  { size: 60, filename: 'apple-touch-icon-60x60.png' },
  { size: 76, filename: 'apple-touch-icon-76x76.png' },
  { size: 120, filename: 'apple-touch-icon-120x120.png' },
  { size: 152, filename: 'apple-touch-icon-152x152.png' },
  { size: 180, filename: 'apple-touch-icon-180x180.png' },
  { size: 180, filename: 'apple-touch-icon.png' },
  { size: 150, filename: 'mstile-150x150.png' },
  { size: 16, filename: 'favicon-16x16.png' },
  { size: 32, filename: 'favicon-32x32.png' },
  { size: 96, filename: 'favicon-96x96.png' },
];

// Maskable icons require a larger safe zone (logo at ~60% of canvas, centered)
// so platform-specific masks (circle, squircle, rounded square) don't clip content.
const maskableSizes = [
  { size: 192, filename: 'maskable-icon-192x192.png' },
  { size: 512, filename: 'maskable-icon-512x512.png' },
];

// Screenshots for richer PWA install UI (wide = desktop, narrow = mobile).
const screenshots = [
  { width: 1280, height: 720, filename: 'screenshot-wide.png', formFactor: 'wide' },
  { width: 720, height: 1280, filename: 'screenshot-narrow.png', formFactor: 'narrow' },
];

const svgPath = join(__dirname, '../public/icons/logo.svg');
const outputDir = join(__dirname, '../public/icons');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Check if SVG exists
if (!existsSync(svgPath)) {
  console.error(`❌ SVG file not found: ${svgPath}`);
  process.exit(1);
}

console.log('🎨 Generating PWA icons from logo...\n');

async function generateIcons() {
  try {
    const svgData = Buffer.from(readFileSync(svgPath)).toString('base64');

    for (const { size, filename } of sizes) {
      const outputFile = join(outputDir, filename);

      // Create a gradient background (cyan to blue)
      const gradientSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #06b6d4; stop-opacity: 1" />
            <stop offset="100%" style="stop-color: #3b82f6; stop-opacity: 1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#bg)" />
        <image href="data:image/svg+xml;base64,${svgData}" 
               x="${Math.round(size * 0.1)}" y="${Math.round(size * 0.1)}" 
               width="${Math.round(size * 0.8)}" height="${Math.round(size * 0.8)}" 
               preserveAspectRatio="xMidYMid meet" />
      </svg>`;

      const compositeBuffer = Buffer.from(gradientSvg);

      // Convert to PNG
      await sharp(compositeBuffer, { density: 300 }).resize(size, size, { fit: 'cover' }).png().toFile(outputFile);

      const stats = statSync(outputFile);
      console.log(`✅ Generated ${size}x${size} icon: ${filename} (${(stats.size / 1024).toFixed(1)}KB)`);
    }

    // Maskable icons: logo occupies inner ~60% of canvas (20% padding on each side)
    // to satisfy the 40% safe zone radius required by Android adaptive masks.
    for (const { size, filename } of maskableSizes) {
      const outputFile = join(outputDir, filename);
      const inner = Math.round(size * 0.6);
      const offset = Math.round((size - inner) / 2);

      const maskableSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #06b6d4; stop-opacity: 1" />
            <stop offset="100%" style="stop-color: #3b82f6; stop-opacity: 1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#bg)" />
        <image href="data:image/svg+xml;base64,${svgData}"
               x="${offset}" y="${offset}"
               width="${inner}" height="${inner}"
               preserveAspectRatio="xMidYMid meet" />
      </svg>`;

      await sharp(Buffer.from(maskableSvg), { density: 300 })
        .resize(size, size, { fit: 'cover' })
        .png()
        .toFile(outputFile);

      const stats = statSync(outputFile);
      console.log(`✅ Generated ${size}x${size} maskable icon: ${filename} (${(stats.size / 1024).toFixed(1)}KB)`);
    }

    // Screenshots for richer PWA install UI on desktop and mobile.
    const screenshotsDir = join(__dirname, '../public/screenshots');
    if (!existsSync(screenshotsDir)) {
      mkdirSync(screenshotsDir, { recursive: true });
    }

    for (const { width, height, filename } of screenshots) {
      const outputFile = join(screenshotsDir, filename);
      const logoSize = Math.round(Math.min(width, height) * 0.35);
      const logoX = Math.round((width - logoSize) / 2);
      const logoY = Math.round(height * 0.18);
      const titleY = logoY + logoSize + Math.round(height * 0.06);
      const subtitleY = titleY + Math.round(height * 0.055);
      const titleSize = Math.round(Math.min(width, height) * 0.055);
      const subtitleSize = Math.round(Math.min(width, height) * 0.028);

      const screenshotSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #06b6d4; stop-opacity: 1" />
            <stop offset="100%" style="stop-color: #3b82f6; stop-opacity: 1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bg)" />
        <image href="data:image/svg+xml;base64,${svgData}"
               x="${logoX}" y="${logoY}"
               width="${logoSize}" height="${logoSize}"
               preserveAspectRatio="xMidYMid meet" />
        <text x="50%" y="${titleY}" text-anchor="middle"
              font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
              font-size="${titleSize}" font-weight="700" fill="#ffffff">
          IHF Rules Quiz
        </text>
        <text x="50%" y="${subtitleY}" text-anchor="middle"
              font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
              font-size="${subtitleSize}" fill="#ffffff" fill-opacity="0.9">
          Test your handball knowledge
        </text>
      </svg>`;

      await sharp(Buffer.from(screenshotSvg), { density: 300 })
        .resize(width, height, { fit: 'cover' })
        .png()
        .toFile(outputFile);

      const stats = statSync(outputFile);
      console.log(`✅ Generated ${width}x${height} screenshot: ${filename} (${(stats.size / 1024).toFixed(1)}KB)`);
    }

    console.log('\n✨ Icon generation complete!');
  } catch (error) {
    console.error(`❌ Failed to generate icons:`, error.message);
    process.exit(1);
  }
}

generateIcons();
