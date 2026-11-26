<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Messages

Read the messages on this connection's numbers, send texts, templates and media, upload a small file to send, check whether each one was delivered or read, react to a message with an emoji or take the reaction back, and use the team's saved replies.

| Tool | What it does | Scope | Read only | Send and read | Full access |
|---|---|---|---|---|---|
| `list_messages` | List Messages | messages:read | yes | yes | yes |
| `get_message` | Get Message Status | messages:read | yes | yes | yes |
| `send_text_message` | Send Text Message | messages:send |  | yes | yes |
| `send_template_message` | Send Template Message | messages:send |  | yes | yes |
| `send_media_message` | Send Media Message | messages:send |  | yes | yes |
| `list_saved_replies` | List Saved Replies | messages:read | yes | yes | yes |
| `upload_media` | Upload Media | messages:send |  | yes | yes |
| `react_to_message` | React to Message | messages:send |  | yes | yes |

## `list_messages`

Messages on this connection's numbers, newest first. `query` searches one conversation's or contact's messages. A media `url` lasts 15 minutes.

Reads only.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `limit` | integer |  |  |
| `cursor` | string |  |  |
| `conversation_id` | string |  |  |
| `contact_id` | string |  |  |
| `number_id` | string |  |  |
| `direction` | "inbound" or "outbound" |  |  |
| `status` | "pending" or "sent" or "delivered" or "read" or "failed" |  |  |
| `created_after` | string |  |  |
| `created_before` | string |  | Exclusive. |
| `query` | string |  | Ignores case. Needs `conversation_id` or `contact_id`. |

## `get_message`

One message and its `status`: `sent`, `delivered`, `read`, or `failed` with an `error`.

Reads only.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

## `send_text_message`

Send a text, optionally with up to three reply buttons. Address it by `to` (E.164 phone, user id or @username) or `conversation_id`, not both.

Acts once per call.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `to` | string |  | A new phone or user id creates a contact. |
| `conversation_id` | string |  | Replies from its number. |
| `from` | string |  | The number to send from, by id or E.164 phone. Absent, the key's default number sends. Never another fallback. |
| `pause_ai` | boolean |  | Default true: pauses the AI agent in this chat. False leaves it on. |
| `reply_to_message_id` | string |  | Quote this message (an id from list_messages). |
| `body` | string | yes | Up to 4,096 characters, 1,024 with `buttons`. |
| `preview_url` | boolean |  | Show a preview of the first link. Off by default. |
| `buttons` | array of object |  | Up to three reply buttons, ids and titles unique. |

## `send_template_message`

Send an approved template: the only message outside the 24-hour window, or to someone who never wrote. Address it by `to` (E.164 phone, user id or @username) or `conversation_id`, not both.

Acts once per call.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `to` | string |  | A new phone or user id creates a contact. |
| `conversation_id` | string |  | Replies from its number. |
| `from` | string |  | The number to send from, by id or E.164 phone. Absent, the key's default number sends. Never another fallback. |
| `template` | object | yes |  |
| `pause_ai` | boolean |  | Default true: pauses the AI agent in this chat. False leaves it on. |

## `send_media_message`

Send an image, video, audio, document or sticker by public HTTPS link or upload. Address it by `to` (E.164 phone, user id or @username) or `conversation_id`, not both.

Acts once per call.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `to` | string |  | A new phone or user id creates a contact. |
| `conversation_id` | string |  | Replies from its number. |
| `from` | string |  | The number to send from, by id or E.164 phone. Absent, the key's default number sends. Never another fallback. |
| `pause_ai` | boolean |  | Default true: pauses the AI agent in this chat. False leaves it on. |
| `reply_to_message_id` | string |  | Quote this message (an id from list_messages). |
| `kind` | "image" or "video" or "audio" or "document" or "sticker" | yes | A `sticker` is a WebP image. |
| `url` | string |  | A public HTTPS link, no sign-in. |
| `media_id` | string |  | An id from upload_media. |
| `caption` | string |  | Under an image, video or document; not audio or a sticker. |
| `filename` | string |  | Documents only. |

## `list_saved_replies`

List the team's saved replies; send one's body with send_text_message.

Reads only.

No parameters.

## `upload_media`

Upload a file (≤1 MB, base64) to send by media_id with send_media_message; larger files: a public link.

Acts once per call.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `filename` | string | yes |  |
| `mime_type` | string | yes |  |
| `content_base64` | string | yes |  |

## `react_to_message`

Set one emoji, or "" to remove it; replaces your last reaction. Open 24-hour window only.

Changes or deletes data: it cannot be undone.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `message_id` | string | yes | The message id. |
| `emoji` | string | yes |  |

Docs: https://docs.whatsable.app/mcp#messages
