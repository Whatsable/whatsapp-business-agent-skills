<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Plans and features

What each plan includes, from the plan rules the app and the API enforce. Prices are not listed here: they change, and the plans page has them. Read the account's own plan with `get_account` or `get_setup_status`; a tool call outside the plan answers `feature_not_in_plan`.

| Feature | What it does | Bulk Message | Work | Growth | Pro | Agency | 14-day trial | Free plan |
|---|---|---|---|---|---|---|---|---|
| the inbox | Read and answer every WhatsApp chat in one place, with your team. |  | yes | yes | yes | yes | yes |  |
| templates | Create WhatsApp message templates and send them to Meta for approval. | yes | yes | yes | yes | yes | yes | yes |
| broadcasts | Send one template to many contacts at once, now or at a set time. | yes | yes | yes | yes | yes | yes |  |
| Pipedrive | See and answer WhatsApp chats inside Pipedrive, next to your deals and people. |  |  |  | yes | yes | yes |  |
| Monday.com | See and answer WhatsApp chats inside your monday.com boards. |  |  |  | yes | yes | yes |  |
| AI agents | Let an AI agent answer your customers on WhatsApp, day and night. |  |  | yes | yes | yes | yes |  |
| integrations | Connect WhatsApp to your other tools with API keys, webhooks, n8n, Make and Zapier. |  |  |  | yes | yes | yes |  |
| analytics | See how many chats you get, how fast your team answers, and what your messages achieve. |  | yes | yes | yes | yes | yes | yes |
| team members | Invite teammates to answer chats with you, each with their own access. |  | yes | yes | yes | yes | yes |  |
| audio transcription | Read voice messages as text, written out for you automatically. |  |  |  | yes | yes | yes |  |
| the MCP server | Let Claude, ChatGPT or another AI app read and answer your WhatsApp messages. |  | yes | yes | yes | yes | yes | yes |
| scheduled messages | Schedule a message for later, and send it only if the customer has not replied. |  | yes | yes | yes | yes | yes | yes |

The Free plan, after the trial: 1 number, 100 people a month, and 30 days of history in the reads and analytics.

## What each tool needs in the plan

Every tool needs the MCP server. Besides it:

- **templates**: `list_templates`, `get_template`, `create_template`, `delete_template`
- **broadcasts**: `list_broadcasts`, `get_broadcast`, `list_broadcast_recipients`, `create_broadcast`, `cancel_broadcast`, `set_broadcast_status`
- **AI agents**: `set_conversation_ai`, `list_ai_bots`, `get_ai_bot`, `list_knowledge_files`, `list_ai_bot_files`, `create_ai_bot`, `update_ai_bot`, `duplicate_ai_bot`, `delete_ai_bot`, `assign_ai_bot_to_number`, `set_contact_follow_ups`, `cancel_ai_retry`, `read_ai_bot_text`
- **analytics**: `get_message_analytics`, `get_template_analytics`, `get_conversation_analytics`, `get_ai_analytics`, `get_broadcast_analytics`
- **scheduled messages**: `schedule_message`, `list_scheduled_messages`, `get_scheduled_message`, `cancel_scheduled_message`

Plans: https://docs.whatsable.app/features/plans-bulk-message-pro-agency

The MCP server and the free plans: https://docs.whatsable.app/mcp/plans
