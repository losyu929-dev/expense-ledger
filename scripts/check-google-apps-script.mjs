import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const code = fs.readFileSync(path.join(root, 'apps-script', 'Code.gs'), 'utf8');
const page = fs.readFileSync(path.join(root, 'apps-script', 'Index.html'), 'utf8');
const webIndex = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
const bundled = code + '\n' + page + '\n' + webIndex;

assert.match(code, /function doGet\(\)/);
assert.match(code, /function getLedger\(\)/);
assert.match(code, /function saveTransaction\(p\)/);
assert.match(code, /function setSpreadsheetId_\(/);
assert.doesNotMatch(code, /function setSpreadsheetId\(/);
assert.match(code, /function getSpreadsheetId_\(\)/);
assert.match(code, /PropertiesService\.getScriptProperties\(\)/);
assert.match(code, /getProperty\('SPREADSHEET_ID'\)/);
assert.match(code, /LockService\.getScriptLock/);
assert.match(code, /User confirmed/);
assert.doesNotMatch(code, /const\s+DASHBOARD_SPREADSHEET_ID\s*=/);

// Personal IDs / secrets must not appear in the public package.
// Generic patterns only: no real IDs are stored in this repo.
const bannedPatterns = [
  [/AKfycb[\w-]{20,}/, 'Apps Script deployment ID'],
  [/docs\.google\.com\/spreadsheets\/d\/[\w-]{25,}/, 'Google Sheet URL'],
  [/['"`][\w-]{44}['"`]/, 'hardcoded 44-char ID (looks like a Sheet ID)'],
  [/[\w.+-]+@(gmail|googlemail|outlook|hotmail|yahoo|icloud)\.com/i, 'personal email address'],
  [/\.chatgpt\.site/i, 'ChatGPT Sites URL'],
  [/LEDGER_TOKEN\s*[:=]/, 'hardcoded token assignment'],
];
for (const [re, label] of bannedPatterns) {
  assert.doesNotMatch(bundled, re, 'banned content present: ' + label);
}
// Optional extra exact strings (e.g. your own Sheet ID) can go in
// scripts/.private-denylist (one per line). That file is gitignored.
const denyFile = path.join(root, 'scripts', '.private-denylist');
if (fs.existsSync(denyFile)) {
  const everything = bundled + fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  for (const line of fs.readFileSync(denyFile, 'utf8').split(/\r?\n/).map(x => x.trim()).filter(Boolean)) {
    assert.equal(everything.includes(line), false, 'private denylist entry present');
  }
}

assert.match(page, /google\.script\.run/);
assert.match(page, /gasCall\('getLedger'\)/);
assert.match(page, /gasCall\('saveTransaction'/);
assert.doesNotMatch(page, /fetch\('\/api\//);
assert.match(page, /我的記帳簿/);
assert.match(page, /\$'\+money\(income\)/);
assert.equal((page.match(/<\/body><\/html>/g) || []).length, 1);
console.log('PASS public Google Apps Script package: Script Properties, no personal IDs/tokens, money strings intact');
