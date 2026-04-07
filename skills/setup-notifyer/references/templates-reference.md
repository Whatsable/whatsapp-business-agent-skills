# Templates Reference

WhatsApp message templates are pre-approved message formats required for the first outbound
message to a contact (outside the 24-hour customer-service window). All templates are
reviewed by Meta before they can be used.

**API Group:** `/api:AFRA_QCy`
**Auth:** `Authorization: Bearer <jwt>` (console auth — `NOTIFYER_API_TOKEN`)

---

## Template data model

```typescript
interface Template {
  id: string;                   // Notifyer internal record ID
  name: string;                 // template name (snake_case, e.g. "order_confirmation")
  template_id: string;          // Notifyer's internal template_id string
  whatsapp_template_id: number; // Meta's numeric WhatsApp template ID (used for deletion)
  category: string;             // "MARKETING" | "UTILITY" | "AUTHENTICATION"
  type: string;                 // "text" | "image" | "document" | "video"
  body: string;                 // Message body text
  language: string;             // IETF language code, e.g. "en", "es", "fr"
  status: string;               // "approved" | "pending" | "rejected"
  components: object[];         // Raw WhatsApp template components (from Meta API)
}
```

The `components` array contains the full WhatsApp template definition including:
- `HEADER` — media type and example URL (for image/video/document templates)
- `BODY` — body text and `example.body_text` (per-variable examples)
- `FOOTER` — optional footer text (AUTHENTICATION security recommendation)
- `BUTTONS` — interactive button definitions

---

## Endpoints

### List all templates

**GET `/api:AFRA_QCy/templates_web`**

Returns all templates for the workspace. No server-side pagination or filters — all
filtering is done client-side.

**Auth:** Bearer console token

**Response:** `Template[]` (direct array)

**Script:**
```bash
node scripts/list-templates.js
node scripts/list-templates.js --status approved
node scripts/list-templates.js --category MARKETING
node scripts/list-templates.js --pretty
```

---

### List broadcast-ready templates (approved only)

**GET `/api:AFRA_QCy/templates_broadcast_web`**

Returns only `approved` templates — the subset usable for broadcasts and test sends.
Used by the Broadcasts page and TestMessageSender component.

**Auth:** Bearer console token

**Response:** `Template[]` (same shape, pre-filtered to approved status)

> This endpoint is not wrapped in a script as `list-templates.js --status approved`
> achieves the same result client-side.

---

### Get template by name / ID

There is no dedicated GET-by-ID endpoint. Use `list-templates.js` and filter:

**Script:**
```bash
node scripts/get-template.js --name order_confirmation
node scripts/get-template.js --id tmpl_abc123
node scripts/get-template.js --whatsapp-id 123456789
```

---

### Create a template

**POST `/api:AFRA_QCy/create`**

Submits a new template for Meta review. Approval typically takes under 60 seconds.

**Auth:** Bearer console token

**Request body:**

```typescript
interface CreateTemplatePayload {
  name: string;                  // snake_case, lowercase, no leading digit, max 512 chars
  category: string;              // "MARKETING" | "UTILITY" | "AUTHENTICATION"
  language: string;              // e.g. "en"
  templateType: string;          // "text" | "image" | "document" | "video"
  mediaUrl: string;              // media handle from upload (for non-text; empty string for text)
  temBody: string;               // body text (use {{1}}, {{2}} for variable placeholders)
  mediaUrlVariableValues: string; // variable for dynamic media URL; usually ""
  bodyVariables: number[];       // sorted array of variable indices, e.g. [1, 2, 3]
  variableValues: { [index: number]: string }; // example values for Meta review
  buttons: PreparedButton[];     // button objects (see Button shapes below)

  // AUTHENTICATION only:
  addSecurityRecommendation?: boolean; // adds "For your security, do not share this code." footer
  codeExpirationMinutes?: number;      // code validity in minutes (default: 10)
  otpButtonText?: string;              // CTA button label (default: "Copy Code")
}
```

**Script:**
```bash
# Simple text template
node scripts/create-template.js \
  --name order_confirmation \
  --category MARKETING \
  --body "Hello {{1}}, your order #{{2}} is confirmed." \
  --variables '{"1":"John","2":"12345"}'

# With image attachment (auto-uploads media)
node scripts/create-template.js \
  --name promo_banner \
  --category MARKETING \
  --body "Check out our sale!" \
  --type image \
  --media-url "https://example.com/banner.jpg"

# AUTHENTICATION (body auto-generated)
node scripts/create-template.js \
  --name verify_otp \
  --category AUTHENTICATION \
  --expiry 10
```

**Response:** The Xano create response (includes success status and template details).

After submission, poll `get-template.js --name <name>` to check when `status` changes
from `"pending"` to `"approved"` or `"rejected"`.

---

### Media pre-upload

Before creating a non-text template, the media file must be pre-uploaded to get a
**handle** string that is passed as `mediaUrl` in the create payload.

**GET `/api:ox_LN9zX/get_file_base46_encode?attachment=<url>`**

**Auth:** Bearer console token

**Input:** Public URL of the media file (PNG/JPG/MP4/PDF)

**Response:**
```json
{
  "success": true,
  "handle": "<opaque handle string>"
}
```

`create-template.js --media-url <url>` calls this automatically.
Use `--media-handle <handle>` to skip re-upload if you already have a handle.

**Supported formats:**

| Template type | Accepted formats |
|--------------|-----------------|
| `image`      | PNG, JPG         |
| `video`      | MP4              |
| `document`   | PDF              |

---

### Delete a template

**DELETE `/api:AFRA_QCy/templates/delete`**

**Auth:** Bearer console token

**Request body:**
```json
{ "whatsapp_template_id": 123456789 }
```

**Response:**
```json
{
  "success": true,
  "result": { "success": true }
}
```

> Template deletion is not wrapped in a script in Phase 2a but the endpoint is documented
> for completeness. Use `get-template.js` to look up `whatsapp_template_id` before deleting.

---

## Template name rules

| Rule | Details |
|------|---------|
| Characters | Lowercase letters (`a–z`), digits (`0–9`), underscores (`_`), Unicode letters |
| Leading character | Must start with a letter (not a digit) |
| Case | Lowercase only — the frontend enforces this |
| Spaces | Not allowed; use underscores instead |
| Max length | 512 characters |

✓ `order_confirmation`, `promo_2024`, `invoice_en`
✗ `OrderConfirmation` (uppercase), `2fa_code` (leading digit), `promo banner` (space)

---

## Categories

| Category | Use case | Meta pricing |
|----------|---------|-------------|
| `MARKETING` | Promotions, offers, product announcements | Marketing conversation rate |
| `UTILITY` | Order updates, confirmations, service notifications | Utility conversation rate |
| `AUTHENTICATION` | OTP / verification codes | Authentication conversation rate |

Authentication templates have a fixed auto-generated body — the `--body` flag is
not used. Xano generates: `<code> is your verification code. For your security,
do not share this code. This code expires in <N> minutes.`

---

## Template types (media)

| Type | Header | Media required |
|------|--------|---------------|
| `text` | None | No |
| `image` | Image (PNG/JPG) | Yes — pre-upload via `/api:ox_LN9zX/get_file_base46_encode` |
| `document` | Document (PDF) | Yes — pre-upload required |
| `video` | Video (MP4) | Yes — pre-upload required |

---

## Button shapes

All button types require an `id` (auto-assigned by `create-template.js`) and `type`.

### Quick Reply
```json
{ "type": "Quick Reply", "text": "Yes" }
```

### Visit Website (static URL)
```json
{
  "type": "Visit Website",
  "buttonText": "View Order",
  "urlType": "static",
  "buttonUrl": "https://example.com/orders"
}
```

### Visit Website (dynamic URL)
```json
{
  "type": "Visit Website",
  "buttonText": "Track",
  "urlType": "dynamic",
  "buttonUrl": "https://example.com/track/",
  "dynamicValue": "order_id"
}
```
Dynamic URLs append a variable at the end: `https://example.com/track/{{1}}`.

### Call Phone Number
```json
{
  "type": "Call Phone Number",
  "buttonText": "Call Us",
  "phoneNumber": "+14155550123"
}
```

### Copy Offer Code
```json
{ "type": "Copy Offer Code", "code": "SAVE20" }
```

### Button limits

| Type | Max |
|------|-----|
| Quick Reply | 10 |
| Visit Website | 2 |
| Call Phone Number | 1 |
| Copy Offer Code | 1 |
| **Total buttons** | **10** |

---

## Body variables

Dynamic content is inserted via numbered placeholders: `{{1}}`, `{{2}}`, etc.

- Must be sequential starting at `{{1}}`
- Must all have example values in `variableValues` — Meta requires examples during review
- Example values are shown to the Meta reviewer; use realistic dummy data

**Example:**
```
Body:    "Hello {{1}}, your order #{{2}} ships on {{3}}."
Variables: { "1": "John", "2": "12345", "3": "Dec 25" }
```

When sending the template (via `POST /api:hFrjh8a1/send_template_message_by_api`),
the `__self` field maps variable indices to actual runtime values:
```json
{ "__self": { "1": "Jane", "2": "67890", "3": "Dec 26" } }
```

---

## Status lifecycle

```
submitted → pending → approved   (ready to use)
                    ↘ rejected   (must create a new template; cannot edit and re-submit)
```

- `pending` — under Meta review; typically resolves in under 60 seconds
- `approved` — template can be used in broadcasts, chat sends, and developer API calls
- `rejected` — template failed Meta review; check `components` for rejection reason

Poll for status after creation:
```bash
# Wait a minute, then check:
node scripts/get-template.js --name order_confirmation --pretty
```

---

## Chat frontend template endpoint

The chat frontend (`chat.notifyer_frontend`) fetches templates via a different endpoint
that uses **chat auth** (raw token):

**GET `/api:bVXsw_FD/web/templates`**
**Auth:** `Authorization: <token>` (no Bearer prefix)

This is used internally by the chat UI to populate the template picker when composing
messages. The data shape includes a nested `components` object with full WhatsApp
component details, plus `variable_counts`, `name_with_details`, and `template_formate`.
This endpoint is read-only from a management perspective and is not wrapped in a script.

---

## Workflow: Create and verify a template

```bash
# 1. Create the template
node scripts/create-template.js \
  --name order_ready \
  --category UTILITY \
  --body "Hi {{1}}, your order is ready for pickup at {{2}}." \
  --variables '{"1":"Alice","2":"Store #42"}'

# 2. Wait ~60 seconds, then check status
node scripts/get-template.js --name order_ready --pretty

# 3. Once approved, verify it appears in the broadcast-ready list
node scripts/list-templates.js --status approved --pretty

# 4. To send it via developer API (requires api_key):
#    node scripts/get-api-key.js --pretty
#    curl -X POST https://api.insightssystem.com/api:hFrjh8a1/send_template_message_by_api \
#      -H "Content-Type: application/json" \
#      -H "Authorization: <api_key>" \
#      -d '{"phone_number":"14155550123","template":"order_ready","__self":{"1":"Bob","2":"Store #5"}}'
```
