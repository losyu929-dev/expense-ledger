# 我的記帳簿 — 自架 Google Apps Script 版

個人開支 Dashboard：資料放你自己嘅 **Google Sheet**，介面用 **Google Apps Script Web App** 托管。  
**呢個唔係 multi-tenant SaaS**——每一個人要自己複製、自己部署、自己保管 Sheet。

語言：繁體中文（香港）。短英文摘要喺文末。

---

## 你會得到咩

- 手機優先 Dashboard（總覽、待核實、卡與渠道、分類分析）
- 直接讀寫你嘅 Sheet（唔使另外嘅 API token 暴露俾瀏覽器）
- 收入可喺畫面隱藏（只係 UI，唔係權限控制）
- MIT 授權、可自檢嘅 build／check script

**唔包含：** iPhone Shortcut 收件、銀行 webhook、AI 自動入帳、真實個人資料、任何人嘅 Spreadsheet ID。

---

## 目錄結構

```text
expense-ledger-public/
  README.md
  LICENSE
  SECURITY.md
  package.json
  .gitignore
  apps-script/          ← 貼入 Apps Script 嘅成品
    Code.gs
    Index.html          ← npm run build 產生
    appsscript.json
    README.md
  web/                  ← UI 原始碼
  scripts/
    build-google-apps-script.mjs
    check-google-apps-script.mjs
  docs/
    SHEET-SCHEMA.md
    ARCHITECTURE.md
  sheet-template/       ← 空白表頭（無真實交易）
```

---

## 自架步驟（由零開始）

### 0. 準備

- 一個 Google 帳戶
- 本機 Node.js 18+（只係用來 build／check；部署本身唔使長期跑 Node）
- （可選）複製本 repo

```bash
cd expense-ledger-public
npm run build
npm run check
```

成功會見到 `PASS public Google Apps Script package...`。

### 1. 建立 Google Sheet

1. 開新試算表，建議名稱例如「我的記帳簿」。
2. 檔案 → 設定 → 時區選 **香港**（`Asia/Hong_Kong`）。
3. 按 [`docs/SHEET-SCHEMA.md`](docs/SHEET-SCHEMA.md) 同 [`sheet-template/HEADERS.md`](sheet-template/HEADERS.md) 建立最少兩個分頁：
   - **`Transactions`**（26 列表頭）
   - **`Source Events`**（16 列表頭）
4. （可選）`Review Queue`、`Config`。
5. 由瀏覽器網址複製 **Spreadsheet ID**（`/d/` 同 `/edit` 中間嗰段）。**唔好**把 ID 寫進公開 git。

你可以暫時得表頭、冇資料；或者加入文件用嘅 `EXAMPLE-` 列做畫面測試（唔會計入統計）。

### 2. 建立 Apps Script 專案

1. 開 [script.google.com](https://script.google.com) → 新專案。
2. 將預設程式碼換成 `apps-script/Code.gs` 全部內容。
3. 新增檔案 → **HTML** → 名稱必須叫 **`Index`**（唔好加 `.html` 後綴）。
4. 貼上 `apps-script/Index.html` 全部內容（先 `npm run build`）。
5. （建議）專案設定 → 顯示 `appsscript.json`，貼上本包嘅 `appsscript.json`（時區 `Asia/Hong_Kong`）。

### 3. 設定 `SPREADSHEET_ID`

**方法 A（推薦）：** 專案設定 → Script properties → 新增：

| Property | Value |
|----------|--------|
| `SPREADSHEET_ID` | 你嘅試算表 ID |

**方法 B：** 喺編輯器暫時加一個函式 `function tmpSetup(){ setSpreadsheetId_('把你的試算表ID貼喺呢度'); }`，執行一次（會驗證格式同試開 Sheet），之後刪走 `tmpSetup`。`setSpreadsheetId_` 結尾有底線，所以網頁唔可以經 `google.script.run` 呼叫佢。

`Code.gs` **冇**寫死任何個人 Sheet ID。若缺少呢個 property，讀寫會拋出清楚錯誤。

### 4. 部署 Web App

1. **Deploy → New deployment**
2. 類型：**Web app**
3. 說明：例如 `ledger-dashboard-v1`
4. **Execute as：Me**（以你身份存取你嘅 Sheet）
5. **Who has access：** 見下面權衡
6. Deploy → 用 Google 帳戶授權 Sheets／所需權限
7. 複製 **Web app URL**（通常以 `/exec` 結尾），用同一個 Google 帳戶開啟

#### Who has access 權衡

| 選項 | 含義 | 建議 |
|------|------|------|
| **Only myself** | 只有你登入嘅 Google 帳戶可開 | **強烈建議**私人帳簿用呢個 |
| **Anyone with a Google account** | 任何登入 Google 嘅人，若知網址，都可以呼叫呢個 Web App；而且腳本以**你**嘅身份跑 | 只喺你明白風險、並且 Sheet 分享策略都配合時先用 |
| Anyone（甚至未登入） | 更危險；本包 `appsscript.json` 預設唔用 | **唔建議**用於真實財務 |

記住：呢個係**你自己嘅後端**。公開存取 ≈ 公開你嘅帳簿 API。

### 5. 驗證

- 頁面標題「我的記帳簿」，狀態顯示已連接
- 若 Sheet 得 EXAMPLE 列，總覽應顯示近乎空白／唔計 TEST
- 若有 `Unmatched` 嘅 Source Event，可喺「記錄與核實」確認入帳
- 手機 Safari → 分享 → **加入主畫面**

更新前端後：本機 `npm run build` → 再貼 `Index.html` → Deploy 出 **New version**。

### 6. 改時區（可選）

- Apps Script：`appsscript.json` → `timeZone`
- Google Sheet：檔案 → 設定 → 時區  
交易 **Date** 會跟 Sheet 時區；其他時間戳預設跟 `Asia/Hong_Kong`。詳見 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。

---

## 常用指令

```bash
npm run build   # web/ → apps-script/Index.html
npm run check   # 斷言：Script Properties、無個人 ID／token、$' + money 完好、單一 </body></html>
```

---

## 保安重點

請讀 [`SECURITY.md`](SECURITY.md)。摘要：

- ID／秘密只放 Script Properties  
- 每人自己 host  
- 「隱藏收入」≠ 權限  
- 唔好 commit 真實通知或私人 Sheet

---

## English (short self-host guide)

1. Create a Google Sheet with tabs **Transactions** (26 headers) and **Source Events** (16 headers) — see `docs/SHEET-SCHEMA.md` / `sheet-template/`.
2. `npm run build && npm run check`.
3. New Apps Script project: paste `apps-script/Code.gs` and HTML file named **`Index`** from `apps-script/Index.html`.
4. Set Script Property **`SPREADSHEET_ID`** (Project Settings → Script properties).
5. Deploy as Web App → **Execute as Me** → access **Only myself** (recommended).
6. Open the `/exec` URL while signed into your Google account.

This package is **not** a multi-tenant SaaS. Each person hosts their own Sheet and deployment. No personal spreadsheet IDs, deployment tokens, or real transactions are included.

---

## License

MIT — see [`LICENSE`](LICENSE).
