<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# AI and follow-ups

An AI bot answers a conversation, and can follow up on its own when the customer goes quiet. A bot answers only while its own status is active; a draft answers no one. Each conversation also has an AI status: active, off, paused_by_human or handed_off.

paused_by_human means a person replied, in the Whatsable inbox, an inbox embedded in another app or the WhatsApp app, or through these tools, so the bot stops answering that chat. A send tool pauses it by default, and its result says so. Pass pause_ai false to leave the AI on. Depending on the bot's settings it answers again after a set time, when the customer writes after the window closed, or not until someone switches it back on. handed_off means the bot passed the chat to a person.

Why did the bot do that? read_conversation with types ai_decision lists each of its decisions in a conversation, the reason code and the bot's reasoning: its own account, not a verified fact. Without types it shows the whole history in order, with the messages, the team's notes, the labels and each change of AI status. The bot's entries need the ai:read scope and the label entries contacts:read; without them they are left out.

set_conversation_ai with off stops the bot's replies and its follow-ups in that one conversation, and only a person switching it back on undoes it. active turns the AI back on, also after a person took over or the bot handed off.

set_conversation_ai with bot_id makes another of the business's AI agents that is not archived answer that one conversation; bot_id null hands it back to the number's default. When a reply failed and the agent is waiting to retry it, cancel_ai_retry stops that reply.

There is no switch for follow-ups alone in one conversation: off stops both. set_contact_follow_ups with off stops the bot's follow-ups to one contact on every number while the bot keeps answering them; it is the inbox's Follow up switch, and on allows them again, from a connection that can use every number the contact talks to. Follow-ups as a whole are a bot setting, changed with update_ai_bot. assign_ai_bot_to_number with no bot leaves a number with no default bot, so its conversations without a bot of their own get no AI.

Docs: https://docs.whatsable.app/mcp/concepts#ai-and-follow-ups
