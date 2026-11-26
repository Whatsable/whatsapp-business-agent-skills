<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Business check-up

**Goal:** Read the recent chats, name the type of business, and report what it misses and what to do next.

**People ask:** "Run a business check-up of my chats." · "What do my WhatsApp chats say about my business?"

**Access needed:** Read only.

**Tools:** `list_conversations`, `list_messages`, `get_setup_status`

## Steps

1. Read the chats of the last 30 days with list_conversations, and the latest messages of the busiest ones with list_messages. Nothing is sent.
2. Say what type of business the chats show, such as a clinic, a shop or a real estate agent, and ask the person to confirm it.
3. Report what matters for that type. A clinic: patients who asked for an appointment and got no reply, and questions about prices or insurance. A shop: people who asked about price, stock or delivery and did not buy, and open order questions. A real estate agent: people interested in a property who got no viewing, and leads nobody followed up. Any business: missed messages, people waiting for an answer, the questions asked most, and the busiest hours.
4. Explain the 24-hour window in one line: a reply within 24 hours of the person's last message is free on Meta, and a message after that, or to someone new, is a template, which needs a payment method in Meta.
5. Offer next steps that the plan includes now, from get_setup_status: replies to the people waiting, a follow-up list, or starter templates (the prepare-starter-templates workflow).

Docs: https://docs.whatsable.app/mcp/workflows#business-check-up
