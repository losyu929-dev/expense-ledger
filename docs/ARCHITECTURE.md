# 架構說明 / Architecture

## 一句講清

**每人自己 host 自己嘅 Google Sheet + Apps Script Web App。** 本公開包唔係雲端 SaaS，亦唔會替你保管資料。

## 個人版 vs 公開版

| | 個人私有專案 | 本公開包 (`expense-ledger-public`) |
|--|--|--|
| Spreadsheet ID | 可能寫死喺私人 `Code.gs` | **只**經 Script Property `SPREADSHEET_ID` |
| 收件（iPhone Shortcut → Sheet） | 可有獨立收件 Web App + token | **唔包含**；自行另建 |
| ChatGPT Sites / 個人 endpoint | 可能存在 | **刻意剔除** |
| UI | 同一套手機優先 Dashboard | 同一套（已消毒） |

## 資料流（Dashboard）

```text
瀏覽器（Safari / 主畫面）
  │  google.script.run
  ▼
Apps Script（以你身份執行）
  │  SpreadsheetApp.openById(ScriptProperties.SPREADSHEET_ID)
  ▼
Google Sheet
  ├─ Transactions（正式交易，Dashboard 讀 26 欄）
  ├─ Source Events（原始通知，Dashboard 讀 16 欄）
  ├─ Review Queue（可選；核實時標記已處理）
  └─ Config / Dashboard（可選；本 Dashboard 唔强制讀）
```

### 讀取

`getLedger()` 回傳：

- `transactions`：含表頭嘅二維陣列（闊度 26）
- `events`：含表頭嘅二維陣列（闊度 16）
- `live: true`、`fetchedAt` ISO 時間

前端每約 60 秒輪詢；失敗會保留上次資料。

### 寫入

`saveTransaction(payload)`：

- 用 `LockService` 防併發
- 白名單驗證 type / category / amount / currency / date / 文字長度
- 由待核實 **Event** 確認時：建立 `TX-<Event ID>`、寫入 Transactions、更新 Source Events 嘅 Matched 欄、可選更新 Review Queue
- 編輯既有交易時：用 `Updated At` 做樂觀鎖（`expected_updated_at`）
- 公式注入防護：字串若以 `= + @ -` 開頭會加前綴 `'`
- **唔會覆寫** Sheet 上 O / Y / Z 等 array formula 欄（寫入 A–N 同 P–X）

## 時區

- 專案預設：`Asia/Hong_Kong`（`appsscript.json`）
- 交易 **Date** 欄：用試算表本身 timezone 格式化成 `yyyy-MM-dd`
- 其他 Date 物件：用 `Asia/Hong_Kong` 格式化成 ISO-like 字串

改法：編輯 `appsscript.json` 嘅 `timeZone`，同／或 Sheet → 檔案 → 設定。

## 唔喺本包範圍

- iPhone Shortcut / 銀行通知自動收件
- AI 解析、自動入帳規則引擎
- 多人共用、登入帳號系統、SaaS 帳單

你可以只部署 Dashboard，手動喺 Sheet 入數；或者另外接駁自己嘅收件流程。
