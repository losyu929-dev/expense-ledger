# Google Sheet 結構

建立新試算表後，最少需要以下分頁（tab 名稱必須一致，含空格同大小寫）。

建議試算表時區：`Asia/Hong_Kong`。

---

## 1. `Transactions`（26 欄）

Dashboard `getLedger()` 讀取 A–Z 共 26 欄；表頭必須喺第 1 列。  
欄名以 **英文** 為準（前端用表頭字串做 key）。

### 已由程式／前端確認嘅欄位

| 索引 | 欄（1-based） | 表頭 | 說明 |
|-----:|:-------------|------|------|
| 0 | A | `Transaction ID` | 唯一 ID；由 Event 確認時為 `TX-<Event ID>` |
| 1 | B | `Date` | `yyyy-MM-dd`（建議純文字格式） |
| 3 | D | `Type` | `Income` / `Expense` / `Refund` / `Transfer` / `CardRepayment` |
| 4 | E | `Amount` | 正數；唔好用負號表示支出 |
| 5 | F | `Currency` | ISO 三字母，如 `HKD` |
| 6 | G | `Clean Merchant` | 顯示用商戶名（人手可改） |
| 7 | H | `Original Merchant` | 來源解析商戶；編輯時通常保留 |
| 8 | I | `Category` | 見下方類別白名單 |
| 9 | J | `Subcategory` | 商品／用途（Dashboard「買咗乜」） |
| 10 | K | `Payment Method` | 渠道，如 PayMe、HSBC HK |
| 11 | L | `Card Last4` | 卡尾四位（建議純文字） |
| 12 | M | `AI Remark` | AI／自動入帳備註；人手編輯唔會覆寫 |
| 13 | N | `Manual Remark` | 使用者備註 |
| 15 | P | `Status` | 例如 `Confirmed`、`Imported` |
| 16 | Q | `Parser Confidence` | 0.0–1.0 數字（可空） |
| 17 | R | `Confirmation Note` | 例如 `User confirmed`、`1 source`（**名稱按用途推斷**） |
| 18 | S | `Source Count` | 連結嘅 Source Event 數量 |
| 19 | T | `Refund Flag` | `No` 或 `Refund`（**名稱按用途推斷**） |
| 21 | V | `Manual Confirmed` | `Yes` / `No`（**名稱按用途推斷**） |
| 22 | W | `Created At` | ISO 時間字串 |
| 23 | X | `Updated At` | ISO 時間字串；樂觀鎖用 |

### 推斷／保留欄（請保留空欄或公式，唔好刪欄）

| 索引 | 欄 | 建議表頭 | 依據 |
|-----:|:---|----------|------|
| 2 | C | `Account`（推斷） | 寫入邏輯唔設值；保留佔位 |
| 14 | O | `Formula O`（保留） | 個人版註明 O/Y/Z 為 array formula，**唔好覆寫** |
| 20 | U | `Reserved U`（推斷） | 寫入邏輯唔設值 |
| 24 | Y | `Formula Y`（保留） | array formula |
| 25 | Z | `Formula Z`（保留） | array formula |

> **誠實說明：** 索引 2、14、17、19、20、21、24、25 嘅「顯示名稱」有部分係由 `saveTransaction` 欄位用途同測試 fixture **推斷**；只要欄位**順序同闊度**正確，前端主要依賴已確認嘅表頭字串。若你既有 Sheet 用咗唔同英文名，只要對應欄位位置一致，Dashboard 讀寫索引仍然有效；但前端顯示依賴嘅名稱（如 `Clean Merchant`）必須吻合。

### 類別白名單

`Dining`, `Groceries`, `Transport`, `Shopping`, `Subscriptions`, `Bills`, `Health`, `Home`, `Entertainment`, `Travel`, `Pets`, `Other`

### 統計規則（前端）

- `Transaction ID` 含 `TEST-` / `EXAMPLE` 唔計入統計
- 唔同貨幣唔會加埋；總覽主數字以 HKD 為主
- `Transfer` / `CardRepayment` 唔當成一般消費或收入

---

## 2. `Source Events`（16 欄）

順序來自系統交接文件，屬**固定欄位順序**：

| # | 表頭 |
|--:|------|
| 1 | `Event ID` |
| 2 | `Received At` |
| 3 | `Source Type` |
| 4 | `Source App / Sender` |
| 5 | `Raw Text` |
| 6 | `Parsed Amount` |
| 7 | `Currency` |
| 8 | `Parsed Merchant` |
| 9 | `Card Last4` |
| 10 | `Order / Txn Ref` |
| 11 | `Event Time` |
| 12 | `Matched Transaction ID` |
| 13 | `Match Score` |
| 14 | `Match Status` |
| 15 | `Parser Confidence` |
| 16 | `Notes` |

建議：

- 初始 `Match Status` = `Unmatched`
- `Parser Confidence` 為 0.0–1.0 數字
- **永遠唔好刪改 `Raw Text`**
- 同一筆真實交易可以有多個 Source Event，再指向同一個 Transaction ID

---

## 3. `Review Queue`（可選）

Dashboard 核實 Event 時，若存在呢個分頁，會搵 **第 4 欄（D）= Event ID** 嘅列，並寫入：

- 第 12 欄（L）：`Yes`
- 第 13 欄（M）：說明字串（含時間）

其餘欄位可由你自己定義（例如 Review ID、原因、優先次序）。冇呢個分頁亦唔影響基本讀寫。

建議最小表頭示例：

```text
Review ID, Created At, Reason, Event ID, Priority, Assigned, Status, Notes, Reserved1, Reserved2, Reserved3, Resolved, Resolution Note
```

（前 3 欄同中間欄可自訂；**請保持 D=Event ID、L/M=Resolved 欄位位置**，或相應改 `Code.gs`。）

---

## 4. `Config`（可選概覽）

個人系統可能用 Config 存放解析規則、渠道別名等。**本公開 Dashboard 唔讀取 Config。**  
你可以自己用兩欄：

```text
Key, Value
timezone, Asia/Hong_Kong
```

---

## 5. `Dashboard` 分頁（可選）

Sheet 內用作樞紐／圖表嘅分頁與本 Web App 無關；可留空或刪除。
