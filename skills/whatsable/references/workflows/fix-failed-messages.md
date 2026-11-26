<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Fix failed messages

**Goal:** Explain why messages failed, and resend the ones a retry can fix.

**People ask:** "Which messages failed this week, and why?" · "Resend the messages that failed yesterday."

**Access needed:** Send and read. Read only can run steps 1 to 3.

**Tools:** `list_messages`, `get_message`, `send_text_message`, `send_template_message`

## Steps

1. List the failures with list_messages and the failed status, from the moment the person names.
2. Read each one with get_message: its error says why it failed and whether a retry later is worth it. Group the failures by reason.
3. Explain each group and its fix, such as a closed 24-hour window, a number that is not on WhatsApp, or a template that Meta paused.
4. A retry uses send_text_message while the 24-hour window is open, or send_template_message with an approved template after it has closed.
5. A message whose outcome is unknown may still arrive. Sending it again is a second message.

Docs: https://docs.whatsable.app/mcp/workflows#fix-failed-messages
