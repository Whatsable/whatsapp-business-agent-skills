<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Reply to a customer

**Goal:** Answer a conversation while its 24-hour window is open, or offer a template once it has closed.

**People ask:** "Who wrote to us today and hasn't had an answer?" · "Answer Carlos and tell him his order ships on Monday."

**Access needed:** Send and read. Read only can run steps 1 to 2.

**Tools:** `list_conversations`, `find_contacts`, `list_messages`, `send_text_message`, `list_saved_replies`, `list_templates`, `get_template`, `send_template_message`, `react_to_message`

## Steps

1. Find the person with find_contacts by name, or by phone: a contact lists its conversations. Several matches come back with name and phone; none still matches the first letters of the name. Without a name, list_conversations shows the latest chats with their 24-hour window.
2. Read what was said with list_messages for that conversation.
3. While the window is open, send_text_message sends a reply in that conversation; for a standard answer, use a body from list_saved_replies. Sending pauses the AI agent in that chat by default, and the result says so: tell the person.
4. If the window has closed, a text cannot reach them: say so, and offer an approved template instead. Pick one with list_templates, read its variables with get_template, and send it with send_template_message.
5. To acknowledge a message without words, react_to_message puts one emoji on it, while the window is open. A new emoji replaces the business's last reaction, and an empty one takes it back.

Docs: https://docs.whatsable.app/mcp/workflows#reply-to-a-customer
