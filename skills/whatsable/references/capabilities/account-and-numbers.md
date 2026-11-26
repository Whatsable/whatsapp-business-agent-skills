<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Account and numbers

Who this connection is, where the account is in its setup and its plan, its numbers, the team (read only) and a link to connect a number.

| Tool | What it does | Scope | Read only | Send and read | Full access |
|---|---|---|---|---|---|
| `get_account` | Get Account and Plan | none | yes | yes | yes |
| `get_setup_status` | Get Setup Status | none | yes | yes | yes |
| `list_numbers` | List WhatsApp Numbers | numbers:read | yes | yes | yes |
| `list_members` | List Team Members | members:read | yes | yes | yes |
| `create_number_connect_link` | Create Number Connect Link | Full access only |  |  | yes |

## `get_account`

The organization, its plan (`plan_active`, name, features) and this connection's scopes, numbers and default number. `plan_active` explains a `plan_inactive` error.

Reads only.

No parameters.

## `get_setup_status`

Where the account is in its setup, the next step, and the plan: each limit with its use, and the features it includes now.

Reads only.

No parameters.

## `list_numbers`

The WhatsApp numbers this connection can use: id, display name, phone and status. Only an `active` number sends.

Reads only.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `limit` | integer |  |  |
| `cursor` | string |  |  |

## `list_members`

List the team: each member's name, email, role and numbers, and pending invitations. Read only: team changes are made signed in, under Settings > Team.

Reads only.

No parameters.

## `create_number_connect_link`

A no-login link that connects a WhatsApp number to this account. With `email`, it is also emailed, the user in CC.

Acts once per call.

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `email` | string |  | A teammate's address. |
| `name` | string |  | For the greeting. |

Docs: https://docs.whatsable.app/mcp#account-and-numbers
