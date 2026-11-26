<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Edit an AI bot

**Goal:** Read and change a bot's prompt or settings, create one, or put a bot on a number.

**People ask:** "Make the bot more formal and tell it we are closed on Sundays." · "Put the Sales bot on our second number."

**Access needed:** Full access. Read only can run step 1. Send and read can run step 1.

**Tools:** `list_ai_bots`, `get_ai_bot`, `update_ai_bot`, `read_ai_bot_text`, `create_ai_bot`, `duplicate_ai_bot`, `assign_ai_bot_to_number`

## Steps

1. Find the bot with list_ai_bots and read its configuration with get_ai_bot.
2. To change text inside a long field, read it whole with read_ai_bot_text first, page by page, then send the whole new text. update_ai_bot takes the updated_at from get_ai_bot as version, or the first page's updated_at. A text sent replaces the stored one whole. A version conflict means the bot changed after that read. An active bot's change reaches customers on its next reply.
3. To add to the knowledge or the instructions, send the new text as knowledge_append or instructions_append: it goes at the end, and nothing before it changes.
4. To start a new bot, use create_ai_bot, which starts as a draft that answers no one, or copy one with duplicate_ai_bot.
5. Put a bot on a number with assign_ai_bot_to_number.

Docs: https://docs.whatsable.app/mcp/workflows#edit-an-ai-bot
