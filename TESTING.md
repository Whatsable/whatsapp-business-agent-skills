# Notifyer Agent Skills — Test Suite

Comprehensive test cases for all 57 scripts across `setup-notifyer`, `automate-notifyer`, and `chat-notifyer`.

Each test is a natural-language prompt you give to an AI agent. The **Expected script** column tells you what the agent _should_ call. The **Pass criteria** tells you how to verify it worked correctly.

---

## Prerequisites

Before running any test, complete this one-time setup:

```bash
export NOTIFYER_API_BASE_URL="https://api.insightssystem.com"

# Get a token
cd skills/setup-notifyer
node scripts/login.js --email you@example.com --password "YourPass@1"
export NOTIFYER_API_TOKEN="eyJ..."

# Confirm everything is healthy
node scripts/doctor.js --pretty
```

All tests assume:
- `NOTIFYER_API_BASE_URL` and `NOTIFYER_API_TOKEN` are set
- The account has an Admin or Super Admin role
- The WhatsApp number is connected (`isConnected: true`)
- The plan is active

Where a test requires specific IDs (label ID, bot ID, phone number, etc.), substitute real values from your workspace.

---

## Test Index

| # | Script | Skill | Category |
|---|--------|-------|----------|
| S01 | `doctor.js` | setup | Health |
| S02 | `login.js` | setup | Auth |
| S03 | `create-account.js` | setup | Auth |
| S04 | `get-me.js` | setup | Auth |
| S05 | `get-connection-status.js` | setup | WhatsApp |
| S06 | `refresh-connection.js` | setup | WhatsApp |
| S07 | `list-plans.js` | setup | Plans |
| S08 | `get-user-plan.js` | setup | Plans |
| S09 | `list-members.js` | setup | Team |
| S10 | `invite-member.js` | setup | Team |
| S11 | `update-member.js` | setup | Team |
| S12 | `remove-member.js` | setup | Team |
| S13 | `list-labels.js` | setup | Labels |
| S14 | `create-label.js` | setup | Labels |
| S15 | `update-label-keywords.js` | setup | Labels |
| S16 | `delete-label.js` | setup | Labels |
| S17 | `get-api-key.js` | setup | API Key |
| A01 | `list-templates.js` | automate | Templates |
| A02 | `get-template.js` | automate | Templates |
| A03 | `create-template.js` | automate | Templates |
| A04 | `delete-template.js` | automate | Templates |
| A05 | `list-bots.js` | automate | AI Bots |
| A06 | `get-bot.js` | automate | AI Bots |
| A07 | `create-bot.js` | automate | AI Bots |
| A08 | `update-bot.js` | automate | AI Bots |
| A09 | `set-default-bot.js` | automate | AI Bots |
| A10 | `delete-bot.js` | automate | AI Bots |
| A11 | `list-broadcasts.js` | automate | Broadcasts |
| A12 | `get-broadcast.js` | automate | Broadcasts |
| A13 | `create-broadcast.js` | automate | Broadcasts |
| A14 | `delete-broadcast.js` | automate | Broadcasts |
| A15 | `get-message-analytics.js` | automate | Analytics |
| A16 | `get-message-logs.js` | automate | Analytics |
| A17 | `list-webhooks.js` | automate | Webhooks |
| A18 | `create-webhook.js` | automate | Webhooks |
| A19 | `update-webhook.js` | automate | Webhooks |
| A20 | `delete-webhook.js` | automate | Webhooks |
| C01 | `list-recipients.js` | chat | Recipients |
| C02 | `get-recipient.js` | chat | Recipients |
| C03 | `filter-recipients-by-label.js` | chat | Recipients |
| C04 | `update-recipient.js` | chat | Recipients |
| C05 | `send-text.js` | chat | Messaging |
| C06 | `send-template.js` | chat | Messaging |
| C07 | `send-attachment.js` | chat | Messaging |
| C08 | `assign-label.js` | chat | Labels |
| C09 | `remove-label.js` | chat | Labels |
| C10 | `set-handoff.js` | chat | AI Handoff |
| C11 | `assign-bot.js` | chat | AI Handoff |
| C12 | `list-bots.js` | chat | AI Handoff |
| C13 | `list-scheduled.js` | chat | Scheduled |
| C14 | `delete-scheduled.js` | chat | Scheduled |
| C15 | `add-note.js` | chat | Notes |
| C16 | `get-notes.js` | chat | Notes |
| C17 | `get-conversation.js` | chat | History |
| C18 | `get-conversation-log.js` | chat | History |
| W01–W06 | — | all | Integration workflows |
| E01–E10 | — | all | Error & edge cases |

---

## setup-notifyer Tests

### S01 — doctor.js

**Prompt:**
> "Run a health check on the Notifyer setup and tell me if everything is configured correctly."

**Expected script:** `setup-notifyer/scripts/doctor.js --pretty`

**Pass criteria:**
- Calls `doctor.js` (not `get-me.js` alone)
- Output includes all four checks: `base_url`, `token`, `connection`, `plan`
- Returns `{ "ok": true, "data": { "all_healthy": true } }` when everything is configured
- Agent summarises each check result clearly

---

### S02 — login.js

**Prompt:**
> "Log in to Notifyer with email agent@company.com and password TestPass@99 and give me the auth token."

**Expected script:** `setup-notifyer/scripts/login.js --email agent@company.com --password "TestPass@99"`

**Pass criteria:**
- Returns `{ "ok": true, "data": { "authToken": "eyJ..." } }`
- Agent extracts the token and sets or suggests setting `NOTIFYER_API_TOKEN`
- Agent does NOT log the password in the conversation output beyond what's needed

---

### S03 — create-account.js

**Prompt:**
> "Create a new Notifyer account with name 'Test Corp', email testcorp@example.com, password TestCorp@123, and phone number 14155550100."

**Expected script:** `setup-notifyer/scripts/create-account.js --name "Test Corp" --email testcorp@example.com --password "TestCorp@123" --phone 14155550100`

**Pass criteria:**
- Returns `{ "ok": true, "data": { "authToken": "...", "user": {...}, "apiKey": {...} } }`
- Agent captures the returned `authToken` and notes it can be used immediately as `NOTIFYER_API_TOKEN`
- Does NOT attempt to call login.js afterwards (token is already returned)

---

### S04 — get-me.js

**Prompt:**
> "Who am I logged in as on Notifyer? Show me my profile."

**Expected script:** `setup-notifyer/scripts/get-me.js`

**Pass criteria:**
- Returns `{ "ok": true, "data": { "name": "...", "email": "...", "role": "..." } }`
- Agent surfaces at minimum: name, email, and role

---

### S05 — get-connection-status.js

**Prompt:**
> "Is the WhatsApp connection active on this Notifyer account? Show me the full status."

**Expected script:** `setup-notifyer/scripts/get-connection-status.js --pretty`

**Pass criteria:**
- Returns `{ "ok": true, "data": { "isConnected": true/false, "degraded": false, "meta_errors": [], ... } }`
- Agent explicitly states whether `isConnected` is true or false
- If `degraded: true`, agent flags this as a warning even though `isConnected` is true
- Agent reports onboarding steps completed (out of 5)

---

### S06 — refresh-connection.js

**Prompt:**
> "The WhatsApp connection looks stale. Force a re-sync with Meta to refresh the registration status."

**Expected script:** `setup-notifyer/scripts/refresh-connection.js --pretty`

**Pass criteria:**
- Calls `refresh-connection.js`, not `get-connection-status.js`
- Returns updated connection status
- Agent warns about the daily refresh limit if the API returns a rate limit error

---

### S07 — list-plans.js

**Prompt:**
> "What subscription plans are available on Notifyer? Show me the Pro tier monthly and annual options."

**Expected script:** `setup-notifyer/scripts/list-plans.js --tier pro --pretty`

**Pass criteria:**
- Returns plan objects with `price`, `unique_numbers`, and `stripe_price_id`
- Agent distinguishes between monthly and annual pricing
- Agent notes that plan changes require the browser UI (Stripe checkout)

---

### S08 — get-user-plan.js

**Prompt:**
> "What is the current subscription status and how many contacts have been used this billing cycle?"

**Expected script:** `setup-notifyer/scripts/get-user-plan.js --pretty`

**Pass criteria:**
- Returns `{ "usages": N, "latest_plan": { "status": "active", "unique_number_limit": N, ... } }`
- Agent calculates and states the usage percentage (e.g. "142 / 500 contacts used — 28%")
- Agent flags if status is `canceled` or `new_user` (limited credits)

---

### S09 — list-members.js

**Prompt:**
> "Show me all team members in this Notifyer workspace, including what labels each person has access to."

**Expected script:** `setup-notifyer/scripts/list-members.js --labels --pretty`

**Pass criteria:**
- Returns `{ "items": [...], "team_seat": { "included_seats": N } }`
- Agent uses `--labels` flag to also fetch label names
- Agent shows each member's name, email, and role
- Agent notes total seats used vs. included

---

### S10 — invite-member.js

**Prompt:**
> "Add a new team member: name 'Sarah Jones', email sarah@company.com, password Member@2025, role 'Team Member', with access to the Support and Sales labels."

**Expected script:** `setup-notifyer/scripts/invite-member.js --name "Sarah Jones" --email sarah@company.com --password "Member@2025" --role "Team Member" --labels "Support,Sales"`

**Pass criteria:**
- Returns `{ "ok": true, "data": { ... } }` with the new member's details
- Agent notes credentials must be shared with Sarah out-of-band (no email invite)
- Agent does NOT attempt a separate login step

---

### S11 — update-member.js

**Prompt:**
> "Promote the team member with ID <uuid> to Admin role."

**Expected script:** `setup-notifyer/scripts/update-member.js --id <uuid> --role Admin`

**Pass criteria:**
- Script fetches current member state first (fetch-then-patch)
- Returns updated member with `role: "Admin"`
- Agent confirms the promotion was successful
- Agent does NOT clear labels manually (script handles this automatically for Admin role)

**Also test:**
> "Change the labels for member <uuid> to only VIP and Support."

**Expected:** `update-member.js --id <uuid> --labels "VIP,Support"`

---

### S12 — remove-member.js

**Prompt:**
> "Remove team member with ID <uuid> from the workspace. I confirm this is intentional."

**Expected script:** `setup-notifyer/scripts/remove-member.js --id <uuid> --confirm`

**Pass criteria:**
- Agent includes `--confirm` flag (should NOT run without it)
- Returns `{ "ok": true }` or deletion confirmation
- Agent warns this is permanent and irreversible

**Negative test:**
> "Remove team member <uuid>" (no explicit confirmation)

Agent should ask for confirmation before running with `--confirm`, or explain that `--confirm` is required.

---

### S13 — list-labels.js

**Prompt:**
> "List all workspace labels and their auto-assignment keywords."

**Expected script:** `setup-notifyer/scripts/list-labels.js --pretty`

**Pass criteria:**
- Returns `{ "labels": [...], "count": N }`
- Each label shows `id`, `label` name, and `keywords`
- Agent notes that Team Members only see their assigned labels

---

### S14 — create-label.js

**Prompt:**
> "Create a new label called 'Hot Lead' with keywords: demo, pricing, buy, quote."

**Expected script:** `setup-notifyer/scripts/create-label.js --label "Hot Lead" --keywords "demo,pricing,buy,quote"`

**Pass criteria:**
- Returns `{ "ok": true, "data": { "id": N, "label": "Hot Lead", "keywords": "demo,pricing,buy,quote" } }`
- Agent captures the label `id` for future use

**Duplicate test:**
> "Create a label called 'Hot Lead' again"

Agent should return `{ "ok": false, "blocked": true }` and explain the label name already exists.

---

### S15 — update-label-keywords.js

**Prompt:**
> "Add the keyword 'urgent' to label ID 5."

**Expected script:** `setup-notifyer/scripts/update-label-keywords.js --id 5 --add "urgent"`

**Pass criteria:**
- Script fetches current keywords first (fetch-then-patch)
- Returns updated label with `urgent` added to existing keywords
- Existing keywords are preserved

**Also test:**
> "Rename label ID 5 to 'Priority Lead' and replace all keywords with just 'priority, hot'."

**Expected:** `update-label-keywords.js --id 5 --label "Priority Lead" --set "priority,hot"`

---

### S16 — delete-label.js

**Prompt:**
> "Delete label ID 5. I understand this is permanent."

**Expected script:** `setup-notifyer/scripts/delete-label.js --id 5 --confirm`

**Pass criteria:**
- Includes `--confirm` flag
- Returns `{ "ok": true, "data": { "deleted": true, "id": 5 } }`
- Agent warns that team members with this label must be manually updated via `update-member.js`

---

### S17 — get-api-key.js

**Prompt:**
> "I need to set up a Make.com automation. Get me the Notifyer developer API key."

**Expected script:** `setup-notifyer/scripts/get-api-key.js --pretty`

**Pass criteria:**
- Returns `{ "ok": true, "data": { "api_key": "..." } }`
- Agent surfaces the `api_key` value
- Agent notes: use the "Notifyer Systems" module in Make (not "WhatsAble"), and this key authenticates as raw `Authorization: <api_key>` (no Bearer prefix)
- Agent does NOT confuse `api_key` with `NOTIFYER_API_TOKEN`

---

## automate-notifyer Tests

### A01 — list-templates.js

**Prompt:**
> "Show me all WhatsApp templates in this workspace and their approval status."

**Expected script:** `automate-notifyer/scripts/list-templates.js --pretty`

**Pass criteria:**
- Returns array of templates with `name`, `status`, and `category`
- Agent notes that PENDING templates are auto-synced from Meta on each call
- Agent distinguishes between `APPROVED`, `PENDING`, and `REJECTED` templates

---

### A02 — get-template.js

**Prompt:**
> "Get the details of the template named 'order_confirm'."

**Expected script:** `automate-notifyer/scripts/get-template.js --name order_confirm`

**Pass criteria:**
- Returns single template object with full body and variable count
- If not found, returns `{ "ok": false }` with a clear error

---

### A03 — create-template.js

**Prompt:**
> "Create a WhatsApp template called 'shipment_update' in the UTILITY category. The body should be: 'Hi {{1}}, your order {{2}} has shipped and will arrive by {{3}}.' It has 3 variables."

**Expected script:** `automate-notifyer/scripts/create-template.js --name "shipment_update" --category UTILITY --body "Hi {{1}}, your order {{2}} has shipped and will arrive by {{3}}." --variables 3`

**Pass criteria:**
- Returns `{ "ok": true, "data": { "status": "PENDING", ... } }`
- Agent explains that approval takes 24–72 hours and the template cannot be used until status is `APPROVED`
- Agent does NOT attempt to use the template immediately

---

### A04 — delete-template.js

**Prompt:**
> "Delete template with WhatsApp template ID 987654321. I confirm this is permanent."

**Expected script:** `automate-notifyer/scripts/delete-template.js --id 987654321 --confirm`

**Pass criteria:**
- Uses the integer `whatsapp_template_id` (from `list-templates.js` output), not the template name
- Includes `--confirm` flag
- Agent warns about Meta's 30-day name reuse restriction

**Negative test:**
> "Delete the template called 'old_promo'" (name, not ID)

Agent should first call `get-template.js --name old_promo` to retrieve the `whatsapp_template_id`, then call `delete-template.js` with the integer ID.

---

### A05 — list-bots.js

**Prompt:**
> "List all AI bots configured in this workspace."

**Expected script:** `automate-notifyer/scripts/list-bots.js --pretty`

**Pass criteria:**
- Returns array of bots with `id`, `name`, `is_default`, and configuration fields
- Agent identifies which bot (if any) is the default

---

### A06 — get-bot.js

**Prompt:**
> "Show me the full configuration of bot with ID 3."

**Expected script:** `automate-notifyer/scripts/get-bot.js --id 3`

**Pass criteria:**
- Returns single bot object with all fields including `mission`, `tone`, `delay_in_seconds`
- If bot ID doesn't exist, returns `{ "ok": false }` with a 404-style error

---

### A07 — create-bot.js

**Prompt:**
> "Create a new AI bot called 'Support Assistant'. Its mission is to help customers with product support questions. Use a Friendly tone, model gpt-4o, and make it the default bot."

**Expected script:** `automate-notifyer/scripts/create-bot.js --name "Support Assistant" --mission "Help customers with product support questions." --tone "Friendly" --model gpt-4o --default`

**Pass criteria:**
- Returns `{ "ok": true, "data": { "id": N, ... } }`
- Agent captures the new bot's `id`
- If OpenAI key is not configured in Notifyer, returns an error — agent should suggest configuring it in the console UI

---

### A08 — update-bot.js

**Prompt:**
> "Update bot ID 3: change the tone to 'Professional' and set the response delay to 8 seconds."

**Expected script:** `automate-notifyer/scripts/update-bot.js --id 3 --tone "Professional" --delay 8`

**Pass criteria:**
- Returns updated bot object
- Agent only changes the specified fields (fetch-then-patch behaviour)
- Agent notes that updates resync with OpenAI and may fail if the OpenAI key is invalid

---

### A09 — set-default-bot.js

**Prompt:**
> "Make bot ID 5 the default bot for this workspace."

**Expected script:** `automate-notifyer/scripts/set-default-bot.js --id 5`

**Pass criteria:**
- Returns `{ "ok": true }` confirmation
- Agent notes this unsets any previously set default bot
- Agent notes Admin or Super Admin role is required

---

### A10 — delete-bot.js

**Prompt:**
> "Permanently delete bot ID 3. I know this will also delete the OpenAI Assistant."

**Expected script:** `automate-notifyer/scripts/delete-bot.js --id 3 --confirm`

**Pass criteria:**
- Includes `--confirm` flag
- Agent warns that the OpenAI Assistant is also deleted and this is irreversible
- Agent warns if deleting the default bot (check `is_default` from `get-bot.js` first)

---

### A11 — list-broadcasts.js

**Prompt:**
> "Show me all upcoming scheduled broadcasts."

**Expected script:** `automate-notifyer/scripts/list-broadcasts.js --require upcoming --pretty`

**Pass criteria:**
- Returns broadcasts filtered to `upcoming` status
- Each broadcast shows name, template, scheduled time, and recipient count
- Agent uses `--require upcoming` flag specifically

**Also test:**
> "Show me broadcasts that are currently sending."

**Expected:** `list-broadcasts.js --require ongoing`

---

### A12 — get-broadcast.js

**Prompt:**
> "Get the details of the broadcast called 'Jan Promo'."

**Expected script:** `automate-notifyer/scripts/get-broadcast.js --name "Jan Promo"`

**Pass criteria:**
- Returns single broadcast object with full details
- If not found, returns clear error

---

### A13 — create-broadcast.js

**Prompt:**
> "Schedule a broadcast called 'Feb Newsletter' using the approved template 'monthly_update'. Send it to all contacts in customers.csv on 15th February 2026 at 10:00 AM."

**Expected script:** `automate-notifyer/scripts/create-broadcast.js --name "Feb Newsletter" --template monthly_update --recipients customers.csv --schedule "15/02/2026 10:00"`

**Pass criteria:**
- Completes the 3-step broadcast creation flow
- Returns the created broadcast with scheduled time
- Agent confirms only `APPROVED` templates can be used — should verify template status first with `list-templates.js` if unsure
- Agent warns that `customers.csv` must follow the expected format

---

### A14 — delete-broadcast.js

**Prompt:**
> "Cancel the upcoming broadcast with ID 7. I confirm I want to delete it."

**Expected script:** `automate-notifyer/scripts/delete-broadcast.js --id 7 --confirm`

**Pass criteria:**
- Includes `--confirm` flag
- Returns deletion confirmation
- Agent warns this only stops future batches — messages already sent cannot be recalled
- Agent recommends verifying the broadcast is still `upcoming` (not `ongoing`) before deleting

---

### A15 — get-message-analytics.js

**Prompt:**
> "Give me the messaging analytics for January 2026 — how many messages were sent, delivered, and read?"

**Expected script:** `automate-notifyer/scripts/get-message-analytics.js --from "01/01/2026" --to "31/01/2026" --pretty`

**Pass criteria:**
- Returns `{ sent, delivered, read, ... }` summary stats
- Agent calculates and states delivery rate and read rate as percentages
- Uses `DD/MM/YYYY` date format

---

### A16 — get-message-logs.js

**Prompt:**
> "Show me the last 20 message delivery logs, filtered to only show messages to phone number 14155550123."

**Expected script:** `automate-notifyer/scripts/get-message-logs.js --phone 14155550123 --pretty`

**Pass criteria:**
- Returns paginated message logs filtered by phone number
- Each log entry shows message type, status, and timestamp

---

### A17 — list-webhooks.js

**Prompt:**
> "List all developer (dev) webhooks currently configured in this workspace."

**Expected script:** `automate-notifyer/scripts/list-webhooks.js --type dev --pretty`

**Pass criteria:**
- Returns dev webhooks array with `id`, `url`, `status`, and configured triggers
- Agent distinguishes `dev` from `io` webhook types

**Also test:**
> "Show me the IO webhooks configured for Make/Zapier."

**Expected:** `list-webhooks.js --type io`

---

### A18 — create-webhook.js

**Prompt:**
> "Create a developer webhook that posts to https://my-app.com/notifyer-hook for both incoming and outgoing messages. Enable HMAC signature verification."

**Expected script:** `automate-notifyer/scripts/create-webhook.js --type dev --url https://my-app.com/notifyer-hook --incoming --outgoing --signature`

**Pass criteria:**
- Returns created webhook with `id` and `hmac_secret`
- Agent stresses the HMAC secret is shown only once and must be saved immediately
- Agent provides the secret to the user prominently

---

### A19 — update-webhook.js

**Prompt:**
> "Update dev webhook ID 3: change the URL to https://new-endpoint.com/hook and disable it."

**Expected script:** `automate-notifyer/scripts/update-webhook.js --type dev --id 3 --url https://new-endpoint.com/hook --status inactive`

**Pass criteria:**
- Script fetches current webhook state first (fetch-then-patch)
- Returns updated webhook
- Agent preserves existing trigger settings (incoming/outgoing) if not specified

---

### A20 — delete-webhook.js

**Prompt:**
> "Delete dev webhook ID 3. I confirm this deletion."

**Expected script:** `automate-notifyer/scripts/delete-webhook.js --type dev --id 3 --confirm`

**Pass criteria:**
- Includes `--confirm` flag
- Script first calls `GET /webhook/dev` to verify ownership before deleting (ownership check)
- Returns deletion confirmation
- If ID is not in the user's webhook list, returns `{ "ok": false, "blocked": true }` with an ownership error — agent should NOT retry

---

## chat-notifyer Tests

### C01 — list-recipients.js

**Prompt:**
> "Show me all unread conversations in Notifyer."

**Expected script:** `chat-notifyer/scripts/list-recipients.js --status unread --pretty`

**Pass criteria:**
- Returns list of recipients with `phone_number`, `name`, `label`, and `last_message_at`
- Agent filters by `--status unread`

**Also test:**
> "Search for a contact named 'Sarah' in the chat."

**Expected:** `list-recipients.js --search "Sarah"`

---

### C02 — get-recipient.js

**Prompt:**
> "Get the full contact details for phone number 14155550123. I want to know if the 24-hour messaging window is open."

**Expected script:** `chat-notifyer/scripts/get-recipient.js --phone 14155550123 --pretty`

**Pass criteria:**
- Returns recipient object with `last_message_at` and AI/handoff status
- Agent explicitly states whether the 24h window is open based on `last_message_at`
- If window is closed, agent proactively suggests using `send-template.js` instead

---

### C03 — filter-recipients-by-label.js

**Prompt:**
> "Find all unread conversations tagged with the 'Support' label."

**Expected script:** `chat-notifyer/scripts/filter-recipients-by-label.js --labels "Support" --status unread --pretty`

**Pass criteria:**
- Returns recipients filtered by label `Support` and status `unread`
- Agent uses `filter-recipients-by-label.js`, not `list-recipients.js`

**Also test:**
> "Find all contacts with both the 'VIP' and 'Sales' labels."

**Expected:** `filter-recipients-by-label.js --labels "VIP,Sales"`

---

### C04 — update-recipient.js

**Prompt:**
> "Rename the contact with phone number 14155550123 to 'John Smith'."

**Expected script:** `chat-notifyer/scripts/update-recipient.js --phone 14155550123 --name "John Smith"`

**Pass criteria:**
- Returns updated recipient with new `name`
- Agent confirms the rename was successful

---

### C05 — send-text.js

**Prompt:**
> "Send a WhatsApp message to 14155550123 saying: 'Hi John, following up on your earlier enquiry. How can I help?'"

**Expected behavior:**
1. Agent calls `get-recipient.js --phone 14155550123` first to check the 24h window
2. If window is open: calls `send-text.js --phone 14155550123 --text "Hi John, following up on your earlier enquiry. How can I help?"`
3. If window is closed: agent does NOT call `send-text.js`, instead suggests `send-template.js`

**Pass criteria:**
- Agent always gates on the 24h window before sending free-text
- Returns `{ "ok": true }` on success
- Agent does not guess — it checks the window first

---

### C06 — send-template.js

**Prompt:**
> "Send the 'order_confirm' template to 14155550123 with variables: body1='John', body2='#ORD-5523'."

**Expected script:** `chat-notifyer/scripts/send-template.js --phone 14155550123 --template order_confirm --variables '{"body1":"John","body2":"#ORD-5523"}'`

**Pass criteria:**
- Returns `{ "ok": true }` on success
- Works regardless of whether the 24h window is open (templates bypass the window)
- Agent correctly formats the `--variables` as a JSON object

**Scheduled template test:**
> "Send the 'order_confirm' template to 14155550123 at 9 AM on 20th March 2026."

**Expected:** `send-template.js --phone 14155550123 --template order_confirm --schedule "20/03/2026 09:00"`

---

### C07 — send-attachment.js

**Prompt:**
> "Send the file ./invoice.pdf to the contact 14155550123."

**Expected behavior:**
1. Agent calls `get-recipient.js --phone 14155550123` to check 24h window
2. If window open: calls `send-attachment.js --phone 14155550123 --file ./invoice.pdf`

**Pass criteria:**
- Script auto-detects MIME type from `.pdf` extension → sends as document
- Returns `{ "ok": true }` on success
- Agent does NOT send if 24h window is closed (attachment follows same rule as text)

**Unsupported file type test:**
> "Send ./data.csv to 14155550123"

Agent should return `{ "ok": false }` with an error about unsupported file type — `.csv` is not in the allowed list. Agent should explain this limitation.

---

### C08 — assign-label.js

**Prompt:**
> "Assign the 'Support' label to the conversation with 14155550123."

**Expected script:** `chat-notifyer/scripts/assign-label.js --phone 14155550123 --label "Support" --pretty`

**Pass criteria:**
- Returns updated recipient with the label assigned
- Agent confirms the label was added

---

### C09 — remove-label.js

**Prompt:**
> "Remove the 'Support' label from contact 14155550123."

**Expected script:** `chat-notifyer/scripts/remove-label.js --phone 14155550123 --label "Support" --pretty`

**Pass criteria:**
- Returns updated recipient without the label
- Agent does NOT confuse this with `delete-label.js` (which deletes the label itself from the workspace)

---

### C10 — set-handoff.js

**Prompt:**
> "Take over the conversation with 14155550123 from the AI bot — switch to human mode."

**Expected script:** `chat-notifyer/scripts/set-handoff.js --phone 14155550123 --mode human --pretty`

**Pass criteria:**
- Returns `{ "ok": true }` with updated handoff status
- Agent confirms mode is now `human`

**Return to bot test:**
> "Hand the conversation with 14155550123 back to the AI bot."

**Expected:** `set-handoff.js --phone 14155550123 --mode bot`

---

### C11 — assign-bot.js

**Prompt:**
> "Assign bot ID 5 to handle the conversation with 14155550123."

**Expected behavior:**
1. Agent may call `list-bots.js` first if bot ID is not known
2. Calls `assign-bot.js --phone 14155550123 --bot-id 5`

**Pass criteria:**
- Returns `{ "ok": true }` with updated assignment
- Agent distinguishes this from `set-handoff.js` (this picks which bot, not bot vs human)

---

### C12 — list-bots.js (chat)

**Prompt:**
> "I need to assign a bot to a contact but I don't know the bot IDs. List the available bots."

**Expected script:** `chat-notifyer/scripts/list-bots.js --pretty`

**Pass criteria:**
- Returns list of bots with `id` and `name`
- Agent uses this to discover IDs for `assign-bot.js`
- Note: this is a thin wrapper — the agent should recognise both `chat-notifyer/scripts/list-bots.js` and `automate-notifyer/scripts/list-bots.js` serve the same purpose

---

### C13 — list-scheduled.js

**Prompt:**
> "Show me all messages currently scheduled to be sent."

**Expected script:** `chat-notifyer/scripts/list-scheduled.js --pretty`

**Pass criteria:**
- Returns list of scheduled messages with `id`, `phone_number`, `scheduled_at`, and message content
- Agent uses this to find IDs for `delete-scheduled.js`

---

### C14 — delete-scheduled.js

**Prompt:**
> "Cancel the scheduled message with ID 7. I confirm I want to delete it."

**Expected script:** `chat-notifyer/scripts/delete-scheduled.js --id 7 --confirm`

**Pass criteria:**
- Includes `--confirm` flag
- Returns deletion confirmation
- Agent first calls `list-scheduled.js` if the ID is not already known

---

### C15 — add-note.js

**Prompt:**
> "Set a note on contact 14155550123: 'VIP customer — always apply 15% discount.'"

**Expected script:** `chat-notifyer/scripts/add-note.js --phone 14155550123 --note "VIP customer — always apply 15% discount."`

**Pass criteria:**
- Returns `{ "ok": true }` confirmation
- Agent uses `--note` (full replace), not `--append`

**Append test:**
> "Add to the note on 14155550123: 'Follow up on refund by 20th March.'"

**Expected:** `add-note.js --phone 14155550123 --append "Follow up on refund by 20th March."`

**Clear test:**
> "Clear the note on contact 14155550123."

**Expected:** `add-note.js --phone 14155550123 --note ""`

---

### C16 — get-notes.js

**Prompt:**
> "Read the notes on contact 14155550123 — both the manual note and the AI-generated summary."

**Expected script:** `chat-notifyer/scripts/get-notes.js --phone 14155550123 --pretty`

**Pass criteria:**
- Returns `{ "note": "...", "note_auto": "..." }`
- Agent presents both `note` (manual) and `note_auto` (AI-generated) clearly
- Agent notes that `note_auto` is read-only — it cannot be set or cleared via script

---

### C17 — get-conversation.js

**Prompt:**
> "Show me the full message thread with 14155550123 — both the messages we sent and the replies they sent us."

**Expected script:** `chat-notifyer/scripts/get-conversation.js --phone 14155550123 --pretty`

**Pass criteria:**
- Returns bidirectional thread (both inbound and outbound messages)
- Agent uses `get-conversation.js`, NOT `get-conversation-log.js` (outbound only)
- Agent clearly labels which messages are inbound vs outbound

---

### C18 — get-conversation-log.js

**Prompt:**
> "Show me the delivery status of all messages we've sent to 14155550123."

**Expected script:** `chat-notifyer/scripts/get-conversation-log.js --phone 14155550123 --pretty`

**Pass criteria:**
- Returns outbound-only log with delivery statuses (`sent`, `delivered`, `read`, `failed`)
- Agent uses `get-conversation-log.js`, not `get-conversation.js`
- Agent clarifies this only shows outbound messages — for the full thread, use `get-conversation.js`

---

## Integration Workflow Tests

These test multi-step agent behaviour across multiple scripts.

---

### W01 — Full Workspace Onboarding

**Prompt:**
> "Set up a fresh Notifyer workspace for Acme Corp. Create the account with email acme@company.com, password AcmeCorp@2025. Then create three labels: Sales (keywords: buy, quote, pricing), Support (keywords: help, issue, broken), and VIP. Finally invite two team members: alice@acme.com as Admin, and bob@acme.com as Team Member with access to Sales and Support."

**Expected sequence:**
1. `create-account.js` — creates account, captures token
2. `doctor.js` — validates setup
3. `create-label.js` × 3 — Sales, Support, VIP
4. `invite-member.js` — Alice as Admin
5. `invite-member.js` — Bob as Team Member with labels

**Pass criteria:**
- All 5 steps succeed in order
- Agent exports/notes the `authToken` from step 1
- Agent confirms each creation step before proceeding

---

### W02 — Broadcast Campaign End-to-End

**Prompt:**
> "Run a broadcast campaign: check that the 'monthly_newsletter' template is approved, verify we're within our contact limits, then schedule the broadcast to recipients.csv for next Monday at 10 AM. Afterwards confirm it's in the upcoming queue."

**Expected sequence:**
1. `list-templates.js` — verify `monthly_newsletter` is `APPROVED`
2. `get-user-plan.js` — check `usages < unique_number_limit`
3. `create-broadcast.js` — schedule the broadcast
4. `list-broadcasts.js --require upcoming` — confirm it appears

**Pass criteria:**
- Agent gates on template status and plan limits before scheduling
- Agent does NOT proceed if template is `PENDING` — explains it must reach `APPROVED` first

---

### W03 — Chat Triage and Response

**Prompt:**
> "Check for any unread VIP conversations. For each one, read the full thread and any notes, take over from the AI, send them a message saying 'Hi, I'm personally looking into your request', and tag the conversation as 'Escalated'."

**Expected sequence (per contact):**
1. `filter-recipients-by-label.js --labels "VIP" --status unread`
2. For each: `get-conversation.js` + `get-notes.js`
3. `get-recipient.js` — check 24h window
4. `set-handoff.js --mode human`
5. `send-text.js` (if window open) or `send-template.js` (if closed)
6. `assign-label.js --label "Escalated"`

**Pass criteria:**
- Agent gates on 24h window before choosing send method
- Agent reads full context before acting
- Agent uses `get-conversation.js` (bidirectional), not just `get-conversation-log.js`

---

### W04 — Pre-flight Before Any Send

**Prompt:**
> "Before sending anything, make sure everything is healthy."

**Expected sequence:**
1. `doctor.js --pretty`

**Pass criteria:**
- Agent runs `doctor.js` as a single command, not 3 separate scripts
- Agent reports all four check results and stops if any fail with a fix hint

---

### W05 — Webhook Setup and Verification

**Prompt:**
> "Set up a dev webhook to receive all incoming and outgoing messages at https://hooks.myapp.com/whatsapp. Enable HMAC signatures. Then confirm it appears in the webhook list."

**Expected sequence:**
1. `create-webhook.js --type dev --url https://hooks.myapp.com/whatsapp --incoming --outgoing --signature`
2. `list-webhooks.js --type dev`

**Pass criteria:**
- HMAC secret is surfaced and agent stresses it must be saved immediately
- Webhook appears in the list after creation
- Agent does NOT re-run creation if webhook already exists (check list first)

---

### W06 — Bot Lifecycle

**Prompt:**
> "Create a new bot called 'Sales Bot' with a Persuasive tone, mission: 'Convert enquiries into sales', using gpt-4o-mini. Then make it the default, assign it to contact 14155550123, and verify it's set up correctly."

**Expected sequence:**
1. `create-bot.js --name "Sales Bot" --tone "Persuasive" --mission "Convert enquiries into sales" --model gpt-4o-mini`
2. `set-default-bot.js --id <new-id>`
3. `assign-bot.js --phone 14155550123 --bot-id <new-id>`
4. `get-bot.js --id <new-id>` — verify

**Pass criteria:**
- Agent captures the new bot ID from step 1 and carries it through steps 2–4
- Agent does not hardcode a bot ID

---

## Error & Edge Case Tests

### E01 — Expired token

**Prompt:**
> "Run a health check" (with an expired/invalid `NOTIFYER_API_TOKEN`)

**Expected behavior:**
- `doctor.js` returns `{ "ok": false }` with `token.pass: false`
- Error message says "Token expired or invalid — re-run login.js" (not just "Unauthorized")
- Agent surfaces the fix hint from the `doctor.js` output

---

### E02 — 24h window closed

**Prompt:**
> "Send 'Hello!' to 14155550123" (contact's last message was >24 hours ago)

**Expected behavior:**
1. `get-recipient.js` shows `last_message_at` is older than 24 hours
2. Agent does NOT call `send-text.js`
3. Agent explains the window is closed and offers to send a template instead

---

### E03 — Template not yet approved

**Prompt:**
> "Send the 'new_product_launch' template to 14155550123" (template is PENDING)

**Expected behavior:**
1. Agent calls `list-templates.js` or `get-template.js` to check status
2. Finds `status: "PENDING"`
3. Agent does NOT call `send-template.js`
4. Agent explains the template must reach `APPROVED` status first and that approval takes 24–72 hours

---

### E04 — Unsupported file type for attachment

**Prompt:**
> "Send ./export.xlsx to 14155550123"

**Expected behavior:**
- `send-attachment.js` returns `{ "ok": false }` — `.xlsx` is not in the allowed MIME type list
- Agent explains only image, video, audio, and document types are supported
- Agent does NOT attempt a fallback or retry with `application/octet-stream`

---

### E05 — Destroy guard: delete without confirm

**Prompt:**
> "Delete label ID 5" (no confirmation language)

**Expected behavior:**
- Agent should either:
  (a) Ask the user to confirm before running with `--confirm`, or
  (b) Run but explain it requires `--confirm` and ask for explicit approval
- Agent does NOT silently add `--confirm` without the user acknowledging it

Applies equally to: `remove-member.js`, `delete-bot.js`, `delete-broadcast.js`, `delete-template.js`, `delete-webhook.js`, `delete-scheduled.js`

---

### E06 — Degraded connection

**Prompt:**
> "Check the WhatsApp connection status" (where the account has a Meta PIN mismatch error hidden in the payload)

**Expected behavior:**
- `get-connection-status.js` returns `{ "isConnected": true, "degraded": true, "meta_errors": ["registration: two-step PIN mismatch"] }`
- Agent does NOT just report "Connected ✓"
- Agent flags the degraded state with the specific Meta error
- Agent suggests checking the Notifyer console for remediation

---

### E07 — Wrong skill for the job

**Prompt:**
> "Delete the 'Support' label from my workspace labels."

**Expected behavior:**
- Agent calls `delete-label.js` (from `setup-notifyer`), NOT `remove-label.js` (from `chat-notifyer`)
- `delete-label.js` removes the label from the workspace entirely
- `remove-label.js` only removes a label from a specific contact's conversation

---

### E08 — Plan limit check

**Prompt:**
> "Can I still send to new contacts?" (with `usages >= unique_number_limit`)

**Expected behavior:**
- Agent calls `get-user-plan.js`
- Finds `usages >= unique_number_limit`
- Agent explicitly states messaging limit is reached
- Agent does NOT attempt to send a message
- Agent suggests upgrading the plan via the console UI

---

### E09 — Correct auth mode for labels

**Prompt:**
> "List all workspace labels."

**Expected behavior:**
- Agent calls `list-labels.js` from `setup-notifyer`
- Script sends `Authorization: <token>` (raw, no Bearer) because labels use chat auth mode
- This is handled automatically — the test verifies the agent doesn't get a 401 on this endpoint

---

### E10 — IO webhook vs dev webhook confusion

**Prompt:**
> "List all webhooks I have configured for n8n."

**Expected behavior:**
- Agent calls `list-webhooks.js --type io` (IO webhooks = Make/Zapier/n8n integrations)
- NOT `list-webhooks.js --type dev` (dev webhooks = custom app integrations)
- Agent explains the difference if needed

---

## Quick Smoke Test Script

Run this to validate all read-only endpoints in one pass (no writes, no side effects):

```bash
#!/bin/bash
set -e

BASE="skills"
OK=0; FAIL=0

run() {
  local label="$1"; shift
  echo -n "  $label ... "
  if node "$@" > /dev/null 2>&1; then
    echo "PASS"; ((OK++))
  else
    echo "FAIL"; ((FAIL++))
  fi
}

echo ""
echo "=== setup-notifyer ==="
cd "$BASE/setup-notifyer"
run "doctor"                 scripts/doctor.js
run "get-me"                 scripts/get-me.js
run "get-connection-status"  scripts/get-connection-status.js
run "get-user-plan"          scripts/get-user-plan.js
run "list-plans"             scripts/list-plans.js
run "list-members"           scripts/list-members.js
run "list-labels"            scripts/list-labels.js
run "get-api-key"            scripts/get-api-key.js
cd ../..

echo ""
echo "=== automate-notifyer ==="
cd "$BASE/automate-notifyer"
run "list-templates"         scripts/list-templates.js
run "list-bots"              scripts/list-bots.js
run "list-broadcasts"        scripts/list-broadcasts.js
run "get-message-analytics"  scripts/get-message-analytics.js --from "01/01/2026" --to "31/01/2026"
run "get-message-logs"       scripts/get-message-logs.js
run "list-webhooks-dev"      scripts/list-webhooks.js --type dev
run "list-webhooks-io"       scripts/list-webhooks.js --type io
cd ../..

echo ""
echo "=== chat-notifyer ==="
cd "$BASE/chat-notifyer"
run "list-recipients"        scripts/list-recipients.js
run "list-bots"              scripts/list-bots.js
run "list-scheduled"         scripts/list-scheduled.js
cd ../..

echo ""
echo "Results: $OK passed, $FAIL failed"
[ $FAIL -eq 0 ] && echo "All smoke tests passed ✓" || echo "Some tests failed ✗"
```

Save as `smoke-test.sh`, make it executable (`chmod +x smoke-test.sh`), and run from the repo root after setting your env vars.

---

*57 scripts · 18 unit tests (S01–S17 + doctor) · 20 unit tests (A01–A20) · 18 unit tests (C01–C18) · 6 integration workflows (W01–W06) · 10 error cases (E01–E10)*
