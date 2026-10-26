import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const branding = path.join(root, 'native/branding');
// Option A: handball, checkmark and motion trails in the native app palette.
// Keep the generated foreground as the source so regeneration is deterministic.
const source = await readFile(path.join(branding, 'handball-checkmark.png'));
const foreground = await sharp(source)
  .trim()
  .resize(800, 800, { fit: 'contain', background: '#00000000' })
  .extend({ top: 112, bottom: 112, left: 112, right: 112, background: '#00000000' })
  .png()
  .toBuffer();
const withBackground = (start, end) => {
  const background =
    '<defs><linearGradient id="nativeBackground" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="' +
    start +
    '"/><stop offset="100%" stop-color="' +
    end +
    '"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#nativeBackground)"/>';
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">' +
    background +
    '<image width="1024" height="1024" href="data:image/png;base64,' +
    foreground.toString('base64') +
    '"/></svg>'
  );
};
const lightSvg = withBackground('#FFFFFF', '#F1F5F9');
const darkSvg = withBackground('#001235', '#000918');
await writeFile(path.join(branding, 'app-icon.svg'), lightSvg);
await writeFile(path.join(branding, 'app-icon-dark.svg'), darkSvg);
const light = await sharp(Buffer.from(lightSvg)).resize(1024, 1024).removeAlpha().png().toBuffer();
const dark = await sharp(Buffer.from(darkSvg)).resize(1024, 1024).removeAlpha().png().toBuffer();
for (const buffer of [light, dark]) {
  const metadata = await sharp(buffer).metadata();
  assert.equal(metadata.width, 1024);
  assert.equal(metadata.height, 1024);
  assert.equal(metadata.hasAlpha, false);
}
const catalog = path.join(root, 'ios/App/App/Assets.xcassets');
const appIcon = path.join(catalog, 'AppIcon.appiconset');
const header = path.join(catalog, 'BrandMark.imageset');
await mkdir(header, { recursive: true });
await writeFile(path.join(appIcon, 'AppIcon-512@2x.png'), light);
await writeFile(path.join(appIcon, 'AppIcon-Dark.png'), dark);
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const info = { author: 'xcode', version: 1 };
const appearance = [{ appearance: 'luminosity', value: 'dark' }];
await writeFile(
  path.join(appIcon, 'Contents.json'),
  json({
    images: [
      { idiom: 'universal', size: '1024x1024', filename: 'AppIcon-512@2x.png', platform: 'ios' },
      { idiom: 'universal', size: '1024x1024', filename: 'AppIcon-Dark.png', platform: 'ios', appearances: appearance },
    ],
    info,
  })
);
for (const scale of [1, 2, 3]) {
  await sharp(light)
    .resize(32 * scale, 32 * scale)
    .png()
    .toFile(path.join(header, 'BrandMark@' + scale + 'x.png'));
  await sharp(dark)
    .resize(32 * scale, 32 * scale)
    .png()
    .toFile(path.join(header, 'BrandMark-Dark@' + scale + 'x.png'));
}
await writeFile(
  path.join(header, 'Contents.json'),
  json({
    images: [1, 2, 3].flatMap((scale) => [
      { filename: 'BrandMark@' + scale + 'x.png', idiom: 'universal', scale: scale + 'x' },
      {
        filename: 'BrandMark-Dark@' + scale + 'x.png',
        idiom: 'universal',
        scale: scale + 'x',
        appearances: appearance,
      },
    ]),
    info,
  })
);
if (process.argv.includes('--preview')) {
  const previews = path.join(root, 'native/previews');
  await mkdir(previews, { recursive: true });
  const a = await sharp(light).resize(420, 420).png().toBuffer();
  const b = await sharp(dark).resize(420, 420).png().toBuffer();
  const labels = Buffer.from(
    '<svg width="920" height="510"><g font-family="Arial" font-size="22" fill="#00206D" text-anchor="middle"><text x="235" y="35">Light</text><text x="685" y="35">Dark</text></g></svg>'
  );
  await sharp({ create: { width: 920, height: 510, channels: 3, background: '#f2f2f7' } })
    .composite([
      { input: a, left: 25, top: 60 },
      { input: b, left: 475, top: 60 },
      { input: labels, left: 0, top: 0 },
    ])
    .png()
    .toFile(path.join(previews, 'app-icon-appearances.png'));
}
console.log('Handball/checkmark native assets generated; 1024px size and opaque light/dark icons verified.');
