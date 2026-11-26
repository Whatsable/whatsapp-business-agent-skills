<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Win back quiet customers

**Goal:** Send an approved template to the customers who have not written for a while.

**People ask:** "Which customers have not written to us in 30 days?" · "Send our we_miss_you template to the customers who went quiet this month."

**Access needed:** Full access. Read only can run steps 1 to 2. Send and read can run steps 1 to 2.

**Tools:** `list_conversations`, `create_label`, `add_contact_label`, `list_templates`, `get_template`, `send_template_message`, `create_broadcast`

## Steps

1. Agree the period with the person, such as 30 days.
2. List the chats with list_conversations, latest first: the quiet customers are those whose last message is older than the period. Their 24-hour window has closed, so only a template reaches them.
3. Leave out anyone the person names. Offer to tag the rest with a label, with create_label and add_contact_label, so the group can be found again.
4. Pick an approved template with list_templates and read its variables with get_template. Meta can limit marketing templates to people who did not opt in.
5. send_template_message sends the template to one person. create_broadcast sends it to the label's phones.

Docs: https://docs.whatsable.app/mcp/workflows#win-back-quiet-customers
