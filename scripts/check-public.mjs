import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
export const roots = ['src', 'public', 'tests', 'scripts', '.github', 'index.html', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.json', 'vite.config.ts', 'vitest.config.ts', 'components.json', '.gitignore', 'README.md', 'ASSETS.md', 'CODE_REVIEW.md', 'THIRD_PARTY_NOTICES.md'];
const rules = [
  ['local-path', new RegExp('/' + '(?:Users|var/folders|home)/')],
  ['private-key', new RegExp('BEGIN ' + '(?:RSA |EC |OPENSSH )?PRIVATE KEY')],
  ['credential', new RegExp('(?:sk' + '-[a-zA-Z0-9_-]{20,}|gh' + '[pousr]_[a-zA-Z0-9]{20,})')],
  ['deployment-identity', new RegExp('appg' + '(?:prj|dep|ver)_|git\\.chatgpt-team\\.site')],
];
export async function filesAt(root) {
  if ((await stat(root)).isDirectory()) return (await Promise.all((await readdir(root)).map(name => filesAt(path.join(root, name))))).flat();
  return [root];
}
export async function audit() {
  const files = (await Promise.all(roots.map(filesAt))).flat();
  const failures = [];
  for (const file of files) {
    if (!/\.(?:tsx?|mjs|json|ya?ml|md|css|html)$/.test(file)) continue;
    const content = await readFile(file, 'utf8');
    for (const [rule, pattern] of rules) if (pattern.test(content)) failures.push({ file, rule });
  }
  if (failures.length) throw new Error(JSON.stringify(failures));
  return files.length;
}
if (process.argv[1]?.endsWith('check-public.mjs')) console.log(`Public-source pattern checks passed (${await audit()} files). This is not a license clearance or a complete security audit.`);
