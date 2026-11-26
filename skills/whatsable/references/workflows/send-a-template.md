<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Send a template

**Goal:** Message someone who has not written in 24 hours, or ever, with an approved template.

**People ask:** "Send order_shipped to +1 555 010 0100 for order 1042." · "Let Ana know her appointment is tomorrow at 10."

**Access needed:** Send and read.

**Tools:** `find_contacts`, `create_contact`, `list_templates`, `get_template`, `send_template_message`, `get_message`

## Steps

1. Find the person with find_contacts by name, or by phone. Several matches come back with name and phone; none still matches the first letters of the name. Add them with create_contact if they are new.
2. Pick an approved template with list_templates, and read the variables it needs with get_template.
3. send_template_message sends the template with those values.
4. Later, check with get_message whether it was delivered or read.

Docs: https://docs.whatsable.app/mcp/workflows#send-a-template
