<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Contacts and labels

Find, add and update contacts, and organize them with labels.

| Tool | What it does | Scope | Read only | Send and read | Full access |
|---|---|---|---|---|---|
| `find_contacts` | Find Contacts | contacts:read | yes | yes | yes |
| `get_contact` | Get Contact | contacts:read | yes | yes | yes |
| `list_labels` | List Labels | contacts:read | yes | yes | yes |
| `create_contact` | Find or Create Contact | contacts:write |  | yes | yes |
| `update_contact` | Update Contact | contacts:write |  | yes | yes |
| `add_contact_label` | Add Label to Contact | contacts:write |  | yes | yes |
| `remove_contact_label` | Remove Label from Contact | contacts:write |  | yes | yes |
| `create_label` | Create Label | labels:write |  |  | yes |
| `update_label` | Update Label | labels:write |  |  | yes |
| `delete_label` | Delete Label | labels:write |  |  | yes |

## `find_contacts`

Contacts, newest first. A name uses `query`: several matches come back together, with name and phone, and none still matches the first letters. A contact's `conversations` hold the ids to reply into.

Reads only.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `limit` | integer |  |  |
| `cursor` | string |  |  |
| `phone` | string |  | E.164; the `+`, spaces and dashes may be omitted. |
| `wa_user_id` | string |  | A Business-Scoped User ID. |
| `username` | string |  | With or without the leading `@`. |
| `label_id` | string |  |  |
| `updated_after` | string |  |  |
| `query` | string |  | Name: partial, ignoring case and accents. @username: partial, ignoring case. Phone: three or more digits. Every word must match. |

## `get_contact`

One contact: name, phone or WhatsApp user id, notes, labels, and its conversations on this connection's numbers.

Reads only.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

## `list_labels`

Labels, with ids, colors and keywords. An id filters find_contacts.

Reads only.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `limit` | integer |  |  |
| `cursor` | string |  |  |

## `create_contact`

Find a contact by `phone` or `wa_user_id` (exactly one), or create it; calling again returns the same contact. `name` is set only on creation; update_contact renames.

Acts once per call.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `phone` | string |  | E.164; the `+`, spaces and dashes may be omitted. |
| `wa_user_id` | string |  | A Business-Scoped User ID. |
| `name` | string |  | Set on a contact this call creates. An existing contact keeps its name. |

## `update_contact`

Changes `name`, `note` or `automation_note`; omitted fields stay, and null or empty clears a note. `note` replaces the contact's single note; add_conversation_note adds one to a chat.

Changes or deletes data: it cannot be undone.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string |  |  |
| `note` | value |  |  |
| `automation_note` | value |  |  |

## `add_contact_label`

Add a label to a contact, by id or exact name. An unknown label is not created (create_label first); a label it already has changes nothing.

Acts once per call.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The contact id. |
| `label` | string | yes | A name matches ignoring case and accents. |

## `remove_contact_label`

Remove a label from one contact. The label itself stays; delete_label removes it from everyone.

Changes or deletes data: it cannot be undone.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | The contact id. |
| `label_id` | string | yes | The label id. |

## `create_label`

Creates a label. Names are unique ignoring case and accents. `keywords` match inbound messages; `number_ids` limits which numbers.

Acts once per call.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes |  |
| `color` | "label-1" or "label-2" or "label-3" or "label-4" or "label-5" or "label-6" | yes |  |
| `description` | string |  |  |
| `keywords` | array of string |  |  |
| `number_ids` | array of string |  | Empty or absent: every number. |

## `update_label`

Change a label's name, color, description, keywords or numbers. Fields left out are kept; `keywords` and `number_ids` replace the whole list.

Changes or deletes data: it cannot be undone.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string |  |  |
| `color` | "label-1" or "label-2" or "label-3" or "label-4" or "label-5" or "label-6" |  |  |
| `description` | value |  |  |
| `keywords` | array of string |  |  |
| `number_ids` | array of string |  | Empty: every number. |

## `delete_label`

Delete a label and remove it from every contact that carries it. It cannot be undone.

Changes or deletes data: it cannot be undone.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

Docs: https://docs.whatsable.app/mcp#contacts-and-labels
