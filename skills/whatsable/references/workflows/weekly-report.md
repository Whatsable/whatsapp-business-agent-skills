<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Weekly report

**Goal:** A seven-day report: volume, failures, broadcasts, templates to fix and top customer topics.

**People ask:** "Give me a weekly WhatsApp report." · "How did this week on WhatsApp compare with last week?"

**Access needed:** Read only.

**Tools:** `get_message_analytics`, `list_messages`, `list_conversations`, `find_contacts`, `list_broadcasts`, `list_templates`

## Steps

1. Agree the week and the time zone with the person. To compare two weeks, read both the same way.
2. Count the messages of the week with get_message_analytics from its first day to its last, naming number_id when this connection holds only some numbers: sent, delivered, read, failed and received, by day. Its failure codes name the most common reasons.
3. Count the chats of the week with list_conversations, and the contacts added or changed with find_contacts, from the same day.
4. List the broadcasts of the week with list_broadcasts, with their sent, delivered, read and failed counts.
5. Check the templates with list_templates, and name each one that Meta rejected, paused or disabled: a broadcast or a reminder that uses it cannot be sent.
6. Read the inbound messages of the week with list_messages and the inbound direction, and name the three or four topics customers asked about most, with one short example each.
7. Write the report: the numbers first, then what changed since the week before, then what needs attention. Nothing is sent.

Docs: https://docs.whatsable.app/mcp/workflows#weekly-report
