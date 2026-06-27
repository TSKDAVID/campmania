import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'brand-logo-source.svg');
const target = path.join(root, 'app', 'assets', 'favicon.svg');
const publicTarget = path.join(root, 'public', 'favicon.svg');

if (!fs.existsSync(source)) {
  console.error('Missing brand-logo-source.svg at project root.');
  process.exit(1);
}

fs.copyFileSync(source, target);

const svg = fs.readFileSync(target, 'utf8');
const normalized = svg
  .replace(/<\?xml[^>]*>\s*/i, '')
  .replace(
    /<svg[^>]*>/i,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 985 985">',
  );
fs.writeFileSync(target, normalized);
fs.mkdirSync(path.dirname(publicTarget), {recursive: true});
fs.writeFileSync(publicTarget, normalized);

console.log(`Copied ${source} -> ${target}`);
console.log(`Copied ${source} -> ${publicTarget}`);
