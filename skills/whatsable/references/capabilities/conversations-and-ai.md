<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Conversations and AI

See each conversation and whether its 24-hour window is open, read what happened and why the AI acted, mark one read or unread, add or delete an internal note only the team sees, switch the AI off or on in one conversation or choose which AI agent answers it, cancel a reply the AI is about to retry, mark an AI message's unverified figures as checked, and stop or allow follow-ups to one contact.

| Tool | What it does | Scope | Read only | Send and read | Full access |
|---|---|---|---|---|---|
| `list_conversations` | List Conversations | messages:read | yes | yes | yes |
| `get_conversation` | Get Conversation | messages:read | yes | yes | yes |
| `read_conversation` | Read Conversation History | messages:read | yes | yes | yes |
| `set_conversation_unread` | Mark Conversation Read or Unread | messages:send |  | yes | yes |
| `add_conversation_note` | Add Conversation Note | messages:send |  | yes | yes |
| `delete_conversation_note` | Delete Conversation Note | messages:send |  | yes | yes |
| `set_conversation_ai` | Turn AI On or Off in Conversation | ai:write |  | yes | yes |
| `set_contact_follow_ups` | Turn AI Follow-ups On or Off for Contact | ai:write |  | yes | yes |
| `cancel_ai_retry` | Cancel AI Retry | ai:write |  | yes | yes |
| `mark_figures_checked` | Mark Figures Checked | messages:send |  | yes | yes |

## `list_conversations`

Conversations on this connection's numbers, latest message first. `query` matches contact name or last message. Filter by `unread`, `awaiting_reply`, `window_open`, `label_id` and more.

Reads only.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `limit` | integer |  |  |
| `cursor` | string |  |  |
| `number_id` | string |  |  |
| `contact_id` | string |  |  |
| `updated_after` | string |  |  |
| `query` | string |  | Contact name, @username or phone digits, or text in the last message. Partial; for a name, every word must match. |
| `label_id` | string |  |  |
| `unread` | value |  | `true`: unread messages, or marked unread. `false`: neither. |
| `window_open` | value |  | `true`: a session message can be sent now. |
| `awaiting_reply` | value |  | `true`: the customer wrote last. |
| `figures_to_check` | value |  | `true`: an AI message has a figure nobody checked. |

## `get_conversation`

One conversation: contact, last message preview, `awaiting_reply` (they wrote last), unread count, `window_open` (the 24-hour window), and `ai` (its bot; active, off, paused by a person or handed off).

Reads only.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

## `read_conversation`

What happened in a conversation and why (its own account, not a verified fact; needs ai:read). get_conversation is its current state, get_message a message's delivery.

Reads only.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `conversation_id` | string | yes | The conversation id. |
| `limit` | integer |  |  |
| `cursor` | string |  |  |
| `types` | string |  | Comma-separated: message, note, ai_decision, ai_status_changed, ai_bot_changed, label_added, label_removed. |

## `set_conversation_unread`

Mark a conversation unread (`unread: true`) or read (`false`).

Changes or deletes data: it cannot be undone.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The conversation id. |
| `unread` | boolean | yes | Reading through the API never marks it read. |

## `add_conversation_note`

Add an internal note to a conversation: only your team sees it in the inbox; the customer never does.

Acts once per call.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The conversation id. |
| `body` | string | yes | The note, 1 to 4000 characters. Only the team sees it. |

## `delete_conversation_note`

Delete an internal note; read_conversation gives its id. It cannot be undone.

Changes or deletes data: it cannot be undone.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The conversation id. |
| `note_id` | string | yes | The timeline's `note.id`, of this conversation. |

## `set_conversation_ai`

Turns the AI off or on in one conversation, or sets its bot (`bot_id`). `off` stops its replies and follow-ups there only. `active` resumes it after a person took over or the bot handed off.

Changes or deletes data: it cannot be undone. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The conversation id. |
| `status` | "active" or "off" |  | Left out, the status is kept. |
| `bot_id` | value |  | Which AI agent answers this chat; null = the number's default. |

## `set_contact_follow_ups`

Switches one contact's AI follow-ups off or on. `off` stops them on every number; the bot still answers when the person writes. `on` allows them. One chat uses set_conversation_ai.

Changes or deletes data: it cannot be undone. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The contact id. |
| `status` | "on" or "off" | yes |  |

## `cancel_ai_retry`

Stop a reply the AI agent is about to retry after an error.

Changes or deletes data: it cannot be undone. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The conversation id. |

## `mark_figures_checked`

Mark an AI message's unverified figures as checked, as the inbox does.

Changes or deletes data: it cannot be undone.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The message id. |

Docs: https://docs.whatsable.app/mcp#conversations-and-ai
