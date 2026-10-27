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
const launchMark = path.join(catalog, 'LaunchMark.imageset');
const launchBackground = path.join(catalog, 'LaunchBackground.colorset');
await mkdir(header, { recursive: true });
await mkdir(launchMark, { recursive: true });
await mkdir(launchBackground, { recursive: true });
await writeFile(path.join(appIcon, 'AppIcon-512@2x.png'), light);
await writeFile(path.join(appIcon, 'AppIcon-Dark.png'), dark);
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const info = { author: 'xcode', version: 1 };
const appearance = [{ appearance: 'luminosity', value: 'dark' }];
for (const scale of [1, 2, 3]) {
  await writeFile(
    path.join(launchMark, 'LaunchMark@' + scale + 'x.png'),
    await sharp(foreground)
      .resize(160 * scale, 160 * scale)
      .png()
      .toBuffer()
  );
}
await writeFile(
  path.join(launchMark, 'Contents.json'),
  json({
    images: [1, 2, 3].map((scale) => ({
      filename: 'LaunchMark@' + scale + 'x.png',
      idiom: 'universal',
      scale: scale + 'x',
    })),
    info,
  })
);
const launchColor = (red, green, blue) => ({ 'color-space': 'srgb', components: { red, green, blue, alpha: '1.000' } });
await writeFile(
  path.join(launchBackground, 'Contents.json'),
  json({
    colors: [
      { idiom: 'universal', color: launchColor('0.949019608', '0.949019608', '0.968627451') },
      { idiom: 'universal', appearances: appearance, color: launchColor('0.000', '0.000', '0.000') },
    ],
    info,
  })
);
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
// The toolbar mark uses its own tight bounds; app-icon padding makes it too small.
for (const scale of [1, 2, 3]) {
  const headerImage = await sharp(source)
    .trim()
    .resize(40 * scale, 40 * scale, { fit: 'contain', background: '#00000000' })
    .png()
    .toBuffer();
  assert.equal((await sharp(headerImage).metadata()).hasAlpha, true);
  const pixels = await sharp(headerImage).raw().toBuffer();
  assert.equal(pixels[3], 0, 'Header corners must be transparent');
  await writeFile(path.join(header, 'BrandMark@' + scale + 'x.png'), headerImage);
  await writeFile(path.join(header, 'BrandMark-Dark@' + scale + 'x.png'), headerImage);
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
console.log('Native assets generated; opaque 1024px app icons and transparent header marks verified.');
