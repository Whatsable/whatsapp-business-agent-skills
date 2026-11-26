<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Troubleshooting

From the Whatsable docs. When the connection itself fails, start here; when a message failed, read its code in the error files.

## Troubleshooting the MCP server

### The app cannot connect

- **Claude:** you must choose **Register automatically** as the OAuth client. Remove the connector and add it again. See [Connect Claude](https://docs.whatsable.app/mcp/connect/claude).
- **Check the URL:** it is `https://api.whatsable.app/mcp`, with `/mcp` at the end and nothing after it.
- **Check the transport:** choose HTTP or Streamable HTTP, not SSE. In the Gemini CLI, use `httpUrl`, not `url`.
- **The app has no browser:** sign-in opens a browser on the same computer. On a server or over SSH, [use an API key](https://docs.whatsable.app/mcp/manage-access#connect-with-an-api-key-instead).

### The sign-in page refuses

- **"Only owners and admins of an organization can connect an AI app to it."** or **"Only owners and admins can connect an AI app."**: ask an owner of the organization to connect the app, or to make you an admin.
- **An organization is greyed out, "Plan not active":** renew the plan in **Billing**, or choose another organization.
- **"Plan does not include the API":** the organization's plan does not include the API. Change the plan in **Billing**.
- **"This organization has no connected WhatsApp number":** connect a number in **Channels**, then connect the app again.
- **"This link has expired":** you took more than ten minutes. Go back to the AI app and start connecting again.

### A tool is missing

The assistant sees only the tools that its access allows. With **Send and read**, for example, it cannot create templates or broadcasts, and with **Read only** it cannot send. To give it more, revoke the connection and connect again with more access. See [Change what an app can do](https://docs.whatsable.app/mcp/manage-access#change-what-an-app-can-do).

A tool the assistant can use sometimes points to one it cannot. The assistant then reads the missing permission next to that tool's name, for example `send_template_message [needs messages:send]`. That is the permission to add when you connect again. A tool outside the connection's access cannot be called at all: Whatsable refuses it and nothing is sent or changed.

If the access is right, your AI app may hold an old list of tools. Start a new chat, or refresh the app in its settings (ChatGPT needs **Refresh**).

### A send is refused before it goes out

Whatsable checks a send before it reaches WhatsApp. When a check fails, the tool answers with an error that names the problem and how to fix it, and nothing is sent. The most common ones:

- **The 24-hour window is closed.** A text or media message reaches a person only within 24 hours of their last message. Send an approved template instead. See [The 24-hour window](https://docs.whatsable.app/mcp/concepts#24-hour-window).
- **A template variable is missing.** Ask the assistant to read the template first, then send again.
- **The number cannot send right now.** Check the number in **Channels**.

### A message comes back "Not sent"

Whatsable sent the message, and WhatsApp refused it. The result says why and whether a retry can work. Nothing reached the person.

**"Not sent, or not confirmed"** is different: WhatsApp did not answer in time, so the message may still arrive. Don't send it again until you know it did not arrive. Ask the assistant to check the message a little later.

A send that succeeds means WhatsApp accepted the message, not that it was delivered. Ask the assistant to check the message later: it shows delivered, read or failed. [Not sent results](https://docs.whatsable.app/mcp/concepts#not-sent) explains more.

### A tool answers with an error

| The error starts with | What it means |
| --- | --- |
| **No active plan** or **Feature not in your plan** | Your Whatsable plan changed. Renew or change it in **Billing**. The connection works again once the plan includes the MCP server: any plan except Bulk Message, including the Free plan. |
| **Number not allowed for this key** | The connection does not include that number. Revoke it in **Connected AI apps**, then connect again and choose the number. |
| **Input validation error** | The assistant sent a field the tool does not have, often a misspelled filter. Nothing ran. Ask it to try again; the error names the field. |
| **Too many requests** | The connection hit a rate limit. The error says how many seconds to wait. Each connection has the same limits as an API key. |

### The app asks you to sign in again

- **Someone revoked the connection** in **API keys** in the sidebar, then **Connected AI apps**.
- **The person who approved it** is no longer an owner or an admin, or left the organization. Their connections stop at once. Someone else who is an owner or an admin connects the app again.
- **You did not use the app for 30 days.** The sign-in expired. Sign in again.

### Something else

Message us on WhatsApp from the help link in Whatsable, and tell us which AI app you use and what the assistant answered.

Source: https://docs.whatsable.app/mcp/troubleshooting

## Connect a number from a link

When your AI app is connected to Whatsable and your account has no WhatsApp number yet, the AI app can give you a link to connect one. The link opens a Whatsable page that runs Meta's signup. The person who opens it does not need a Whatsable account, so you can also send it to the teammate who manages the business's WhatsApp.

### What the link does

- **It connects one WhatsApp Business number** to the account that created the link. The page shows the account's name, so the person knows where the number goes.
- **It works for 24 hours.** After that, the page says that the link has expired.
- **Opening the page does not use the link up.** The link is used up only when a number connects through it. If Meta's signup is cancelled or fails, the same link still works.
- **A used link shows that it was used.** To connect another number, ask your AI app for a new link.
- **The number counts like any other number.** The [trial](https://docs.whatsable.app/mcp/plans) starts when the account connects its first number, and the plan's number limit applies.

Only an AI app with **Full access** can create a link, because the link lets its holder add a number to your account. See [Access and connections](https://docs.whatsable.app/mcp/manage-access) for the access levels.

### Ask your AI app for a link

Ask in your own words, for example:

- "Give me the link to connect my WhatsApp number."
- "Send the WhatsApp connect link to ana@example.com."

Your AI app uses one tool, `create_number_connect_link`:

- **Without an email address**, it creates the link and gives it to you in the chat.
- **With an email address**, it also emails the link to that address, with you in CC. The email names your account and says that you asked.

The email only sends the link. Whatsable does not send it on WhatsApp yet.

When your account has no number, the AI app offers the link before anything else: that is the first step of the [Get started workflow](https://docs.whatsable.app/mcp/workflows#get-started). During the trial, it also asks once whether the business has other numbers, and offers a link for each.

### Connect the number

**Open the link**

The page shows the account the number will join and when the link stops working.

**Choose Connect WhatsApp**

Meta opens a window. Sign in with Facebook, choose the business, and confirm the number. It takes about 5 minutes.

**Finish on the page**

The page says when the number is connected. If WhatsApp asks for the number's six-digit two-step PIN, the page shows a box for it. If the page shows a two-step PIN, save it: it is shown once.

### From the API

The same link comes from [`POST /v1/number-connect-links`](https://docs.whatsable.app/api-reference/v1/numbers/create-number-connect-link). Send an empty body to get the link, or `email` (and an optional `name`) to email it. The API key must have Full access; a key with a list of scopes answers `403 insufficient_scope`.

Source: https://docs.whatsable.app/mcp/connect-number

## Access and connections

When you connect an AI app, Whatsable asks you to sign in and approve what the app may do. The approval creates a **connection**. A connection works like an API key that only that AI app holds: it has the access and the numbers you chose, and you can revoke it.

### What you approve

The AI app sends you to Whatsable in your browser. There are three steps.

**Sign in**

    Sign in with your Whatsable account. If you are already signed in, choose **Continue as** your name.

*The sign-in page an AI app opens*

**Choose the organization**

    Pick the organization the app will work with. An organization is greyed out when you cannot connect it, and the page says why: its plan is not active, or its plan does not include the API. Only owners and admins can connect an AI app.

*Choose an organization*

**Approve the access**

    The page names the AI app and the organization. Choose:

    - **What it can do**: one of the three access levels below.
    - **Default number**: the number the app sends from unless it is told otherwise.
    - **Numbers it can use**: only the default number, all numbers, or specific numbers.

    If your account has no connected number yet, the page approves all numbers with no default. The first number you connect afterwards becomes the app's default number, and the app keeps all numbers.

    Under the title, the page shows where you go back to after you answer. Check that it is the AI app you started from. Then choose **Approve**, or **Deny** to cancel.

*The approval page*

### The access levels

| Access | What the assistant can do |
| --- | --- |
| **Full access** | Everything the API can do, including anything added later: send, create and delete templates, create labels, create, pause and resume broadcasts, turn the AI on or off in a conversation, and change AI agents. |
| **Send and read** | Send messages, react to a message with an emoji, read everything, add, update and label contacts, mark chats read or unread, add and delete internal notes, mark an AI message's figures as checked, turn the AI off or on in a conversation or choose its agent, cancel a reply the AI is about to retry, read saved replies, turn a contact's AI follow-ups off or on, and choose which AI agent answers on a number. It cannot create, rename or delete labels, create templates or broadcasts, or edit an AI agent. |
| **Read only** | Read numbers, templates, messages, contacts, broadcasts, AI agents, team members and saved replies. It cannot send or change anything. |

A connection or API key made with **Send and read** before it could turn the AI off and on shows as **Custom** and lacks that. The same goes for a **Send and read** or **Read only** connection made before it could read the team: it shows as **Custom** and cannot list team members. To get either, revoke it and connect again.

No access level can change the team. Inviting someone, changing a role and removing someone stay in **Settings > Team**, for a person signed in to Whatsable.

The assistant sees only the tools its access allows. Choose **Read only** to let it answer questions about your conversations with no risk of a send. Choose **Full access** only when you want it to set things up for you, such as templates, broadcasts or AI agents.

### See your connected AI apps

Open **API keys** in the sidebar. The **Connected AI apps** list shows every app connected to the organization: its access, its numbers, who connected it, when, and when it was last used.

*API keys in the sidebar, then Connected AI apps*

### Revoke a connection

In **Connected AI apps**, choose **Revoke** on the app's row, then **Revoke now**. The app stops working with this organization at its next request.

*Revoking a connection*

> [!WARNING]
>
> **Removing Whatsable from your AI app does not revoke the connection.** Claude, ChatGPT and the others delete their copy of the connection, but Whatsable still lists it until you revoke it here. Revoke it in Whatsable whenever you stop using an app.

A connection is also revoked by itself when the person who approved it stops being an owner or an admin of the organization, or leaves it.

### Change what an app can do

You cannot edit a connection. To change its access or its numbers, revoke it in Whatsable, then connect the app again. The approval page opens again, and you choose anew.

### Connect with an API key instead

Apps that you configure with a file, such as Claude Code, Cursor, VS Code and the Gemini CLI, can also send an API key instead of signing in. Create one in **API keys** in the sidebar, then send it in the `Authorization` header:

```text
Authorization: Bearer nfy_live_...
```

The key's own access and numbers then apply. Each connection guide shows where the header goes. Prefer signing in when your app supports it: the key is a secret that sits in a file, and anyone who reads the file can use it.

Source: https://docs.whatsable.app/mcp/manage-access

## More help

- WhatsApp Cloud API error 130429: https://docs.whatsable.app/whatsapp-error-130429
- WhatsApp Cloud API error 131026: https://docs.whatsable.app/whatsapp-error-131026
- WhatsApp Cloud API error 131037: https://docs.whatsable.app/whatsapp-error-131037
- WhatsApp Cloud API error 131047: https://docs.whatsable.app/whatsapp-error-131047
- WhatsApp Cloud API error 131049: https://docs.whatsable.app/whatsapp-error-131049
- WhatsApp Cloud API error 132001: https://docs.whatsable.app/whatsapp-error-132001
- What are Whatsable and Meta messaging rate limits?: https://docs.whatsable.app/features/rate-limits
- Error Handling: https://docs.whatsable.app/features/error-handling
- Changelog: https://docs.whatsable.app/changelog
