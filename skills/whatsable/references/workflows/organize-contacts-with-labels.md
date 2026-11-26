<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Organize contacts with labels

**Goal:** Add and remove labels, so contacts can be found and messaged as a group.

**People ask:** "Create a label called Wholesale and put Ana and Pedro on it." · "Remove the VIP label from Pedro."

**Access needed:** Full access.

**Tools:** `list_labels`, `create_label`, `find_contacts`, `add_contact_label`, `remove_contact_label`

## Steps

1. See the labels that exist with list_labels, and create a missing one with create_label.
2. Find each contact with find_contacts by name, or by phone. Several matches come back with name and phone; none still matches the first letters of the name. A label_id lists who has the label already.
3. Add a label with add_contact_label and take one off with remove_contact_label. Taking it off one contact keeps the label for everyone else.

Docs: https://docs.whatsable.app/mcp/workflows#organize-contacts-with-labels
