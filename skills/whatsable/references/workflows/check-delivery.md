<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Check delivery

**Goal:** Find out whether a message was delivered or read, and why one failed.

**People ask:** "Did my message to Ana arrive?" · "Why did the last message to +1 555 010 0100 fail?"

**Access needed:** Read only.

**Tools:** `find_contacts`, `list_messages`, `get_message`

## Steps

1. When the person names someone, find them with find_contacts by name. Several matches come back with name and phone; none still matches the first letters of the name.
2. Find the message with list_messages, filtered by conversation, contact or status; the failed status shows only the failures.
3. Read it with get_message: sent means WhatsApp accepted it, then delivered and read follow; failed comes with the reason and whether a retry is worth it.

Docs: https://docs.whatsable.app/mcp/workflows#check-delivery
