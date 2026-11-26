<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Create a template

**Goal:** Draft a template with the person and submit it to Meta, which must approve it before a send.

**People ask:** "Create a template telling customers their order shipped, with its number." · "Is my new order_shipped template approved yet?"

**Access needed:** Full access. Read only can run step 1. Send and read can run step 1.

**Tools:** `create_template`, `get_template`

## Steps

1. Agree the wording with the person, numbering each variable and giving an example value for each: Meta's reviewers read the examples.
2. Submit it with create_template. It starts as pending, and Meta's review takes time.
3. Check later with get_template whether it was approved or rejected. Only an approved template can be sent.

Docs: https://docs.whatsable.app/mcp/workflows#create-a-template
