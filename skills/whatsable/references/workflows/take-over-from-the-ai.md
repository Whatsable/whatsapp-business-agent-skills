<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Take over from the AI

**Goal:** Stop the bot and its follow-ups in one chat, reply by hand, and hand it back later.

**People ask:** "Pause the bot for Maria and tell her I'll call her at 5." · "Turn the AI back on for Maria's chat." · "Stop following up with Maria, but let the bot answer her."

**Access needed:** Send and read. Read only can run steps 1 to 3.

**Tools:** `find_contacts`, `list_conversations`, `get_conversation`, `read_conversation`, `set_conversation_ai`, `set_contact_follow_ups`, `send_text_message`

## Steps

1. find_contacts by name, or by phone, lists that person's conversations. Several matches come back with name and phone; none still matches the first letters of the name. list_conversations shows the latest chats.
2. Check it with get_conversation: its AI status, and whether the 24-hour window is open.
3. Before taking over, read what happened with read_conversation: the messages, the team's notes, and why the bot did what it did, such as the reason it handed off.
4. send_text_message sends the reply in that conversation. A reply sent through these tools pauses the AI agent in that chat by default, as a reply in the inbox does, and the result says so: tell the person the AI is now paused there. Pass pause_ai false to leave it on.
5. To stop the bot without replying, use set_conversation_ai and status off. That stops its replies and its follow-ups in this one chat until someone turns it back on; every other chat keeps the bot.
6. If the person only wants the bot to stop chasing someone, use set_contact_follow_ups with status off instead: it stops the follow-ups to that contact on every number, and the bot still answers when they write. Status on allows them again.
7. When the person is done, turn the AI back on with set_conversation_ai and status active.

Docs: https://docs.whatsable.app/mcp/workflows#take-over-from-the-ai
