<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Daily report

**Goal:** A one-day report: the chats, who waits, failures, AI handoffs and what is planned.

**People ask:** "Give me my daily WhatsApp report." · "What happened on WhatsApp yesterday?" · "Who is still waiting for an answer this morning?"

**Access needed:** Read only.

**Tools:** `list_conversations`, `get_message_analytics`, `list_messages`, `get_message`, `read_conversation`, `list_scheduled_messages`, `list_broadcasts`

## Steps

1. Agree the period and the time zone with the person, such as since midnight today or all of yesterday.
2. List the chats of the period with list_conversations from its start. A chat whose last message came from the customer still waits for an answer; each chat shows its 24-hour window and its AI status.
3. Count the messages that came in and went out with get_message_analytics for the day, in the same time zone, naming number_id when this connection holds only some numbers. It also gives the failure codes; list_messages with the failed status lists the failed messages, and get_message gives the reason of one.
4. For each chat where the bot handed off or a person paused the AI, read why with read_conversation.
5. What is planned: list_scheduled_messages with the pending status, the running and paused broadcasts with list_broadcasts, and the broadcasts still to start with list_broadcasts with the scheduled status.
6. The report has short parts: the numbers, the people waiting with the time left in their window, the failures with their fix, the handoffs, and what is planned. Nothing is sent.

Docs: https://docs.whatsable.app/mcp/workflows#daily-report
