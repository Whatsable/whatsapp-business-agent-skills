<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Find missed messages

**Goal:** Find the people who wrote and got no answer, and offer the replies.

**People ask:** "Did we miss any messages this week?" · "Who wrote to us and never got an answer?"

**Access needed:** Send and read. Read only can run steps 1 to 3.

**Tools:** `list_conversations`, `read_conversation`, `send_text_message`, `list_templates`, `send_template_message`

## Steps

1. List the chats still waiting for an answer with list_conversations and awaiting_reply true, oldest message first in the report: each shows its 24-hour window.
2. Read the ones that matter with read_conversation, and group them by what the person wants. A clinic: appointments and results. A shop: price, stock and orders. A real estate agent: viewings and prices. Any business: by topic.
3. Say how many waited, since when and about what. Nothing is sent yet.
4. Offer to draft the replies, and send each only after the person agrees. While the window is open, send_text_message sends it, free on Meta. After it has closed, only an approved template reaches the person: pick one with list_templates and send it with send_template_message.

Docs: https://docs.whatsable.app/mcp/workflows#find-missed-messages
