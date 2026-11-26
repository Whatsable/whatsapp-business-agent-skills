<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Who is waiting for an answer

**Goal:** List the chats still waiting for an answer, and reply to them.

**People ask:** "Who is waiting for an answer?" · "Which customers have we not answered yet today?"

**Access needed:** Send and read. Read only can run steps 1 to 2.

**Tools:** `list_conversations`, `read_conversation`, `send_text_message`, `list_templates`, `get_template`, `send_template_message`

## Steps

1. List them with list_conversations and awaiting_reply true, newest first: each chat's last message came from the customer, and each shows its 24-hour window.
2. Summarize who waits, since when and what about, and read the chats the person picks with read_conversation.
3. While the window is open, send_text_message sends the reply in that conversation; this pauses the AI agent there by default, and the result says so: tell the person.
4. If the window has closed, only an approved template reaches them: pick one with list_templates, read its variables with get_template, and send it with send_template_message.

Docs: https://docs.whatsable.app/mcp/workflows#who-is-waiting
