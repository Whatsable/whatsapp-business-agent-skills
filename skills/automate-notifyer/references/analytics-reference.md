# Analytics Reference

Detailed reference for the Notifyer messaging analytics and message log APIs.
All endpoints in this group authenticate with `Authorization: Bearer <token>` (console JWT).

---

## API Groups

| Group | Prefix | Endpoints |
|-------|--------|-----------|
| Analytics | `/api:5l-RgW1B` | analytics summary, download CSV, get single log record |
| Message Logs | `/api:ereqLKj6` | log listing (requires CORS header) |

---

## Endpoints

### 1. `GET /api:5l-RgW1B/anslytics` — Analytics Summary

> **Note:** The Xano endpoint path is `anslytics` (with a typo). This is the real path — do not correct it.

Fetches aggregate message delivery statistics for a given time window.

**Authentication:** Required — `Authorization: Bearer <token>`
**CORS header:** Not required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_timestamp` | text (Unix ms) | ✅ | Start of the reporting window (milliseconds) |
| `end_timestamp` | text (Unix ms) | ✅ | End of the reporting window (milliseconds) |

Both parameters are typed as `text` in Xano but must contain Unix millisecond values.
The frontend uses `Date.getTime()` to generate them.

**Xano Function Stack:**

| Step | Operation | Returns |
|------|-----------|---------|
| 1 | Custom Function `/get_user` | `user` |
| 2 | Create Variable `start_time` = `input:start_timestamp.format_timestamp` | `start_time` |
| 3 | Create Variable `end_time` = `input:end_timestamp.format_timestamp` | `end_time` |
| 4 | Query All Records From `conversation` | `total_sent` |
| 5 | Query All Records From `conversation` (status=sent filter) | `sent_message` |
| 6 | Query All Records From `conversation` (status=delivered filter) | `delivered_messages` |
| 7 | Query All Records From `conversation` (status=read filter) | `read_messages` |
| 8 | Query All Records From `conversation` (status=passed filter) | `passed_messages` (internal only) |

**Response:**

```json
{
  "sent_count": 1180,
  "delivered_count": 1050,
  "read_count": 890,
  "start_readable_time": "2025-01-01T00:00:00.000Z",
  "end_readable_time": "2025-01-31T23:59:59.999Z",
  "total_sent": 1200
}
```

| Field | Description |
|-------|-------------|
| `total_sent` | All messages attempted in the period (regardless of status) |
| `sent_count` | Messages with a confirmed "sent" status from Meta |
| `delivered_count` | Messages confirmed delivered to the recipient's device |
| `read_count` | Messages opened/read by the recipient |
| `start_readable_time` | Formatted start timestamp string (from Xano `format_timestamp`) |
| `end_readable_time` | Formatted end timestamp string |

> `passed_messages` is queried internally but **not returned** in the response.

**Script additions** (`get-message-analytics.js` adds these fields):
- `read_rate` — `read_count / total_sent` as a percentage string
- `delivery_rate` — `delivered_count / total_sent` as a percentage string
- `period` — `{ from_ms, to_ms }` for the requested time window

---

### 2. `GET /api:5l-RgW1B/download/analytics/details` — Download Analytics CSV

Downloads a CSV file of individual message records for a given status type and time window.

**Authentication:** Required — `Authorization: Bearer <token>`
**CORS header:** Not required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type_of_data` | text | ✅ | `"sent"` \| `"delivered"` \| `"read"` |
| `start_timestamp` | text (Unix ms) | ✅ | Start of the reporting window |
| `end_timestamp` | text (Unix ms) | ✅ | End of the reporting window |

**Xano Function Stack:**

| Step | Operation | Description |
|------|-----------|-------------|
| 1 | Custom Function `/get_user` | Auth check |
| 2 | Conditional `type_of_data == sent` | Query `conversation` → `model` |
| 3 | Conditional `type_of_data == delivered` | Query `conversation` → `model` |
| 4 | Conditional `type_of_data == read` | Query `conversation` → `model` |
| 5 | Object: Get Keys From `model.0` | Extract column headers → `columns` |
| 6 | Create Variable `rows = []` | Initialize row buffer |
| 7 | For Each Loop on `model` | Extract values per row, add to `rows` |
| 8 | Create Variable `csv` from `columns [csv_create]` | Build CSV string |
| 9 | Set Header `Content-Disposition: attachment; filename="%s.csv"` | Force download |
| 10 | Set Header `Content-Type: text/csv` | MIME type |

**Response:** Raw CSV text with standard download headers. Column headers match the `conversation` table fields.

**How to use from Node.js (not scripted — for direct fetch use):**

```javascript
const token = process.env.NOTIFYER_API_TOKEN;
const base = process.env.NOTIFYER_API_BASE_URL;
const startMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
const endMs = Date.now();

const url = `${base}/api:5l-RgW1B/download/analytics/details` +
  `?type_of_data=read&start_timestamp=${startMs}&end_timestamp=${endMs}`;

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
});
const csv = await res.text();
// write to file or process directly
```

> This endpoint is intentionally not scripted (`download-analytics-csv.js` does not exist)
> because it returns binary/text CSV rather than JSON, which doesn't fit the standard
> `ok()`/`err()` output pattern. Use raw `fetch` + `response.text()` directly.

---

### 3. `GET /api:5l-RgW1B/analytics/conversation/{message_id}` — Get Single Log Record

Fetches a single conversation record by its internal message ID.

**Authentication:** Required — `Authorization: Bearer <token>`
**CORS header:** Not required

**Path Parameter:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message_id` | text | ✅ | Internal Notifyer conversation record ID |

**Xano Function Stack:**

| Step | Operation | Description |
|------|-----------|-------------|
| 1 | Get Record From `conversation` | Fetch by `message_id` → `model` |
| 2 | Precondition `model != null` | HTTP 400 if not found |
| 3 | Rename `created_at` to `send_time` | Field renamed in response object |

**Response:** The full `conversation` record (as self), with `created_at` renamed to `send_time`.

> This endpoint is not scripted. Use `get-message-logs.js` to retrieve logs, then
> filter by `id` client-side if you need a specific record.

---

### 4. `GET /api:ereqLKj6/log` — Message Logs

Returns a list of message log entries for the workspace, optionally filtered by phone number and/or message type.

**Authentication:** Required — `Authorization: Bearer <token>`
**CORS header:** Required — `Origin: https://console.notifyer-systems.com`
(Xano runs `/cors_origin_console` as step 1)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone_number` | integer | optional | Filter by specific recipient phone number (no `+` prefix) |
| `filter` | text | optional | `"automation"` \| `"broadcast"` \| `""` (all) |

> `phone_number` is typed as **integer** in Xano, not text. Omit the field entirely
> (or pass `0`) for all numbers. The frontend sends empty string by default; a Lambda
> function handles the conversion.

**Xano Function Stack:**

| Step | Operation | Returns |
|------|-----------|---------|
| 1 | Custom Function `/cors_origin_console` | `origin_check` |
| 2 | Custom Function `/get_user` | `user` |
| 3 | Lambda Function | `phone_number` (normalised) |
| 4 | Query All Records From `log` | `log` |
| 5 | Lambda Function | `result` (filtered/formatted) |

**Response:** Array of log records (as self via `var: result`).

**Log Record Shape:**

| Field | Type | Description |
|-------|------|-------------|
| `body` | string | The message text that was sent |
| `phone_number` | string/number | Recipient's phone number |
| `created_at` | number | Unix millisecond timestamp of the log record |
| `status` | string | `"sent"` \| `"delivered"` \| `"read"` |

> Additional fields may be present depending on the `conversation` table schema.

**Status progression:** `sent` → `delivered` → `read`

**Filter values:**
- `""` — all log types (default)
- `"automation"` — messages sent via API key, Make, Zapier, n8n, or webhooks
- `"broadcast"` — messages sent as part of a bulk broadcast campaign

**Pagination:** Xano returns the full array. The `get-message-logs.js` script handles
client-side pagination with `--page` and `--per-page` flags.

---

## Date Range Conventions

The analytics endpoints use Unix millisecond timestamps for date filtering.
Common shortcuts (matching the console UI presets):

| Period | from_ms calculation |
|--------|---------------------|
| Today | `new Date().setHours(0,0,0,0)` |
| Last 7 days | 6 days before today at 00:00:00 |
| Last 30 days | 29 days before today at 00:00:00 |
| Last 60 days | 59 days before today at 00:00:00 |
| Last 90 days | 89 days before today at 00:00:00 |

`end_ms` is always today at `23:59:59.999`.

The `get-message-analytics.js` script handles these calculations via `--days <n>`
or explicit `--from`/`--to` YYYY-MM-DD flags.

---

## Limitations

- **No date filter on logs** — `GET /log` does not accept timestamp parameters.
  Logs are filtered only by `phone_number` and `filter` type. To get time-filtered
  logs, use `get-message-analytics.js` for counts, or download the CSV via the
  download endpoint.
- **No pagination in Xano** — both log endpoints return all matching records.
  Client-side pagination is applied by `get-message-logs.js`.
- **Read-only** — no write endpoints exist in this API group. Analytics are
  observation-only.
- **Past activity required** — analytics are only meaningful after messages have
  been sent. Run `get-message-analytics.js` against a period with known activity
  to validate connectivity.
