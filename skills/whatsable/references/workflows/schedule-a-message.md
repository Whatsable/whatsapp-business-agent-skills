<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Schedule a message

**Goal:** Send a message later, see what is scheduled, and cancel one that has not been sent.

**People ask:** "Remind Ana tomorrow at 9am about her appointment." · "What messages are scheduled for this week?" · "Remind Maria on Friday at 10:00 with the payment_reminder template, but only if she has not replied."

**Access needed:** Send and read. Read only can run step 1.

**Tools:** `find_contacts`, `schedule_message`, `get_scheduled_message`, `list_scheduled_messages`, `cancel_scheduled_message`

## Steps

1. find_contacts by name, or by phone, finds the person. Several matches come back with name and phone; none still matches the first letters of the name.
2. schedule_message stores a text or an approved template for a later time and time zone. Nothing is sent in that call.
3. A template is not limited by the window. A text reaches the person only if their 24-hour window is still open when it is sent.
4. For "only if she has not replied", schedule_message a no_reply condition: since_last_message (no reply since your last message), never_replied (never replied to any message of yours), or one of 20m, 45m, 3h, 6h, 12h, 24h, 48h and 72h (no reply within that time of your last message). With no earlier message from you, the reply check passes. For "only if they carry a label" or "unless they do", a labels condition with include or exclude, matched ignoring case and accents. The condition stores the label name, so a later rename or delete stops the send for both include and exclude. It is checked when the message is due. If it fails, nothing is sent, and get_scheduled_message says why. A later follow-up is a template, because a text needs the 24-hour window open at that moment.
5. See what is waiting with list_scheduled_messages; a pending one has not been sent yet.
6. Cancel one with cancel_scheduled_message, as long as it is still pending.

Docs: https://docs.whatsable.app/mcp/workflows#schedule-a-message
