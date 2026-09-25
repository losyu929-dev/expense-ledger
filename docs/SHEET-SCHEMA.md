# Google Sheet 結構

以下結構已對照作者實際使用中嘅試算表（只核對分頁、表頭、公式同選項清單，**冇複製任何交易資料**）。
tab 名稱必須一致（含空格同大小寫）；表頭一律喺第 1 列，並凍結第 1 列。

建議試算表時區：`Asia/Hong_Kong`。

分頁次序：

| # | 分頁 | 欄數 | 凍結列 | Dashboard Web App 有冇用 |
|--:|------|-----:|------:|--------------------------|
| 1 | `Dashboard` | 8 | 0 | 冇（Sheet 內摘要公式） |
| 2 | `Transactions` | 26 | 1 | **必須**（讀 A–Z，寫 A–N、P–X） |
| 3 | `Source Events` | 16 | 1 | **必須**（讀 A–P，寫 L、N） |
| 4 | `Review Queue` | 13 | 1 | 可選（寫 L、M） |
| 5 | `Config` | 6 | 1 | 冇（下拉選單選項清單） |

> 可複製嘅空白範本連結稍後會加入 README。

---

## 1. `Transactions`（26 欄）

Dashboard `getLedger()` 讀取 A–Z 共 26 欄；前端用**表頭字串**做 key，`saveTransaction` 用**欄位位置**寫入。

| 索引 | 欄 | 表頭 | 類型／格式 | 說明 |
|-----:|:--:|------|-----------|------|
| 0 | A | `Transaction ID` | 文字 | 唯一 ID；由 Event 確認時為 `TX-<Event ID>` |
| 1 | B | `Date` | 純文字 `yyyy-MM-dd` | `Month`／`Duplicate Key` 公式用 `LEFT`／`SUBSTITUTE`，所以必須係文字 |
| 2 | C | `Time` | 純文字 `HH:mm` | 可空；Web App 唔寫呢欄 |
| 3 | D | `Type` | 下拉 | 見 Config `Transaction Type` |
| 4 | E | `Amount` | 數字 `#,##0.00` | 正數；唔好用負號表示支出 |
| 5 | F | `Currency` | 文字 | ISO 三字母，如 `HKD` |
| 6 | G | `Clean Merchant` | 文字 | 顯示用商戶名（人手可改） |
| 7 | H | `Original Merchant` | 文字 | 來源解析商戶 |
| 8 | I | `Category` | 下拉 | 見下方類別白名單 |
| 9 | J | `Subcategory` | 文字 | 商品／用途（Dashboard「買咗乜」） |
| 10 | K | `Payment Method` | 文字 | 渠道名稱（例如銀行或電子錢包名） |
| 11 | L | `Card Last4` | 純文字 | 卡尾四位 |
| 12 | M | `AI Remark` | 文字 | 自動入帳備註；人手編輯唔會覆寫 |
| 13 | N | `Manual Remark` | 文字 | 使用者備註 |
| 14 | O | `Final Remark` | **公式** | `O2` array formula，見下；**唔好手動輸入** |
| 15 | P | `Status` | 下拉 | 見 Config `Status` |
| 16 | Q | `Confidence` | 數字 0.00–1.00 | 解析信心（可空） |
| 17 | R | `Verification Level` | 下拉 | 見 Config `Verification Level` |
| 18 | S | `Source Count` | 數字 | 連結嘅 Source Event 數量 |
| 19 | T | `Refund Status` | 下拉 | 見 Config `Refund Status` |
| 20 | U | `Linked Transaction ID` | 文字 | 例如退款指向原交易；Web App 唔寫 |
| 21 | V | `Manual Lock` | `Yes` / `No` | 人手鎖定，避免自動流程覆寫 |
| 22 | W | `Created At` | 純文字 ISO 時間 | |
| 23 | X | `Updated At` | 純文字 ISO 時間 | 樂觀鎖用 |
| 24 | Y | `Month` | **公式** | `Y2` array formula |
| 25 | Z | `Duplicate Key` | **公式** | `Z2` array formula |

### Array formula（放喺第 2 列，自動向下填）

```text
O2: =ARRAYFORMULA(IF(A2:A="","",IF(N2:N<>"",N2:N,M2:M)))
Y2: =ARRAYFORMULA(IF(B2:B="","",LEFT(B2:B,7)))
Z2: =ARRAYFORMULA(IF(A2:A="","",SUBSTITUTE(B2:B,"-","")&"|"&F2:F&"|"&TEXT(E2:E,"0.00")&"|"&LOWER(G2:G)&"|"&L2:L))
```

`Code.gs` 只寫 A–N 同 P–X，**永遠唔會覆寫 O／Y／Z**。刪資料時請「清除內容」，唔好刪走第 2 列公式。

### 類別白名單

`Dining`, `Groceries`, `Transport`, `Shopping`, `Subscriptions`, `Bills`, `Health`, `Home`, `Entertainment`, `Travel`, `Pets`, `Other`

### 統計規則

- 前端：`Transaction ID` 含 `TEST-` / `EXAMPLE` 唔計入統計
- Sheet 內 `Dashboard`：`Status` = `Example` 唔計入
- 唔同貨幣唔會加埋；總覽主數字以 HKD 為主
- `Transfer` / `CardRepayment` 唔當成一般消費或收入

---

## 2. `Source Events`（16 欄）

| # | 欄 | 表頭 | 說明 |
|--:|:--:|------|------|
| 1 | A | `Event ID` | 唯一 ID |
| 2 | B | `Received At` | ISO 時間 |
| 3 | C | `Source Type` | 下拉，見 Config `Source Type` |
| 4 | D | `Source App / Sender` | |
| 5 | E | `Raw Text` | 原始通知；**永遠唔好刪改** |
| 6 | F | `Parsed Amount` | 數字 `#,##0.00` |
| 7 | G | `Currency` | |
| 8 | H | `Parsed Merchant` | |
| 9 | I | `Card Last4` | 純文字 |
| 10 | J | `Order / Txn Ref` | |
| 11 | K | `Event Time` | ISO 時間 |
| 12 | L | `Matched Transaction ID` | Web App 核實後寫入 |
| 13 | M | `Match Score` | 0.0–1.0 |
| 14 | N | `Match Status` | `Unmatched` / `Candidate` / `Matched` |
| 15 | O | `Parser Confidence` | 0.0–1.0 |
| 16 | P | `Notes` | 可含 `category=<Category>` 提示；`TEST DATA` 會被前端忽略 |

- 初始 `Match Status` = `Unmatched`；Sheet `Dashboard` 將 `Unmatched` + `Candidate` 計作待處理
- 同一筆真實交易可以有多個 Source Event，再指向同一個 Transaction ID
- 呢個分頁冇公式

---

## 3. `Review Queue`（13 欄，可選）

```text
Review ID, Created At, Object Type, Object ID, Reason, Amount, Currency, Merchant, Suggested Match, Confidence, Recommended Action, Resolved, Resolution Notes
```

Dashboard 核實 Event 時，若存在呢個分頁，會搵 **D 欄（`Object ID`）= Event ID** 嘅列，並寫入：

- L 欄 `Resolved`：`Yes`
- M 欄 `Resolution Notes`：說明字串（含時間）

`Object Type` 可以係例如 `Source Event` / `Transaction`；冇呢個分頁亦唔影響基本讀寫。

---

## 4. `Config`（6 欄）

每欄係一個下拉選單嘅選項清單（由第 2 列開始）。**本公開 Web App 唔讀取 Config**；佢只係 Sheet 內資料驗證嘅參考。

| 表頭 | 選項 |
|------|------|
| `Transaction Type` | `Expense`, `Refund`, `Income`, `Transfer` |
| `Status` | `Pending`, `Partially Matched`, `Verified`, `Enriched`, `Final`, `Needs Review`, `Example` |
| `Verification Level` | `1 source`, `2 sources`, `3+ sources`, `Manual verified` |
| `Refund Status` | `No`, `Partial`, `Full` |
| `Source Type` | `Wallet Notification`, `Bank Notification`, `Bank Email`, `Merchant Email`, `Manual` |
| `Category` | 同上方類別白名單 |

> **注意：** 目前 `Code.gs` 核實時會寫 `Status` = `Confirmed`、`Verification Level` = `User confirmed`、`Refund Status` = `Refund`，類型亦容許 `CardRepayment`，呢啲值唔喺上面清單。範本嘅下拉選單因此設為「顯示警告」而唔係「拒絕輸入」；如果你將資料驗證改成拒絕輸入，Web App 寫入會失敗。

---

## 5. `Dashboard`（8 欄，Sheet 內摘要）

與 Web App 無關，可留空或刪除。範本內容：

- A3:B8：`Metric` / `Value` — `This Month Spend`、`Verified Transactions`（Verified+Enriched+Final）、`Needs Review`、`Pending Source Events`（Unmatched+Candidate）、`Average Confidence`
- D3:E15：`Category` / `This Month Spend`，每個類別一行

例子公式：

```text
=SUMIFS(Transactions!$E:$E,Transactions!$D:$D,"Expense",Transactions!$I:$I,D4,Transactions!$Y:$Y,TEXT(TODAY(),"yyyy-mm"),Transactions!$P:$P,"<>Example")
```
