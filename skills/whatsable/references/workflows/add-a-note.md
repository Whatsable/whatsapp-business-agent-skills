<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Add a note

**Goal:** Leave the team an internal note on a chat, which the customer never sees.

**People ask:** "Add a note to Ana's chat: she wants the invoice re-issued." · "Note on the Acme chat that we call them back on Monday."

**Access needed:** Send and read. Read only can run step 1.

**Tools:** `list_conversations`, `add_conversation_note`, `read_conversation`, `delete_conversation_note`, `update_contact`

## Steps

1. Find the chat with list_conversations and query set to the person's name. Several matches come back with name and phone; none still matches the first letters of the name.
2. Add the note with add_conversation_note. The team sees it in the inbox under this connection's name; the customer never sees it, and nothing is sent.
3. To remove a note, read_conversation gives its id and delete_conversation_note deletes it. A note about the contact rather than one chat is update_contact's note, which replaces the contact's single note.

Docs: https://docs.whatsable.app/mcp/workflows#add-a-note
