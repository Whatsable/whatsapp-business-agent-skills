<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# AI bots

Read and change the AI bots, create or copy one, and choose which answers on each number.

| Tool | What it does | Scope | Read only | Send and read | Full access |
|---|---|---|---|---|---|
| `list_ai_bots` | List AI Bots | ai:read | yes | yes | yes |
| `get_ai_bot` | Get AI Bot | ai:read | yes | yes | yes |
| `list_knowledge_files` | List AI Bot Knowledge Files | ai:read | yes | yes | yes |
| `list_ai_bot_files` | List AI Bot Sendable Files | ai:read | yes | yes | yes |
| `create_ai_bot` | Create AI Bot | ai:configure |  |  | yes |
| `update_ai_bot` | Update AI Bot | ai:configure |  |  | yes |
| `duplicate_ai_bot` | Duplicate AI Bot | ai:configure |  |  | yes |
| `delete_ai_bot` | Delete AI Bot | ai:configure |  |  | yes |
| `assign_ai_bot_to_number` | Assign AI Bot to Number | ai:write |  | yes | yes |
| `read_ai_bot_text` | Read AI Bot Text | ai:read | yes | yes | yes |

## `list_ai_bots`

The AI bots, newest first: name, status (a `draft` answers no one) and the numbers each answers by default.

Reads only. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `limit` | integer |  |  |
| `cursor` | string |  |  |

## `get_ai_bot`

Read one AI bot's configuration; a long text shows its start and points to read_ai_bot_text. Its `updated_at` is the `version` update_ai_bot needs.

Reads only. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

## `list_knowledge_files`

Documents an AI bot knows, each `processing`, `ready` or `failed`. The bot reads them; customers never get them.

Reads only. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The bot id. |
| `limit` | integer |  |  |
| `cursor` | string |  |  |

## `list_ai_bot_files`

The files an AI bot may send to customers, each with the description it picks it by and whether it is `active`.

Reads only. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The bot id. |
| `limit` | integer |  |  |
| `cursor` | string |  |  |

## `create_ai_bot`

Creates an AI bot. It is a `draft` that answers no one unless `status` says otherwise. It answers on a number after assign_ai_bot_to_number.

Acts once per call. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Unique in the organization, ignoring case and accents. |
| `mission` | string | yes | What the bot is for. |
| `tone` | string | yes | How the bot speaks. |
| `instructions` | string | yes | The organization's instructions to the bot. |
| `knowledge` | value |  | Plain-text facts it may state. |
| `status` | "draft" or "active" or "archived" |  | `draft` answers no one. Only an `archived` bot can be deleted. |
| `time_zone` | string |  | IANA name; quiet hours use it. |
| `debounce_seconds` | integer |  | Wait for more messages before answering. |
| `reply_message_mode` | "single" or "multiple" |  | `single`: one message per reply. `multiple`: as many as the bot chooses. |
| `handoff_keywords` | array of string |  | Words that hand a chat to a person. |
| `handoff_instructions` | value |  | When the bot hands the chat to a person. Not sent to the customer. |
| `notify_on_handoff` | boolean |  | Stored only: no notification is sent yet. |
| `flag_unverified_figures` | boolean |  | When false, a missing price, amount or date is not flagged. The message is still sent. |
| `resume_policy` | "never" or "new_session" or "timer" |  | After a takeover: `never`, `new_session` (the customer writes after the window closed) or `timer`. |
| `resume_after_seconds` | value |  | Required with `resume_policy: "timer"`. |
| `label_permissions` | object |  | Labels the bot may add or remove. |
| `proactive` | object |  | Follow-ups when a customer goes quiet. |

## `update_ai_bot`

Omitted fields stay, also inside `label_permissions` and `proactive`. A text or list sent replaces the stored one whole: read a long text in full with read_ai_bot_text before rewriting it. `knowledge_append` and `instructions_append` add to the end without reading it, after a blank line, and not with the field itself. Pass get_ai_bot's `updated_at` as `version`. An `active` bot's change reaches customers on its next reply. A version conflict if the bot changed since.

Changes or deletes data: it cannot be undone. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `version` | string | yes | The bot's `updated_at`, exactly as get_ai_bot returned it. |
| `name` | string |  | Unique in the organization, ignoring case and accents. |
| `mission` | string |  | What the bot is for. |
| `tone` | string |  | How the bot speaks. |
| `instructions` | string |  | The organization's instructions to the bot. |
| `knowledge` | value |  | Plain-text facts it may state. |
| `status` | "draft" or "active" or "archived" |  | `draft` answers no one. Only an `archived` bot can be deleted. |
| `time_zone` | string |  | IANA name; quiet hours use it. |
| `debounce_seconds` | integer |  | Wait for more messages before answering. |
| `reply_message_mode` | "single" or "multiple" |  | `single`: one message per reply. `multiple`: as many as the bot chooses. |
| `handoff_keywords` | array of string |  | Words that hand a chat to a person. |
| `handoff_instructions` | value |  | When the bot hands the chat to a person. Not sent to the customer. |
| `notify_on_handoff` | boolean |  | Stored only: no notification is sent yet. |
| `flag_unverified_figures` | boolean |  | When false, a missing price, amount or date is not flagged. The message is still sent. |
| `resume_policy` | "never" or "new_session" or "timer" |  | After a takeover: `never`, `new_session` (the customer writes after the window closed) or `timer`. |
| `resume_after_seconds` | value |  | Required with `resume_policy: "timer"`. |
| `label_permissions` | object |  | Labels the bot may add or remove. |
| `proactive` | object |  | Follow-ups when a customer goes quiet. |
| `knowledge_append` | string |  |  |
| `instructions_append` | string |  |  |

## `duplicate_ai_bot`

Copies an AI bot, its configuration and its files into a new `draft` on no number.

Acts once per call. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The bot to copy. |

## `delete_ai_bot`

Delete an AI bot and take it off every number and conversation. Only an `archived` bot can be deleted (update_ai_bot with `status: "archived"`). It cannot be undone.

Changes or deletes data: it cannot be undone. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

## `assign_ai_bot_to_number`

Sets the AI bot for a number's conversations. `bot_id: null` leaves no default bot. A conversation with a bot of its own keeps it; an `archived` bot cannot be assigned. For one conversation: set_conversation_ai.

Changes or deletes data: it cannot be undone. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The number id. |
| `bot_id` | value | yes |  |

## `read_ai_bot_text`

Read a long text of an AI bot in full, page by page: send each page's `next_offset` as `offset` and the first page's `updated_at` as `version`, which update_ai_bot also takes.

Reads only. It needs AI agents in the plan: Growth, Pro, Agency and the 14-day trial.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `field` | "mission" or "instructions" or "knowledge" or "handoff_instructions" or "label_instructions" or "proactive_instructions" | yes |  |
| `offset` | integer |  |  |
| `limit` | integer |  | Characters. |
| `version` | string |  | The first page's `updated_at`; a later page is refused if the bot changed. |

Docs: https://docs.whatsable.app/mcp#ai-bots
