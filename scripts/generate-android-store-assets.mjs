import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'native/store/google-play');
await mkdir(output, { recursive: true });

// Reuse the actual app icon; Google Play applies its own corner mask.
await sharp(path.join(root, 'native/branding/app-icon.svg'))
  .resize(512, 512)
  .removeAlpha()
  .png()
  .toFile(path.join(output, 'app-icon.png'));

const mark = await sharp(path.join(root, 'native/branding/handball-checkmark.png'))
  .trim()
  .resize(330, 330, { fit: 'inside' })
  .png()
  .toBuffer();
const graphic = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="background" x2="1" y2="1">
    <stop stop-color="#00206D"/><stop offset="1" stop-color="#001235"/>
  </linearGradient></defs>
  <rect width="1024" height="500" fill="url(#background)"/>
  <path d="M650 0H1024V500H650" fill="#2047A2" opacity=".25"/>
  <rect x="72" y="112" width="64" height="5" rx="2.5" fill="#B78D15"/>
  <g fill="white" font-family="Arial, sans-serif" font-weight="700" font-size="60">
    <text x="72" y="200">Handball</text>
    <text x="72" y="274">Rules Quiz</text>
  </g>
  <image x="625" y="85" width="330" height="330" href="data:image/png;base64,${mark.toString('base64')}"/>
</svg>`;
await writeFile(path.join(output, 'feature-graphic.svg'), graphic);
await sharp(Buffer.from(graphic)).removeAlpha().png().toFile(path.join(output, 'feature-graphic.png'));

for (const name of ['app-icon.png', 'feature-graphic.png']) {
  const buffer = await readFile(path.join(output, name));
  const { width, height, hasAlpha } = await sharp(buffer).metadata();
  console.log(`${name}: ${width}x${height}, opaque=${!hasAlpha}, ${buffer.length} bytes`);
}
