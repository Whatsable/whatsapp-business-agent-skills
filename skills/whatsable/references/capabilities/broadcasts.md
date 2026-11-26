<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Broadcasts

Send an approved template to many phones, now or later; follow each send.

| Tool | What it does | Scope | Read only | Send and read | Full access |
|---|---|---|---|---|---|
| `list_broadcasts` | List Broadcasts | broadcasts:read | yes | yes | yes |
| `get_broadcast` | Get Broadcast | broadcasts:read | yes | yes | yes |
| `list_broadcast_recipients` | List Broadcast Recipients | broadcasts:read | yes | yes | yes |
| `create_broadcast` | Launch Broadcast | broadcasts:write |  |  | yes |
| `cancel_broadcast` | Cancel Broadcast | broadcasts:write |  |  | yes |
| `set_broadcast_status` | Pause or Resume Broadcast | broadcasts:write |  |  | yes |

## `list_broadcasts`

Broadcasts on this connection's numbers, newest first, with status and counts. Filter by `number_id` or `status`.

Reads only. It needs broadcasts in the plan: Bulk Message, Work, Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `limit` | integer |  |  |
| `cursor` | string |  |  |
| `number_id` | string |  |  |
| `status` | "scheduled" or "running" or "paused" or "completed" or "cancelled" |  |  |

## `get_broadcast`

One broadcast's progress: status, recipients, and how many were sent, read, failed or pending. list_broadcast_recipients shows each send.

Reads only. It needs broadcasts in the plan: Bulk Message, Work, Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

## `list_broadcast_recipients`

A broadcast's recipients, and how each send ended: `pending`, `sent`, `failed` or `skipped`.

Reads only. It needs broadcasts in the plan: Bulk Message, Work, Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The broadcast id. |
| `limit` | integer |  |  |
| `cursor` | string |  |  |

## `create_broadcast`

Send an approved template to E.164 phones from one number, launched now, or at `scheduled_at`. find_contacts (`label_id`) gives a label's phones; a contact known only by a WhatsApp user id cannot be a recipient. get_broadcast and list_broadcast_recipients follow it.

Acts once per call. It needs broadcasts in the plan: Bulk Message, Work, Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `name` | string |  |  |
| `from` | string |  | The number to send from, by id or E.164 phone. Absent, the key's default number sends. It must be `active`. |
| `template` | object | yes | Approved, of the sending number's account: by `id`, or `name` and `language`. Not authentication, nor with a coupon-code button. |
| `variables` | object |  | Per recipient, keyed by `variables[].key`: a string, or `{ "url": "https://..." }` for a media header. |
| `recipients` | array of object | yes | 1 to 10,000, at most 2 MB. A repeated phone gets one message, with its first values. |
| `scheduled_at` | string |  | RFC 3339 with offset. Absent or under 60 s past: now; older is refused. |
| `time_zone` | string |  | For display only: `scheduled_at` is never read in it. |
| `labels` | array of string |  | By id or exact name, added to each recipient once sent; each must be on the sending number. |
| `mode` | "regular" or "smart" |  | `regular`: `batch_size` per minute. `smart`: `batch_size` while the read rate holds `target_read_rate`. |
| `batch_size` | integer |  | `regular`: messages a minute, 1 to 60, default 3. `smart`: the batch, 1 to 20, default 5. Not for `risk`. |
| `target_read_rate` | number |  | `smart` only: the share of sent messages that must be read before the next batch, 0.1 to 1, default 0.3. |

## `cancel_broadcast`

Cancel a scheduled, running or paused broadcast: every recipient whose message has not gone out is never sent and reads as `skipped`. set_broadcast_status pauses one for now.

Changes or deletes data: it cannot be undone. It needs broadcasts in the plan: Bulk Message, Work, Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

## `set_broadcast_status`

Pause a running broadcast or resume a paused one. A paused broadcast keeps its place; cancel_broadcast ends it.

Changes or deletes data: it cannot be undone. It needs broadcasts in the plan: Bulk Message, Work, Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The broadcast id. |
| `status` | "paused" or "running" | yes |  |

Docs: https://docs.whatsable.app/mcp#broadcasts
