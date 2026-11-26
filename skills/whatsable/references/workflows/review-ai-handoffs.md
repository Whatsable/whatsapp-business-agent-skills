<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Review the AI bot's handoffs

**Goal:** Find why the AI bot hands chats off, and what in its prompt covers those reasons.

**People ask:** "Why did the bot hand chats over to us this week?" · "Which questions can the bot not answer yet?"

**Access needed:** Full access. Read only can run steps 1 to 4. Send and read can run steps 1 to 4.

**Tools:** `list_conversations`, `read_conversation`, `list_ai_bots`, `get_ai_bot`, `update_ai_bot`, `mark_figures_checked`

## Steps

1. List the chats of the period with list_conversations, and keep those where the bot handed off or a person paused the AI.
2. Read each one with read_conversation: the messages and the bot's own reasoning for the handoff. The reasoning is the bot's account, not a verified fact.
3. Group the reasons, such as a question the prompt does not cover, a price the bot does not know, or a customer who asked for a person.
4. Read the bot with list_ai_bots and get_ai_bot, and suggest the changes to its prompt that cover the common reasons.
5. update_ai_bot changes the bot. The same fields are described under Edit an AI bot.
6. For the figures the bot flagged, list_conversations with figures_to_check true finds the chats, and read_conversation shows the flagged messages. mark_figures_checked records that a person checked them.

Docs: https://docs.whatsable.app/mcp/workflows#review-ai-handoffs
