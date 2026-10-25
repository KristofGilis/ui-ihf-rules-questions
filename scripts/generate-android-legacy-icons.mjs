import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = fileURLToPath(new URL('../public/icons/android-chrome-512x512.png', import.meta.url));
const res = fileURLToPath(new URL('../android/app/src/main/res/', import.meta.url));

for (const [density, size] of Object.entries({ ldpi: 36, mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 })) {
  const folder = `${res}/mipmap-${density}`;
  const roundMask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
  );

  await sharp(source).resize(size, size).png().toFile(`${folder}/ic_launcher.png`);
  await sharp(source)
    .resize(size, size)
    .composite([{ input: roundMask, blend: 'dest-in' }])
    .png()
    .toFile(`${folder}/ic_launcher_round.png`);
}
