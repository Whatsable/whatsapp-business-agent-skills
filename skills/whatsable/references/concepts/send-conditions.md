<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Send only when it still makes sense

schedule_message can carry a condition. The reply part is since_last_message (no reply since your last message, stored as two years from that message), never_replied (never replied to any message of yours, stored as two and a half years from your first message), or one of 20m, 45m, 3h, 6h, 12h, 24h, 48h and 72h. Those eight windows are the only durations. If you have not sent them a message yet, the reply check passes.

The label part is include (send if they carry any of the labels) or exclude (send if they carry none). Give ids or names. A name matches ignoring case and accents, and the row stores the name. An unknown label is refused and nothing is scheduled. If you rename or delete a label before the message fires, nothing is sent, for include and for exclude: a rename and a delete look the same, and exclude stays withheld so a person who may still be in that group under the new name is not messaged.

The condition is checked when the message is due, not when you schedule it. If it fails, nothing is sent, and get_scheduled_message says why. A text also needs the 24-hour window open then, so a follow-up after the window is a template. A broadcast has no such condition: choose its recipients instead.

The same rules in the app, in Zapier, Make and n8n, and on the API: https://docs.whatsable.app/features/conditional-follow-ups

Docs: https://docs.whatsable.app/mcp/concepts#send-conditions
