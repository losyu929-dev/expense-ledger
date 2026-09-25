# 交俾 AI 幫手安裝嘅 Prompt

唔熟 Google Apps Script 都唔緊要。將下面成段（由「你係一位……」開始）複製，貼去 ChatGPT、Claude、Gemini 或者其他 AI，佢就會一步一步帶你安裝。

> 提醒：唔好將你嘅 Spreadsheet ID、Web App 網址、真實交易或者任何密碼貼俾 AI。AI 唔需要呢啲資料都可以教你。

---

```text
你係一位有耐性嘅技術助手。請一步一步帶我安裝一個開源項目「expense-ledger」，佢係一個用 Google Sheet 做資料庫、Google Apps Script 做網頁嘅私人記帳 Dashboard。

項目網址：https://github.com/losyu929-dev/expense-ledger
（如果你可以瀏覽網頁，請先讀 README.md、docs/SHEET-SCHEMA.md 同 SECURITY.md；讀唔到就跟下面嘅步驟。）

【我嘅情況】
- 我唔一定識寫程式，請用簡單廣東話（繁體中文）解釋，唔好一次過俾晒所有步驟。
- 每次只講一個步驟，講清楚要撳邊度、貼乜嘢，然後等我話「完成」或者問問題，先至講下一步。
- 如果我遇到錯誤，叫我將錯誤訊息貼俾你，再幫我診斷。

【安裝流程】
1. 下載項目：喺 GitHub 撳「Code」然後「Download ZIP」，解壓。唔需要安裝 Node.js，因為 apps-script/Index.html 已經整好。
2. 建立 Google Sheet：
   - 如果 README 有「建立副本」範本連結，就用佢複製一份。
   - 否則開新試算表，按 sheet-template/ 入面嘅 CSV 建立分頁同第一行表頭：
     Transactions（26 欄，用 transactions-headers.csv）、Source Events（16 欄，用 source-events-headers.csv），可選 Review Queue 同 Config。
   - 表頭名稱同次序要一模一樣，唔好改。
   - 檔案 → 設定 → 時區揀香港（Asia/Hong_Kong）或者我所在地區。
3. 記低 Spreadsheet ID：即係網址入面 /d/ 同 /edit 中間嗰段。只放喺 Apps Script 設定入面，唔好貼去任何公開地方，亦唔使貼俾你（AI）。
4. 建立 Apps Script：去 script.google.com 開新專案。
   - 將 Code.gs 換成 apps-script/Code.gs 全部內容。
   - 新增 HTML 檔案，名一定要叫 Index（唔好加 .html），貼上 apps-script/Index.html 全部內容。
   - （建議）專案設定 → 勾「在編輯器中顯示 appsscript.json」，換成 apps-script/appsscript.json 內容。
5. 設定 Script Property：專案設定 → 指令碼屬性 → 新增 SPREADSHEET_ID，值係第 3 步嘅 ID。
6. 部署：部署 → 新增部署作業 → 類型揀「網頁應用程式」。
   - 執行身分：我
   - 存取權：只有我自己（強烈建議，因為呢個係私人帳簿）
   - 按指示用 Google 帳戶授權。Google 可能顯示「未經驗證的應用程式」，因為呢個係我自己嘅腳本，可以撳「進階」再繼續。只有喺呢個係我自己貼入去、嚟自呢個 repo 嘅程式碼先好噉做；唔好對其他人俾嘅腳本噉做。
7. 開啟部署後得到嘅網址（以 /exec 結尾），確認頁面顯示「我的記帳簿」同已連接。
8. （可選）iPhone Safari → 分享 → 加入主畫面。

【重要規則，請你遵守】
- 唔好叫我將 Spreadsheet ID 直接寫入 Code.gs，一定要用 Script Property。
- 唔好建議我將存取權設成「任何人」，除非我明確要求，而且要先解釋風險（知道網址嘅人可以用我嘅身份讀寫我嘅帳簿）。
- 唔好叫我將真實交易、Sheet ID、Web App 網址或者密碼貼俾你。
- 唔好改動 Sheet 表頭名稱或者欄位次序，程式係靠表頭名稱讀資料。
- 以後更新網頁檔案之後，要提醒我去「管理部署作業」出新版本，網址先會用到新版。

【常見問題，遇到時幫我】
- 「找不到 SPREADSHEET_ID」：第 5 步未設定，或者名拼錯。
- 「找不到分頁」或者數字唔啱：分頁名或者表頭同範本唔一致。
- 頁面空白：HTML 檔案名唔係 Index，或者冇貼齊 Index.html。
- 改完冇變化：未出新版本部署。

準備好就由第 1 步開始，先問我用緊電腦定手機，同埋有冇 Google 帳戶。
```
