<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Messenger errors

Messenger codes share numbers with WhatsApp codes but not their meaning: read a Messenger message's code here, never in the WhatsApp files. The MCP tools send on WhatsApp only, so these come up when the person asks about a message sent from the inbox.

| Code | Title | Meaning | How to fix | Who fixes it | Retry helps |
|---|---|---|---|---|---|
| `4` | Messenger rate limit | Messenger rate-limited this app or Page. | Wait a moment and retry. Do not send the same message repeatedly. | Meta | no |
| `190` | Facebook Page connection lost | Facebook no longer accepts this Page's access token. | Reconnect the Facebook Page in Settings, Channels, then retry. | Meta | no |
| `551` | Messenger user unavailable | The customer cannot receive messages from this Page right now. | Do not keep retrying. The customer may have blocked the Page or stopped receiving its messages. | Meta | no |
| `613` | Messenger rate limit | Messenger rate-limited this app or Page. | Wait a moment and retry. Do not send the same message repeatedly. | Meta | no |
| `1545041` | Messenger user unavailable | The customer cannot receive messages from this Page right now. | Do not keep retrying. The customer may have blocked the Page or stopped receiving its messages. | Meta | no |
| `1893063` | Facebook Page restricted from messaging | Facebook temporarily restricted this Page from sending messages for a policy reason. | Read the explanation in the Page's Support Inbox and resolve it. Do not keep retrying. | Meta | no |
| `2018001` | No matching Messenger user | Messenger did not find the customer this reply was addressed to. | Do not retry. The customer's account may have been deleted or deactivated. | Meta | no |
| `2018008` | Messenger could not take the file | Messenger could not receive the attachment, or the upload never answered. | Send the file again. | Meta | no |
| `2018028` | App not approved for Messenger | Meta lets this app message only the app's own admins, developers and testers until pages_messaging passes App Review. | Wait for App Review to approve pages_messaging. Do not retry. | Meta | no |
| `2018047` | Messenger refused the attachment | Messenger could not process the file, often because its type does not match its contents. | Send a JPG, PNG or GIF image, an MP4 video, or send the file as a document. | Meta | no |
| `2018108` | Messenger user unavailable | The customer cannot receive messages from this Page right now. | Do not keep retrying. The customer may have blocked the Page or stopped receiving its messages. | Meta | no |
| `2018109` | Messenger attachment too large | The file is larger than the 25 MB Messenger accepts. | Send a smaller file. | Meta | no |
| `2018278` | Outside the Messenger reply window | Messenger accepts a reply only within 24 hours of the customer's last message, or up to 7 days for a reply a person typed. | Wait for the customer to write again, then reply. | Meta | no |
| `2018294` | Messenger video timed out | Messenger did not finish taking the video within its 75-second limit, or the video is corrupt. | Send the video again, or send a shorter or smaller one. | Meta | no |
| `2534022` | Outside the Messenger reply window | Messenger accepts a reply only within 24 hours of the customer's last message, or up to 7 days for a reply a person typed. | Wait for the customer to write again, then reply. | Meta | no |
| `2534037` | Another app owns this Messenger conversation | Another app, or Meta's own assistant, controls this conversation right now. | Wait until the conversation is handed back, then retry. | Meta | no |
| `-10` | Human Agent replies not approved | A reply more than 24 hours after the customer's last message must be tagged Human Agent, and Meta has not approved Human Agent replies for this app yet. | Reply within 24 hours of the customer's last message until Meta approves the Human Agent permission. Do not retry. | Meta | no |

Meta's reference: https://developers.facebook.com/documentation/business-messaging/messenger-platform/error-codes
