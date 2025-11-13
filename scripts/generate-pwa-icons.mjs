#!/usr/bin/env node

/**
 * Script to generate PWA icons from the SVG logo using sharp
 * Requires: npm install sharp --save-dev
 */

import { existsSync, mkdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const sizes = [
  { size: 192, filename: 'android-chrome-192x192.png' },
  { size: 256, filename: 'android-chrome-256x256.png' },
  { size: 512, filename: 'android-chrome-512x512.png' },
  { size: 60, filename: 'apple-touch-icon-60x60.png' },
  { size: 76, filename: 'apple-touch-icon-76x76.png' },
  { size: 120, filename: 'apple-touch-icon-120x120.png' },
  { size: 152, filename: 'apple-touch-icon-152x152.png' },
  { size: 180, filename: 'apple-touch-icon-180x180.png' },
  { size: 180, filename: 'apple-touch-icon.png' },
  { size: 150, filename: 'mstile-150x150.png' },
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
        <image href="data:image/svg+xml;base64,${Buffer.from(readFileSync(svgPath)).toString('base64')}" 
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

    console.log('\n✨ Icon generation complete!');
  } catch (error) {
    console.error(`❌ Failed to generate icons:`, error.message);
    process.exit(1);
  }
}

generateIcons();
