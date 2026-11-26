<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Access and scopes

A connection holds the access it was given when it was connected, and a tool it has no scope for is hidden: the assistant does not see it.

Full access holds every scope, including those added later. Send and read holds every scope except templates:write, labels:write, broadcasts:write, ai:configure and webhooks:manage: it reads, sends, updates contacts and switches the AI on or off, but cannot create templates, labels or broadcasts, or change AI bots. Read only holds numbers:read, templates:read, messages:read, contacts:read, broadcasts:read, ai:read and members:read: it sends and changes nothing.

To change the access, revoke the connection in Whatsable under Settings > API keys > Connected AI apps, then connect again and choose the access you need. A connection made with an API key holds that key's scopes.

No connection can change the team. list_members reads it, but inviting someone, changing a role and removing someone need the person signed in to Whatsable, under Settings > Team, because a seat is billed and a role grants privileges.

Docs: https://docs.whatsable.app/mcp/concepts#scopes
