<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Access and scopes

A connection holds one access level, chosen when the person approves the AI app, or the scopes of the API key it sends. The server lists only the tools that access allows, so a missing tool means missing access, not a missing feature. To change the access, the person revokes the connection in API keys > Connected AI apps and connects again.

Every connection sees `get_account`, `get_setup_status` and `get_guide`.

| Scope | Tools | Read only | Send and read | Full access |
|---|---|---|---|---|
| `numbers:read` | `list_numbers` | yes | yes | yes |
| `templates:read` | `list_templates`, `get_template` and `get_template_analytics` | yes | yes | yes |
| `templates:write` | `create_template` and `delete_template` |  |  | yes |
| `messages:read` | `list_messages`, `get_message`, `list_conversations`, `get_conversation`, `list_scheduled_messages`, `get_scheduled_message`, `read_conversation`, `get_message_analytics`, `get_conversation_analytics` and `list_saved_replies` | yes | yes | yes |
| `messages:send` | `send_text_message`, `send_template_message`, `send_media_message`, `schedule_message`, `cancel_scheduled_message`, `set_conversation_unread`, `add_conversation_note`, `delete_conversation_note`, `mark_figures_checked`, `upload_media` and `react_to_message` |  | yes | yes |
| `contacts:read` | `find_contacts`, `get_contact` and `list_labels` | yes | yes | yes |
| `contacts:write` | `create_contact`, `update_contact`, `add_contact_label` and `remove_contact_label` |  | yes | yes |
| `labels:write` | `create_label`, `update_label` and `delete_label` |  |  | yes |
| `broadcasts:read` | `list_broadcasts`, `get_broadcast`, `list_broadcast_recipients` and `get_broadcast_analytics` | yes | yes | yes |
| `broadcasts:write` | `create_broadcast`, `cancel_broadcast` and `set_broadcast_status` |  |  | yes |
| `ai:read` | `list_ai_bots`, `get_ai_bot`, `list_knowledge_files`, `list_ai_bot_files`, `get_ai_analytics` and `read_ai_bot_text` | yes | yes | yes |
| `ai:write` | `set_conversation_ai`, `assign_ai_bot_to_number`, `set_contact_follow_ups` and `cancel_ai_retry` |  | yes | yes |
| `ai:configure` | `create_ai_bot`, `update_ai_bot`, `duplicate_ai_bot` and `delete_ai_bot` |  |  | yes |
| `webhooks:manage` | no tool yet |  |  | yes |
| `members:read` | `list_members` | yes | yes | yes |
| Full access only (`*`) | `create_number_connect_link` |  |  | yes |

## Read only

Sees 31 of 63 tools. Does not see: `send_text_message`, `send_template_message`, `send_media_message`, `create_template`, `create_contact`, `update_contact`, `add_contact_label`, `remove_contact_label`, `create_label`, `update_label`, `delete_label`, `set_conversation_ai`, `schedule_message`, `cancel_scheduled_message`, `create_broadcast`, `cancel_broadcast`, `create_ai_bot`, `update_ai_bot`, `duplicate_ai_bot`, `delete_ai_bot`, `assign_ai_bot_to_number`, `set_contact_follow_ups`, `delete_template`, `set_broadcast_status`, `set_conversation_unread`, `add_conversation_note`, `delete_conversation_note`, `cancel_ai_retry`, `mark_figures_checked`, `upload_media`, `create_number_connect_link`, `react_to_message`.

## Send and read

Sees 50 of 63 tools. Does not see: `create_template`, `create_label`, `update_label`, `delete_label`, `create_broadcast`, `cancel_broadcast`, `create_ai_bot`, `update_ai_bot`, `duplicate_ai_bot`, `delete_ai_bot`, `delete_template`, `set_broadcast_status`, `create_number_connect_link`.

## Full access

Sees 63 of 63 tools. Sees every tool.

Docs: https://docs.whatsable.app/mcp/manage-access
