import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'assets/logo.svg'), 'utf8');
const palette = { blue: '#2047A2', navy: '#00206D', gold: '#B78D15' };

// Reuse the website's existing artwork paths. Only native files are written.
const recolored = source
  .replaceAll('#06b6d4', palette.blue)
  .replaceAll('#3b82f6', palette.navy)
  .replace(/stop-color: #[0-9a-fA-F]{6}/g, (stop) =>
    /#(?:ffffff|f8f8f8|f0f0f0|e8e8e8|e0e0e0|ececec|e4e4e4)$/i.test(stop) ? 'stop-color: ' + palette.gold : stop
  );
const background = `
  <defs>
    <linearGradient id="nativeIconBackground" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.blue}"/>
      <stop offset="100%" stop-color="${palette.navy}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#nativeIconBackground)"/>`;
const markSvg = recolored.replace(/(<svg\b[^>]*>)/, '$1' + background);
const withName = (mark) => {
  const placed = mark.replace(
    '<svg x="286" y="132" width="452" height="760"',
    '<svg x="326" y="108" width="372" height="626"'
  );
  assert.ok(placed !== mark, 'Artwork placement must leave room for the app name.');
  const name =
    '\n  <text x="512" y="860" fill="#FFFFFF" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="80" font-weight="600" letter-spacing="0.5">Rules Quiz</text>\n</svg>\n';
  return placed.replace(/<\/svg>\s*$/, name);
};
const svg = withName(markSvg);
const paths = (value) => [...value.matchAll(/\bd="([^"]+)"/g)].map((match) => match[1]);
assert.ok(paths(source).length > 0, 'Source artwork paths must be present.');
assert.deepEqual(paths(svg), paths(source), 'Website artwork geometry must remain identical.');
assert.ok(svg.includes('<rect width="1024" height="1024"'), 'Opaque background must be present.');

const branding = path.join(root, 'native/branding');
const catalog = path.join(root, 'ios/App/App/Assets.xcassets');
const header = path.join(catalog, 'BrandMark.imageset');
await mkdir(branding, { recursive: true });
await mkdir(header, { recursive: true });
await writeFile(path.join(branding, 'app-icon.svg'), svg);
const icon = await sharp(Buffer.from(svg)).resize(1024, 1024).removeAlpha().png().toBuffer();
const headerIcon = await sharp(Buffer.from(markSvg)).resize(1024, 1024).removeAlpha().png().toBuffer();
// Dark Home Screen icons retain transparency so iOS supplies its own background.
// The in-app header flattens the same artwork onto the app's dark navy.
const darkMarkSvg = recolored.replaceAll(palette.gold, '#E8C259');
const darkSvg = withName(darkMarkSvg);
assert.deepEqual(paths(darkSvg), paths(source));
await writeFile(path.join(branding, 'app-icon-dark.svg'), darkSvg);
const darkIcon = await sharp(Buffer.from(darkSvg)).resize(1024, 1024).png().toBuffer();
const darkHeaderIcon = await sharp(Buffer.from(darkMarkSvg)).resize(1024, 1024).png().toBuffer();
const darkMetadata = await sharp(darkIcon).metadata();
assert.equal(darkMetadata.width, 1024);
assert.equal(darkMetadata.height, 1024);
assert.equal(darkMetadata.hasAlpha, true);
const metadata = await sharp(icon).metadata();
assert.equal(metadata.width, 1024);
assert.equal(metadata.height, 1024);
assert.equal(metadata.hasAlpha, false, 'App Store icon must be opaque.');
await writeFile(path.join(catalog, 'AppIcon.appiconset/AppIcon-512@2x.png'), icon);
await writeFile(path.join(catalog, 'AppIcon.appiconset/AppIcon-Dark.png'), darkIcon);
await writeFile(
  path.join(catalog, 'AppIcon.appiconset/Contents.json'),
  JSON.stringify(
    {
      images: [
        { idiom: 'universal', size: '1024x1024', filename: 'AppIcon-512@2x.png', platform: 'ios' },
        {
          idiom: 'universal',
          size: '1024x1024',
          filename: 'AppIcon-Dark.png',
          platform: 'ios',
          appearances: [{ appearance: 'luminosity', value: 'dark' }],
        },
      ],
      info: { author: 'xcode', version: 1 },
    },
    null,
    2
  ) + '\n'
);
for (const scale of [1, 2, 3]) {
  await sharp(headerIcon)
    .resize(32 * scale, 32 * scale)
    .png()
    .toFile(path.join(header, `BrandMark@${scale}x.png`));
  await sharp(darkHeaderIcon)
    .flatten({ background: '#001235' })
    .removeAlpha()
    .resize(32 * scale, 32 * scale)
    .png()
    .toFile(path.join(header, `BrandMark-Dark@${scale}x.png`));
}
await writeFile(
  path.join(header, 'Contents.json'),
  JSON.stringify(
    {
      images: [1, 2, 3].flatMap((scale) => [
        { filename: `BrandMark@${scale}x.png`, idiom: 'universal', scale: `${scale}x` },
        {
          filename: `BrandMark-Dark@${scale}x.png`,
          idiom: 'universal',
          scale: `${scale}x`,
          appearances: [{ appearance: 'luminosity', value: 'dark' }],
        },
      ]),
      info: { author: 'xcode', version: 1 },
    },
    null,
    2
  ) + '\n'
);
console.log(
  'Light/dark native icons and header marks generated; original geometry preserved; 1024px icon sizes and alpha verified.'
);
