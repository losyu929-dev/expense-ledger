# Apps Script 部署步驟

呢個資料夾係可以貼入 Google Apps Script 專案嘅檔案。

## 檔案

| 檔案 | 用途 |
|------|------|
| `Code.gs` | `doGet`、`getLedger`、`saveTransaction`、`setSpreadsheetId_`（私有）|
| `Index.html` | 由 `web/` 用 `npm run build` 產生嘅完整 Dashboard |
| `appsscript.json` | 時區 `Asia/Hong_Kong`、Web App 預設 Only myself |

## 部署（摘要）

1. 喺 [script.google.com](https://script.google.com) 開新專案。
2. 刪除預設 `Code.gs` 內容，貼上本資料夾嘅 `Code.gs`。
3. 新增 HTML 檔，命名為 **`Index`**（唔好叫 Index.html；Apps Script 會自動加副檔名），貼上 `Index.html` 全部內容。
4. （可選）Project Settings → 貼上 `appsscript.json`，或喺編輯器手動設 timezone。
5. 專案設定 → Script properties 新增 `SPREADSHEET_ID` = 你的試算表 ID。
6. **Deploy → New deployment → Web app**
   - Execute as：**Me**
   - Who has access：**Only myself**（最安全）或見主 README 權衡說明
7. 授權存取 Google Sheets，開啟 `/exec` 網址測試。

重新產生 `Index.html`：

```bash
cd /path/to/expense-ledger-public
npm run build
npm run check
```

然後再貼一次新嘅 `Index.html` 內容，並 **Manage deployments → Edit → New version**。
