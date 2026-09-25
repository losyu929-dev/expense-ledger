# 空白試算表表頭

呢度只有**表頭**、選項清單同文件用 EXAMPLE 列說明，**冇真實交易**。
欄位已對照作者實際使用嘅試算表結構核實。

> 可直接「建立副本」嘅 Google Sheet 範本連結稍後會加入 README；未有連結前可以按下面步驟自己建立。

## 快速建立

1. 開新 Google Sheet，時區設為 `Asia/Hong_Kong`。
2. 按次序建立分頁：`Dashboard`（可選）、`Transactions`、`Source Events`、`Review Queue`（可選）、`Config`（可選）。
3. 第 1 列貼上對應 CSV 表頭（見本資料夾 `*-headers.csv`），並凍結第 1 列。
4. `Transactions` 嘅 Date（B）、Time（C）、Card Last4（L）、Created At（W）、Updated At（X）同 `Source Events` 嘅 Card Last4（I）設為**純文字**（格式 → 數字 → 純文字）。
5. 喺 `Transactions` 第 2 列加入 O／Y／Z 三條 array formula（見下）。
6. （可選）`Config` 貼上 [`config-options.csv`](config-options.csv)，再為 Type（D）、Category（I）、Status（P）、Verification Level（R）、Refund Status（T）、Manual Lock（V）等欄加下拉選單（建議「顯示警告」）。

詳細欄位說明見 [`docs/SHEET-SCHEMA.md`](../docs/SHEET-SCHEMA.md)。

---

## Transactions（26 欄）

```text
Transaction ID,Date,Time,Type,Amount,Currency,Clean Merchant,Original Merchant,Category,Subcategory,Payment Method,Card Last4,AI Remark,Manual Remark,Final Remark,Status,Confidence,Verification Level,Source Count,Refund Status,Linked Transaction ID,Manual Lock,Created At,Updated At,Month,Duplicate Key
```

第 2 列公式（O／Y／Z 唔好手動輸入）：

```text
O2: =ARRAYFORMULA(IF(A2:A="","",IF(N2:N<>"",N2:N,M2:M)))
Y2: =ARRAYFORMULA(IF(B2:B="","",LEFT(B2:B,7)))
Z2: =ARRAYFORMULA(IF(A2:A="","",SUBSTITUTE(B2:B,"-","")&"|"&F2:F&"|"&TEXT(E2:E,"0.00")&"|"&LOWER(G2:G)&"|"&L2:L))
```

### 文件用 EXAMPLE（可選，唔會計入統計）

前端會忽略 `Transaction ID` 含 `TEST-` / `EXAMPLE` 嘅列；Sheet 內 Dashboard 會忽略 `Status` = `Example`。O／Y／Z 由公式產生，所以下面留空：

```text
EXAMPLE-TX-001,2026-01-15,12:30,Expense,42.5,HKD,Demo Cafe,DEMO CAFE,Dining,午餐（示範）,Demo Wallet,0000,示範 AI 備註,示範資料，可刪除,,Example,0.9,1 source,1,No,,No,2026-01-15T12:30:00+08:00,2026-01-15T12:30:00+08:00,,
```

---

## Source Events（16 欄）

```text
Event ID,Received At,Source Type,Source App / Sender,Raw Text,Parsed Amount,Currency,Parsed Merchant,Card Last4,Order / Txn Ref,Event Time,Matched Transaction ID,Match Score,Match Status,Parser Confidence,Notes
```

### 文件用 EXAMPLE

```text
EXAMPLE-EV-003,2026-01-20T09:00:00+08:00,Bank Email,Demo Bank,[TEST DATA] 示範電郵：Demo Bookshop 消費 HKD 88.00,88,HKD,Demo Bookshop,0000,DEMO-REF-003,2026-01-20T08:55:00+08:00,,,Unmatched,0.7,TEST DATA — 示範資料，可刪除; category=Shopping
```

---

## Review Queue（13 欄，可選）

```text
Review ID,Created At,Object Type,Object ID,Reason,Amount,Currency,Merchant,Suggested Match,Confidence,Recommended Action,Resolved,Resolution Notes
```

**重要：** `Code.gs` 假設 **D 欄（Object ID）= Event ID**，核實後寫入 **L = Resolved、M = Resolution Notes**。若你改欄序，請同步改 `Code.gs`。

---

## Config（6 欄，可選）

下拉選單選項清單，見 [`config-options.csv`](config-options.csv)：

```text
Transaction Type,Status,Verification Level,Refund Status,Source Type,Category
```

Web App 唔讀取 Config。
