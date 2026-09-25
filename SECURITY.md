# 保安說明 / Security

## 中文（香港）

1. **唔好將 Spreadsheet ID、帳密、token 寫死喺原始碼。** 本專案用 Apps Script **Script Properties** 嘅 `SPREADSHEET_ID`。
2. **呢個唔係 multi-tenant SaaS。** 每人要自己建立 Sheet 同 Apps Script Web App；唔好共用同一個部署畀唔同人嘅私人帳簿。
3. **建議「Execute as: Me」+「Who has access: Only myself」。** 咁樣只有你登入 Google 先睇到財務資料。若設成「Anyone with a Google account」，任何登入 Google 嘅人都可能開啟你嘅 `/exec` 網址並以你嘅權限讀寫 Sheet——只適合你清楚明白風險時先用。
4. Dashboard 前端嘅「隱藏收入」只係畫面私隱，**唔係存取控制**。
5. 通知原文、卡號尾四位、商戶同金額屬敏感財務資料。唔好寫入公開 log、公開網站或公開 repository。
6. 本公開包刻意唔包含任何收件 endpoint token、個人電郵、真實交易或個人 Sheet ID。若你 fork 後加入自己嘅資料，請用 `.gitignore` 同私有 repo。
7. 發現保安問題：請唔好公開貼出含真實財務資料嘅 issue；用私人渠道聯絡維護者。

## English (short)

- Store `SPREADSHEET_ID` only in Script Properties — never hardcode it.
- This is a **self-host** template, not a hosted multi-user product.
- Prefer Web App access **Only myself**. Wider access means anyone with the URL (and a Google login, if so configured) can use your script identity against your Sheet.
- UI income-hiding is cosmetic, not an access control.
- Do not commit secrets, bank notifications, or real ledgers to public git.
