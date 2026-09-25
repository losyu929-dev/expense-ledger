import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = (...parts) => path.join(root, 'web', ...parts);
const outDir = path.join(root, 'apps-script');

const html = fs.readFileSync(web('index.html'), 'utf8');
const css = fs.readFileSync(web('style.css'), 'utf8');
// Use a function callback for replace — app.js contains `$'` which breaks
// String.replace when the second argument is a plain replacement string.
const app = fs.readFileSync(web('app.js'), 'utf8').replaceAll('fetch(', 'ledgerFetch(');
const icon = fs.readFileSync(web('icon.svg'), 'utf8');
const iconUrl = 'data:image/svg+xml;base64,' + Buffer.from(icon).toString('base64');
const bridge = `
function gasCall(name, value) {
  return new Promise((resolve, reject) => {
    let runner = google.script.run.withSuccessHandler(resolve).withFailureHandler(reject);
    value === undefined ? runner[name]() : runner[name](value);
  });
}
async function ledgerFetch(path, options = {}) {
  if (path === '/api/ledger') {
    const result = await gasCall('getLedger');
    return {ok: result?.live === true, json: async () => result};
  }
  if (path === '/api/transaction') {
    const payload = JSON.parse(options.body || '{}');
    const result = await gasCall('saveTransaction', payload);
    return {ok: result?.ok === true, json: async () => result};
  }
  throw new Error('unsupported_request');
}
`;

let output = html
  .replace('<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">', '')
  .replace(/<link rel="manifest"[^>]*>/, '')
  .replace(/<link rel="icon"[^>]*>/, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>/, `<link rel="apple-touch-icon" href="${iconUrl}">`)
  .replace('<link rel="stylesheet" href="/style.css">', `<style>${css}</style>`)
  .replace('src="/icon.svg"', `src="${iconUrl}"`)
  .replace('<script type="module" src="/app.js"></script>', () => `<script>${bridge}</script><script type="module">${app}</script>`);

fs.mkdirSync(outDir, {recursive: true});
fs.writeFileSync(path.join(outDir, 'Index.html'), output);
console.log('Built apps-script/Index.html (' + output.length + ' bytes)');
