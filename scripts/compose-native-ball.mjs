import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const branding = path.join(root, 'native/branding');
// Preserve the chosen checkmark and trails; replace the ball independently so
// later ball revisions cannot change the surrounding logo.
const base = await readFile(path.join(branding, 'handball-checkmark-v4.png'));
const { width, height } = await sharp(base).metadata();
const scale = width / 1280;
const mask = Buffer.from(`<svg width="${width}" height="${height}">
  <defs><mask id="removeBall">
    <rect width="100%" height="100%" fill="white"/>
    <circle cx="${938 * scale}" cy="${520 * scale}" r="${277 * scale}" fill="black"/>
  </mask></defs>
  <rect width="100%" height="100%" fill="white" mask="url(#removeBall)"/>
</svg>`);
const trails = await sharp(base)
  .composite([{ input: mask, blend: 'dest-in' }])
  .png()
  .toBuffer();
const size = Math.round(536 * scale);
const ball = await sharp(path.join(branding, 'handball-gold.png'))
  .trim()
  .resize(size, size, { fit: 'fill' })
  .png()
  .toBuffer();
await sharp(trails)
  .composite([{ input: ball, left: Math.round(670 * scale), top: Math.round(252 * scale) }])
  .png()
  .toFile(path.join(branding, 'handball-checkmark.png'));
console.log('Native mark composed with the separately illustrated reference ball.');
