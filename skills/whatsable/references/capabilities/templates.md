<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Templates

Find the approved templates a send can use, read their variables, submit new ones to Meta, and delete old ones.

| Tool | What it does | Scope | Read only | Send and read | Full access |
|---|---|---|---|---|---|
| `list_templates` | List Templates | templates:read | yes | yes | yes |
| `get_template` | Get Template | templates:read | yes | yes | yes |
| `create_template` | Create and Submit Template | templates:write |  |  | yes |
| `delete_template` | Delete Template | templates:write |  |  | yes |

## `list_templates`

Templates of this connection's WhatsApp Business Accounts, newest first. Only an `approved` one sends. A `yellow` or `red` quality score warns that Meta may pause it.

Reads only. It needs templates in the plan: Bulk Message, Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `limit` | integer |  |  |
| `cursor` | string |  |  |
| `status` | string |  | `pending`, `approved`, `rejected`, `paused`, `disabled`, or a newer one of Meta's. |
| `number_id` | string |  |  |
| `name` | string |  |  |
| `language` | string |  | Such as `en_US`. |

## `get_template`

One template: body, buttons, review `status`, Meta's `quality_score`, `variables`, the keys a send fills, and Meta's template id.

Reads only. It needs templates in the plan: Bulk Message, Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

## `create_template`

Creates a template and submits it to Meta. The result is `pending`; get_template shows Meta's decision. Body variables are {{1}}, {{2}}, ... without gaps, each with one `body_examples` entry.

Acts once per call. It needs templates in the plan: Bulk Message, Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `number_id` | string |  | A number on the WhatsApp Business Account the template is created in. Absent, the key's default number decides. |
| `name` | string |  | Meta's identifier. Derived from `display_name` when absent. |
| `display_name` | string |  | The name people read. With `name`, it must derive to `name`. |
| `language` | string | yes | Meta's language code, such as `en_US`. |
| `category` | "marketing" or "utility" or "authentication" | yes |  |
| `header` | value |  | `none` (default), `text`, or media by one of `url` (public HTTPS) or `media_id` (an upload). |
| `body` | string |  | Numbered variables only, not named ones. Absent only for an authentication template. |
| `body_examples` | array of string |  | One per body variable, in order. Absent, placeholders are submitted. |
| `footer` | string |  |  |
| `buttons` | array of value |  |  |
| `authentication` | object |  | For the `authentication` category only. |

## `delete_template`

Delete a template at Meta and in Whatsable, for every number of its WhatsApp Business Account. It cannot be undone.

Changes or deletes data: it cannot be undone. It needs templates in the plan: Bulk Message, Work, Growth, Pro, Agency, the 14-day trial and the Free plan.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |

Docs: https://docs.whatsable.app/mcp#templates
