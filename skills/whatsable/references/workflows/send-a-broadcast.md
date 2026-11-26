<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Send a broadcast

**Goal:** Send an approved template to a label's contacts and follow its progress.

**People ask:** "Send the spring_sale template to everyone labeled VIP." · "Send spring_sale to everyone labeled VIP on Monday at 9:00." · "How is yesterday's broadcast doing?"

**Access needed:** Full access. Read only can run steps 1 to 3. Send and read can run steps 1 to 3.

**Tools:** `list_labels`, `find_contacts`, `list_templates`, `get_template`, `create_broadcast`, `get_broadcast`, `list_broadcast_recipients`, `set_broadcast_status`, `cancel_broadcast`

## Steps

1. Find the recipients: list_labels for the label, then find_contacts with that label for their phones. A broadcast takes phones only, so a contact known only by a WhatsApp user id cannot be a recipient.
2. Pick an approved template with list_templates and read its variables with get_template.
3. One broadcast takes 1 to 10,000 phones, at most 2 MB.
4. create_broadcast launches it now, or at scheduled_at with the person's time zone as its offset and the zone's name as time_zone. The result's recipient_count counts a phone listed twice once.
5. Follow it with get_broadcast and list_broadcast_recipients. set_broadcast_status pauses a running broadcast and resumes a paused one; cancel_broadcast stops the sends that have not gone out yet, and a scheduled one before it starts.

Docs: https://docs.whatsable.app/mcp/workflows#send-a-broadcast
