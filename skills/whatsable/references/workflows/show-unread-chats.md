<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Show my unread chats

**Goal:** List the chats nobody has read yet, and mark one read or unread when asked.

**People ask:** "Which chats haven't we read yet?" · "Mark Ana's chat as read." · "Mark that chat unread so I remember to answer it."

**Access needed:** Send and read. Read only can run steps 1 to 2.

**Tools:** `list_conversations`, `read_conversation`, `set_conversation_unread`

## Steps

1. List them with list_conversations and unread true: each has messages nobody read in the inbox, or someone marked it unread. Reading a chat here does not mark it read.
2. Summarize who wrote and what they want. For a chat the person names, find it in one call with list_conversations and query set to the name. Several matches come back with name and phone; none still matches the first letters of the name. read_conversation shows what was said in it.
3. Only when the person asks, mark a chat read with set_conversation_unread and unread false, which clears its unread count in the inbox, or unread with unread true, so it stands out.

Docs: https://docs.whatsable.app/mcp/workflows#show-unread-chats
