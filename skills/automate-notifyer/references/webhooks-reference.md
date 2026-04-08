# Webhooks Reference

Notifyer exposes two distinct webhook systems. Both live under the
`/api:qh9OQ3OW` group and require `Authorization: Bearer <token>` (console auth).

---

## Webhook Types

| Type | Purpose | Xano Table | Trigger Direction |
|------|---------|------------|-------------------|
| **Dev** | n8n / Make / Zapier integrations, schedule automations | `zapier_make_webhooks` | Outgoing from Notifyer |
| **IO** | Bidirectional incoming & outgoing per user | `webhook_incoming_and_outgoing` | Incoming + Outgoing |

> Use **Dev webhooks** to notify external automation tools when messages are sent or received.
> Use **IO webhooks** for bidirectional data pipelines.

---

## CORS Rules

| Endpoint Group | Xano CORS Function | Origin Header Required |
|----------------|-------------------|----------------------|
| All `/webhook/dev/*` | `/cors_origin_console` | Yes — `https://console.notifyer-systems.com` |
| All `/user/io/webhook` | None | No |
| `/user/incoming_outgoing/feature/status` | None | No |

The `list-webhooks.js`, `create-webhook.js`, `update-webhook.js`, and `delete-webhook.js`
scripts handle these headers automatically.

---

## Dev Webhooks (`/webhook/dev`)

### `GET /api:qh9OQ3OW/webhook/dev`

Returns all dev webhooks for the authenticated user.

**Authentication:** `Authorization: Bearer <token>` + `Origin: https://console.notifyer-systems.com`

**Inputs:** None

**Response:** Direct array of webhook records (As Self → `var: model`).

```json
[
  {
    "id": 5,
    "created_at": 1706184000000,
    "user_id": "abc123",
    "webhooks": "https://hook.eu2.make.com/xyz...",
    "status": true,
    "outgoing": true,
    "incoming": true,
    "schedule_activity": false,
    "waiting_duration": 0,
    "signature_secret": null,
    "active_signature": false
  }
]
```

**Field notes:**
- `id` — integer primary key
- `webhooks` — the webhook endpoint URL (note: plural field name)
- `status` — true = active, false = paused
- `outgoing` — trigger on outgoing messages
- `incoming` — trigger on incoming messages
- `schedule_activity` — trigger on schedule-based activity
- `waiting_duration` — integer seconds before triggering when schedule_activity is on
- `signature_secret` — HMAC secret for verifying webhook payloads; null if not enabled
- `active_signature` — bool flag; if true, a secret was generated at creation

**Known field name variants:** The frontend normalizes `is_incoming_outgoing_enable` or
`is_incoming_outgoing` as fallbacks for `outgoing`/`incoming`. The `list-webhooks.js` script
handles all variants.

---

### `POST /api:qh9OQ3OW/webhook/dev/create`

Creates a new dev webhook.

**Authentication:** `Authorization: Bearer <token>` + `Origin: https://console.notifyer-systems.com`

**Precondition:** Xano runs `Has Record In zapier_make_webhooks` to check for duplicate URL.
If a webhook with the same URL already exists, Xano evaluates `Precondition: same_exist == false`
and returns **HTTP 400** (Precondition Failed). The script surfaces this as `{ ok: false, blocked: true }`.

**Xano Function Stack:**
1. `cors_origin_console` → check origin
2. `get_user` → user
3. `Has Record In zapier_make_webhooks` → `same_exist`
4. `Precondition: same_exist == false`
5. `Create Variable: model = NA`
6. `Conditional: active_signature == true`
   - If true: Create Secret Key → `signature`; Add Record In `zapier_make_webhooks` → `model`
   - Else: Add Record In `zapier_make_webhooks` → `model`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `webhooks` | text | ✓ | Target URL |
| `status` | bool | ✓ | true = active |
| `outgoing` | bool | ✓ | Trigger on outgoing messages |
| `incoming` | bool | ✓ | Trigger on incoming messages |
| `schedule_activity` | bool | ✓ | Trigger on scheduled activity |
| `waiting_duration` | integer | ✓ | Seconds to wait before trigger (0 if unused) |
| `active_signature` | bool | ✓ | Generate HMAC signature secret key |

**Response:** The created webhook record (As Self → `var: model`).

> When `active_signature: true`, the response will include `signature_secret` — a generated
> HMAC key. **Save it immediately** — Xano does not expose it via any GET endpoint later.

---

### `PATCH /api:qh9OQ3OW/webhook/dev/{id}`

Updates an existing dev webhook.

**Authentication:** `Authorization: Bearer <token>` + `Origin: https://console.notifyer-systems.com`

**Xano Function Stack:**
1. `cors_origin_console` → check origin (no `/get_user`!)
2. `Add Or Edit Record In zapier_make_webhooks` → `model`

**Note:** Xano's "Add Or Edit Record" requires a complete record. The `update-webhook.js`
script performs a fetch-then-patch: loads current state via `GET /webhook/dev`, merges your
overrides, then sends the full object.

**Path Parameter:** `id` (integer)

**Request Body:** Full webhook record (same fields as create, minus `active_signature`).

**Response:** Updated webhook record (As Self → `var: model`).

---

### `DELETE /api:qh9OQ3OW/webhook/dev/{id}`

**⚠️ PUBLIC ENDPOINT** — Xano marks this as "Public Endpoint" with no "Authentication Required" badge.

Xano only runs `cors_origin_console` (CORS check). There is **no `/get_user` call**.
This means Xano does not enforce user identity for this operation server-side.

**Authentication:** `Origin: https://console.notifyer-systems.com` (CORS only)

**Xano Function Stack:**
1. `cors_origin_console` → check origin
2. `Delete Record In zapier_make_webhooks`

**Path Parameter:** `id` (integer)

**Response:** Empty — no Response keys defined in Xano.
The `delete-webhook.js` script synthesizes `{ deleted: true, id, type: "dev" }` for agent clarity.

---

## IO Webhooks (`/user/io/webhook`)

### `GET /api:qh9OQ3OW/user/io/webhook`

Returns all IO webhooks for the authenticated user.

**Authentication:** `Authorization: Bearer <token>` (no CORS header needed)

**Xano Function Stack:**
1. `get_user` → user
2. `Query All Records From webhook_incoming_and_outgoing` → `webhooks`

**Response:** Direct array (As Self → `var: webhooks`).

```json
[
  {
    "id": "abc123",
    "webhooks": "https://myapp.com/webhook",
    "is_active": true,
    "created_at": 1706184000000
  }
]
```

**Note:** `id` is **text** (string) type in Xano for IO webhooks, unlike dev webhooks where `id` is integer.

---

### `POST /api:qh9OQ3OW/user/io/webhook`

Creates a new IO webhook.

**Authentication:** `Authorization: Bearer <token>` (no CORS header needed)

**Xano Function Stack:**
1. `get_user` → user
2. `Create Variable: webhookData = NA`
3. `Conditional: active_signature == true`
   - If true: Create Secret Key → `signature`; Add Record In `webhook_incoming_and_outgoing` → `webhookData`
   - Else: Add Record In `webhook_incoming_and_outgoing` → `webhookData`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `webhook` | text | ✓ | Target URL (singular — not "webhooks") |
| `status` | bool | ✓ | true = active |
| `active_signature` | bool | ✓ | Generate HMAC signature secret key |

> Note the field name difference: POST uses `webhook` (singular) while GET returns records as `webhooks` (plural). This is a Xano field naming inconsistency — the scripts handle it transparently.

**Response:** Created record (As Self → `var: webhookData`).

---

### `PATCH /api:qh9OQ3OW/user/io/webhook`

Updates an IO webhook.

**Authentication:** `Authorization: Bearer <token>` (no CORS header needed)

**Xano Function Stack:**
1. `get_user` → user
2. `Add Or Edit Record In webhook_incoming_and_outgoing` → `updateData`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | text | ✓ | Webhook ID (TEXT type — do not cast to integer) |
| `webhook` | text | ✓ | Target URL |
| `status` | bool | ✓ | true = active |

**Response:** Updated record (As Self → `var: updateData`).

---

### `DELETE /api:qh9OQ3OW/user/io/webhook`

Deletes an IO webhook. Fully authenticated (has `/get_user`).

**Authentication:** `Authorization: Bearer <token>` (no CORS header needed)

**Xano Function Stack:**
1. `get_user` → user
2. `Delete Record In webhook_incoming_and_outgoing`
3. `Return: { "success": "true" } | json_decode`

**Query Parameter:** `id` (text)

**Response:**
```json
{ "success": "true" }
```

> `success` is a **string** (`"true"`), not a boolean. This is explicit Xano behavior
> from the Return step: `json_decode('{"success":"true"}')`. The script preserves this
> and adds `id` and `type` fields for agent convenience.

---

## Feature Status (`/user/incoming_outgoing/feature/status`)

Controls whether the IO webhook feature is globally active for the user's account.

### `GET /api:qh9OQ3OW/user/incoming_outgoing/feature/status`

Returns the current feature activation status.

**Authentication:** `Authorization: Bearer <token>` (no CORS)

**Xano Function Stack:**
1. `get_user` → user
2. `Get Record From embedded_users` → `featureStatus`

**Response:** User's `embedded_users` record as `featureStatus` (As Self).

---

### `PATCH /api:qh9OQ3OW/user/incoming_outgoing/feature/status`

Enables or disables the IO webhook feature.

**Authentication:** `Authorization: Bearer <token>` (no CORS)

**Xano Function Stack:**
1. `get_user` → user
2. `Add Or Edit Record In embedded_users` → `updateStatus`

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `is_incomingOutgoing_active` | bool | true = enable IO webhook feature |

**Response:** Updated `embedded_users` record (As Self → `var: updateStatus`).

> This is a global toggle. IO webhooks must be both individually active (`status: true`)
> AND have this feature flag enabled to receive events.

---

## Manual Phone Registration (`/user/developer/register_phone_manual`)

### `POST /api:qh9OQ3OW/user/developer/register_phone_manual`

Manually registers a phone number using a PIN received via WhatsApp.

**Authentication:** `Authorization: Bearer <token>` (no CORS)

**Xano Function Stack:**
1. `get_user` → user
2. `Get Record From embedded_users` → `embedded_user`
3. `Lambda Function` → `send_request`
4. `Add Record In register_phone_manually_log`
5. `Return var: send_request`

**Request Body:**

| Field | Type | Notes |
|-------|------|-------|
| `pin` | integer | The PIN received on WhatsApp. **Must be an integer** (not a string). Xano types this as `integer`. |

**Response:** As Self → `var: send_request` (the Lambda Function result — external API response).

> This endpoint is for developer-level manual phone registration, separate from the
> standard embedded signup WhatsApp connection flow.

---

## Scripts Reference

| Script | Covers | Key Flags |
|--------|--------|-----------|
| `list-webhooks.js` | `GET /webhook/dev` + `GET /user/io/webhook` | `--type dev\|io`, `--pretty` |
| `create-webhook.js` | `POST /webhook/dev/create` + `POST /user/io/webhook` | `--type dev\|io`, `--url`, `--outgoing`, `--incoming`, `--schedule-activity`, `--waiting-duration`, `--signature` |
| `update-webhook.js` | `PATCH /webhook/dev/:id` + `PATCH /user/io/webhook` | `--type dev\|io`, `--id`, `--url`, `--status` |
| `delete-webhook.js` | `DELETE /webhook/dev/:id` + `DELETE /user/io/webhook` | `--type dev\|io`, `--id`, `--confirm` |

---

## Common Errors

| HTTP | Meaning | Script Behavior |
|------|---------|-----------------|
| 400 | Dev webhook: duplicate URL (Precondition Failed) | `{ ok: false, blocked: true, error: "A webhook pointing to ... already exists." }` |
| 401 | Invalid or missing auth token | `{ ok: false, error: "..." }` |
| 403 | CORS check failed (missing/wrong Origin) | `{ ok: false, error: "..." }` — should not happen; scripts send Origin automatically |
| 404 | Webhook id not found | `{ ok: false, error: "... not found" }` |

---

## Data Type Summary

| Field | Dev Webhook | IO Webhook |
|-------|-------------|------------|
| `id` | integer | text (string) |
| `webhooks` / `webhook` | `webhooks` (plural) | `webhooks` in GET, `webhook` (singular) in POST/PATCH body |
| `status` | bool | bool |
| `signature_secret` | text or null | text or null (if active_signature was set) |
