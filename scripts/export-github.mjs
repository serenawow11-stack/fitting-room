import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { audit, roots } from './check-public.mjs';
await audit();
const destination = path.join('release', `github-source-${new Date().toISOString().replace(/[:.]/g, '-')}`);
await mkdir(destination, { recursive: true });
for (const name of roots) await cp(name, path.join(destination, name), { recursive: true });
console.log(`Exported fresh source (no repository history, credentials or hosting identity): ${destination}`);
console.log('Read ASSETS.md before making supplied reference imagery public.');
