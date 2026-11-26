<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Scheduled messages

Schedule a text or a template, see what is scheduled, and cancel what has not been sent.

| Tool | What it does | Scope | Read only | Send and read | Full access |
|---|---|---|---|---|---|
| `schedule_message` | Schedule Message | messages:send |  | yes | yes |
| `list_scheduled_messages` | List Scheduled Messages | messages:read | yes | yes | yes |
| `get_scheduled_message` | Get Scheduled Message | messages:read | yes | yes | yes |
| `cancel_scheduled_message` | Cancel Scheduled Message | messages:send |  | yes | yes |

## `schedule_message`

Schedule a text or template to send later, at `send_at`. Address it by `to` (E.164 phone, user id or @username) or `conversation_id`, not both. send_if makes it conditional: no_reply sends only if they have not answered; labels sends only if they carry (include) or lack (exclude) a label. A text reaches the person only if the 24-hour window is still open when it fires; a template is not limited by the window.

Acts once per call. It needs scheduled messages in the plan: Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `to` | string |  | A new phone or user id creates a contact. |
| `conversation_id` | string |  | Replies from its number. |
| `from` | string |  | The number to send from, by id or E.164 phone. Absent, the key's default number sends. Never another fallback. |
| `text` | object |  | A text message. Or send `template`. |
| `template` | object |  | Approved, by `id` or `name` and `language`, `variables` as get_template lists. Or `text`. |
| `send_at` | string | yes | Future RFC 3339 with offset, such as `2026-10-22T09:00:00-03:00`. |
| `time_zone` | string |  | For display only: `send_at` is never read in it. |
| `send_if` | object |  |  |

## `list_scheduled_messages`

Scheduled messages on this connection's numbers, newest first. Filter by `status`, `conversation_id` or `number_id`.

Reads only. It needs scheduled messages in the plan: Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `limit` | integer |  |  |
| `cursor` | string |  |  |
| `status` | "pending" or "sent" or "suppressed" or "failed" or "cancelled" or "missed" |  |  |
| `conversation_id` | string |  |  |
| `number_id` | string |  |  |

## `get_scheduled_message`

One scheduled message: `pending`, then `sent`, `suppressed`, `failed`, `cancelled` or `missed`.

Reads only. It needs scheduled messages in the plan: Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

## `cancel_scheduled_message`

Cancel a `pending` scheduled message so it never sends. One that already fired, or is firing, cannot be cancelled.

Changes or deletes data: it cannot be undone. It needs scheduled messages in the plan: Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

Docs: https://docs.whatsable.app/mcp#scheduled-messages
