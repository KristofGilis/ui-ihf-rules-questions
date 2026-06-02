import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const generated = readFileSync('graphql/generated.ts');
const hash = createHash('sha256').update(generated).digest('hex').slice(0, 12);

const versionFile = 'src/version.ts';
const content = readFileSync(versionFile, 'utf8');
const updated = content.replace(/__SCHEMA_VERSION__|'[0-9a-f]{12}'(?=;\s*\/\/ schema)/, `'${hash}'`);

// Replace placeholder or previously injected hash
const result = updated.includes('__SCHEMA_VERSION__')
  ? updated.replace('__SCHEMA_VERSION__', hash)
  : content.replace(/SCHEMA_VERSION = '[0-9a-f]{12}'/, `SCHEMA_VERSION = '${hash}'`);

writeFileSync(versionFile, result);
console.log(`[inject-schema-version] SCHEMA_VERSION = ${hash}`);
