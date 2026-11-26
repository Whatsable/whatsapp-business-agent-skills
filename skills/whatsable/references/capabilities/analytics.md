<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Analytics

Count messages, template sends, conversations, AI bots' work and broadcasts over up to 90 days, as the Analytics page does.

| Tool | What it does | Scope | Read only | Send and read | Full access |
|---|---|---|---|---|---|
| `get_message_analytics` | Get Message Analytics | messages:read | yes | yes | yes |
| `get_template_analytics` | Get Template Analytics | templates:read | yes | yes | yes |
| `get_conversation_analytics` | Get Conversation Analytics | messages:read | yes | yes | yes |
| `get_ai_analytics` | Get AI Bot Analytics | ai:read | yes | yes | yes |
| `get_broadcast_analytics` | Get Broadcast Analytics | broadcasts:read | yes | yes | yes |

## `get_message_analytics`

Message counts for up to 90 days: sent, delivered, read, failed, received, by day or week, by sender, and the top failure codes. list_messages lists the messages.

Reads only. It needs analytics in the plan: Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `from` | string | yes |  |
| `to` | string | yes | Included. |
| `time_zone` | string | yes | IANA name. |
| `number_id` | string |  | Absent: every number. Required if this connection has only some. |

## `get_template_analytics`

Each template's sends over up to 90 days, with delivery and read counts, most sent first.

Reads only. It needs analytics in the plan: Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `from` | string | yes |  |
| `to` | string | yes | Included. |
| `time_zone` | string | yes | IANA name. |
| `number_id` | string |  | Absent: every number. Required if this connection has only some. |

## `get_conversation_analytics`

Conversations and new contacts over up to 90 days, and how fast a first answer arrived, and from whom.

Reads only. It needs analytics in the plan: Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `from` | string | yes |  |
| `to` | string | yes | Included. |
| `time_zone` | string | yes | IANA name. |
| `number_id` | string |  | Absent: every number. Required if this connection has only some. |

## `get_ai_analytics`

What the AI bots did over up to 90 days: turns, handoffs, reply times, held-back replies, labels and follow-ups.

Reads only. It needs analytics in the plan: Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `from` | string | yes |  |
| `to` | string | yes | Included. |
| `time_zone` | string | yes | IANA name. |
| `number_id` | string |  | Absent: every number. Required if this connection has only some. |

## `get_broadcast_analytics`

Broadcasts started in up to 90 days, newest first, at most 200, with their counts.

Reads only. It needs analytics in the plan: Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `from` | string | yes |  |
| `to` | string | yes | Included. |
| `time_zone` | string | yes | IANA name. |
| `number_id` | string |  | Absent: every number. Required if this connection has only some. |

Docs: https://docs.whatsable.app/mcp#analytics
