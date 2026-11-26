<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Add or update contacts

**Goal:** Add contacts from a list the person pastes, or change a contact's name or notes.

**People ask:** "Add these five customers to my contacts." · "Change Ana's note to: prefers a call in the morning."

**Access needed:** Send and read.

**Tools:** `create_contact`, `find_contacts`, `update_contact`

## Steps

1. create_contact adds one contact per call.
2. create_contact takes the phone and the name: it finds the contact when it exists and creates it when it does not. One call per contact.
3. To change the name or a note of an existing contact, find it with find_contacts by name. Several matches come back with name and phone; none still matches the first letters of the name. Then change it with update_contact.

Docs: https://docs.whatsable.app/mcp/workflows#add-or-update-contacts
