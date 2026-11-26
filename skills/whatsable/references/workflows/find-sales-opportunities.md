<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Find sales opportunities

**Goal:** Find the leads and buyers nobody followed up, for the type of business.

**People ask:** "Find sales opportunities in my chats." · "Which leads did we not follow up?"

**Access needed:** Send and read. Read only can run steps 1 to 3.

**Tools:** `list_conversations`, `read_conversation`, `send_text_message`, `send_template_message`, `schedule_message`, `add_contact_label`

## Steps

1. Read the chats of the period with list_conversations, and the promising ones with read_conversation.
2. Look for what a sale looks like in that business. A clinic: a person who asked for a price or an appointment and did not book. A shop: a question about price, size, stock or delivery with no order after it. A real estate agent: interest in a property with no viewing set. Any business: a quote nobody answered, a "let me think about it", or a customer who bought before and went quiet.
3. List each one: the person, what they wanted, when they last wrote, and whether the 24-hour window is open. Nothing is sent.
4. Offer a follow-up for each, sent only after the person agrees: send_text_message while the window is open, or an approved template with send_template_message after it. schedule_message follows up later, only if they have not replied. add_contact_label tags them, so the group can be found again.

Docs: https://docs.whatsable.app/mcp/workflows#find-sales-opportunities
