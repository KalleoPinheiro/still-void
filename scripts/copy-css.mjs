import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');

await mkdir(dist, { recursive: true });
await copyFile(path.join(root, 'src/css/theme.css'), path.join(dist, 'theme.css'));
await copyFile(path.join(root, 'src/css/style.css'), path.join(dist, 'style.css'));
console.log('CSS copied to dist/');
