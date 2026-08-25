import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');

await mkdir(dist, { recursive: true });
await copyFile(path.join(root, 'src/css/theme.css'), path.join(dist, 'theme.css'));
await copyFile(path.join(root, 'src/css/style.css'), path.join(dist, 'style.css'));
await copyFile(path.join(root, 'src/css/tailwind.css'), path.join(dist, 'tailwind.css'));
// Opt-in only: shadcn-overrides.css applies box-shadow: none !important to
// bare button/input/select/textarea selectors, so it is copied and given a
// subpath export but never imported by theme.css or style.css.
await copyFile(
  path.join(root, 'src/css/shadcn-overrides.css'),
  path.join(dist, 'shadcn-overrides.css'),
);
console.log('CSS copied to dist/');
