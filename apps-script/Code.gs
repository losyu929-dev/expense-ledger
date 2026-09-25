/**
 * Expense Ledger Dashboard — Google Apps Script backend
 *
 * Spreadsheet ID is read from Script Properties (key: SPREADSHEET_ID).
 * Set it once under Project Settings → Script properties → SPREADSHEET_ID = <your sheet id>
 * (or call setSpreadsheetId_(id) from a temporary function in the editor).
 *
 * Default display timezone for timestamps: Asia/Hong_Kong
 * (Transaction Date uses the spreadsheet's own timezone.)
 * To change Apps Script project timezone: appsscript.json → timeZone
 * To change spreadsheet timezone: File → Settings in Google Sheets.
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('我的記帳簿')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

/**
 * Store Spreadsheet ID in Script Properties after basic validation.
 * Private (trailing underscore) so the web page cannot call it via google.script.run.
 * To use: temporarily add  function tmpSetup(){ setSpreadsheetId_('YOUR_SHEET_ID'); }
 * run tmpSetup once, then delete it.
 */
function setSpreadsheetId_(id) {
  const value = String(id || '').trim();
  if (!/^[a-zA-Z0-9-_]{20,}$/.test(value)) {
    throw new Error('Invalid spreadsheet id. Paste the ID from your Sheet URL (between /d/ and /edit).');
  }
  // Verify the sheet is reachable with this account before saving.
  SpreadsheetApp.openById(value);
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', value);
  return 'OK: SPREADSHEET_ID saved (' + value.length + ' chars).';
}

/** @private */
function getSpreadsheetId_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) {
    throw new Error(
      'Missing Script Property SPREADSHEET_ID. ' +
      'Set it under Project Settings → Script properties (key SPREADSHEET_ID).'
    );
  }
  return id;
}

function getLedger() {
  const ss = SpreadsheetApp.openById(getSpreadsheetId_());
  const read = (name, width) => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) throw new Error('Missing ledger tab: ' + name);
    const rows = sheet.getRange(1, 1, Math.max(1, sheet.getLastRow()), width).getValues();
    while (rows.length > 1 && !rows[rows.length - 1][0]) rows.pop();
    return rows.map(row => row.map((value, index) => value instanceof Date
      ? Utilities.formatDate(
          value,
          name === 'Transactions' && index === 1 ? ss.getSpreadsheetTimeZone() : 'Asia/Hong_Kong',
          name === 'Transactions' && index === 1 ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm:ssXXX"
        )
      : value));
  };
  return {
    live: true,
    transactions: read('Transactions', 26),
    events: read('Source Events', 16),
    fetchedAt: new Date().toISOString()
  };
}

function saveTransaction(p) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return {ok: false, error: 'busy'};
  try {
    const types = ['Income', 'Expense', 'Refund', 'Transfer', 'CardRepayment'];
    const categories = ['Dining', 'Groceries', 'Transport', 'Shopping', 'Subscriptions', 'Bills', 'Health', 'Home', 'Entertainment', 'Travel', 'Pets', 'Other'];
    if (!p || !types.includes(p.type) || !categories.includes(p.category) || typeof p.amount !== 'number' || !isFinite(p.amount) || p.amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(p.date) || isNaN(Date.parse(p.date)) || !/^[A-Z]{3}$/.test(p.currency)) return {ok: false, error: 'invalid_fields'};
    for (const key of ['merchant', 'remark', 'items', 'payment_method', 'card_last4']) {
      if (typeof p[key] !== 'string' || p[key].length > (key === 'remark' || key === 'items' ? 2000 : 200)) return {ok: false, error: 'invalid_fields'};
    }
    if (!p.merchant.trim()) return {ok: false, error: 'invalid_fields'};

    const ss = SpreadsheetApp.openById(getSpreadsheetId_());
    const ts = ss.getSheetByName('Transactions');
    const es = ss.getSheetByName('Source Events');
    if (!ts || !es) return {ok: false, error: 'missing_tabs'};
    const tv = ts.getDataRange().getValues();
    const ev = es.getDataRange().getValues();
    let eventIndex = -1;
    let transactionIndex = -1;
    let id = p.transaction_id;

    if (p.event_id) {
      eventIndex = ev.findIndex((row, index) => index > 0 && row[0] === p.event_id);
      if (eventIndex < 0) return {ok: false, error: 'not_found'};
      if (ev[eventIndex][11]) return {ok: false, error: 'conflict'};
      id = 'TX-' + p.event_id;
    } else {
      transactionIndex = tv.findIndex((row, index) => index > 0 && row[0] === id);
      if (transactionIndex < 0) return {ok: false, error: 'not_found'};
      const previous = tv[transactionIndex][23] instanceof Date
        ? Utilities.formatDate(tv[transactionIndex][23], 'Asia/Hong_Kong', "yyyy-MM-dd'T'HH:mm:ssXXX")
        : String(tv[transactionIndex][23]);
      if (previous !== p.expected_updated_at) return {ok: false, error: 'conflict'};
    }
    if (eventIndex >= 0 && tv.some(row => row[0] === id)) return {ok: false, error: 'conflict'};

    const now = new Date().toISOString();
    const row = transactionIndex >= 0 ? tv[transactionIndex].slice(0, 24) : Array(24).fill('');
    const safe = value => /^[=+@-]/.test(String(value)) ? "'" + value : value;
    row[0] = id;
    row[1] = p.date;
    row[3] = p.type;
    row[4] = Math.round(p.amount * 100) / 100;
    row[5] = p.currency;
    row[6] = safe(p.merchant.trim());
    row[8] = p.category;
    row[9] = safe(p.items);
    row[10] = safe(p.payment_method);
    row[11] = safe(p.card_last4);
    row[13] = safe(p.remark);
    row[15] = 'Confirmed';
    row[17] = 'User confirmed';
    row[21] = 'Yes';
    row[23] = now;

    if (eventIndex >= 0) {
      row[7] = safe(ev[eventIndex][7] || p.merchant);
      row[16] = typeof ev[eventIndex][14] === 'number' ? ev[eventIndex][14] : '';
      row[18] = 1;
      row[19] = p.type === 'Refund' ? 'Refund' : 'No';
      row[22] = now;
      transactionIndex = Math.max(1, tv.reduce((last, current, index) => current[0] ? index : last, 0)) + 1;
    }

    const sheetRow = transactionIndex + 1;
    // Text format for Date, Card Last4, Created At, Updated At (1-based columns B, L, W, X).
    ts.getRange(sheetRow, 2).setNumberFormat('@');
    ts.getRange(sheetRow, 12).setNumberFormat('@');
    ts.getRange(sheetRow, 23).setNumberFormat('@');
    ts.getRange(sheetRow, 24).setNumberFormat('@');
    // Write A–N then P–X; never overwrite array-formula columns O / Y / Z.
    ts.getRange(sheetRow, 1, 1, 14).setValues([row.slice(0, 14)]);
    ts.getRange(sheetRow, 16, 1, 9).setValues([row.slice(15, 24)]);

    if (eventIndex >= 0) {
      es.getRange(eventIndex + 1, 12).setValue(id);
      es.getRange(eventIndex + 1, 14).setValue('Matched');
      const queue = ss.getSheetByName('Review Queue');
      if (queue) {
        queue.getDataRange().getValues().forEach((queueRow, index) => {
          if (index && queueRow[3] === p.event_id) queue.getRange(index + 1, 12, 1, 2).setValues([['Yes', 'User confirmed in dashboard ' + now]]);
        });
      }
    }
    SpreadsheetApp.flush();
    return {ok: true, transaction_id: id, updated_at: now};
  } catch (error) {
    console.error('Dashboard save: ' + error.message);
    return {ok: false, error: 'save_failed'};
  } finally {
    lock.releaseLock();
  }
}
