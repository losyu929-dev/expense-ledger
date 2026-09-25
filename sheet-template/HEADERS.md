# 空白試算表表頭

呢度只有**表頭**同文件用 EXAMPLE 列說明，**冇真實交易**。

## 快速建立

1. 開新 Google Sheet，時區設為 `Asia/Hong_Kong`。
2. 将以下分頁改名／新建：`Transactions`、`Source Events`、`Review Queue`（可選）、`Config`（可選）。
3. 第 1 列貼上對應 CSV 表頭（見本資料夾 `*-headers.csv`），或複製下面文字。
4. 將 Date / Card Last4 / Created At / Updated At 等欄設為**純文字**（格式 → 數字 → 純文字），避免 Sheets 自動改日期。

詳細欄位說明見 [`docs/SHEET-SCHEMA.md`](../docs/SHEET-SCHEMA.md)。

---

## Transactions（26 欄）

```text
Transaction ID,Date,Account,Type,Amount,Currency,Clean Merchant,Original Merchant,Category,Subcategory,Payment Method,Card Last4,AI Remark,Manual Remark,Formula O,Status,Parser Confidence,Confirmation Note,Source Count,Refund Flag,Reserved U,Manual Confirmed,Created At,Updated At,Formula Y,Formula Z
```

> `Account`、`Confirmation Note`、`Refund Flag`、`Reserved U`、`Manual Confirmed`、`Formula *` 部分名稱為推斷／保留位；欄位**順序**最重要。

### 文件用 EXAMPLE（可選，唔會計入統計）

前端會忽略 `Transaction ID` 含 `TEST-` / `EXAMPLE` 嘅列：

```text
EXAMPLE-001,2026-01-15,,Expense,42.5,HKD,Demo Cafe,DEMO CAFE HK,Dining,午餐,PayMe,,,文件示例，非真實資料,,Confirmed,,User confirmed,1,No,,Yes,2026-01-15T12:00:00+08:00,2026-01-15T12:00:00+08:00,,
```

---

## Source Events（16 欄）

```text
Event ID,Received At,Source Type,Source App / Sender,Raw Text,Parsed Amount,Currency,Parsed Merchant,Card Last4,Order / Txn Ref,Event Time,Matched Transaction ID,Match Score,Match Status,Parser Confidence,Notes
```

### 文件用 EXAMPLE

```text
EXAMPLE-EV-001,2026-01-15T12:00:00+08:00,Notification,PayMe,[TEST DATA] You paid HKD 42.50 to Demo Cafe,42.5,HKD,Demo Cafe,,,2026-01-15T12:00:00+08:00,,,Unmatched,0.9,TEST DATA — documentation only
```

---

## Review Queue（可選）

```text
Review ID,Created At,Reason,Event ID,Priority,Assigned,Status,Notes,Reserved1,Reserved2,Reserved3,Resolved,Resolution Note
```

**重要：** 預設 `Code.gs` 假設 **D 欄 = Event ID**，核實後寫入 **L = Resolved、M = Resolution Note**。若你改欄序，請同步改 `Code.gs`。

---

## Config（可選）

```text
Key,Value
timezone,Asia/Hong_Kong
```
