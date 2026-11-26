<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# WhatsApp errors: rate limit

A failed message names Meta's code. Find it below; a code that is not listed falls back to its family.

**The family:** WhatsApp rate-limited this app, WABA, or phone number. **Fix:** Slow the scenario down and retry with backoff. Do not hammer the same send. **Who fixes it:** Meta. **Retry helps:** yes.

| Code | Title | Meaning | How to fix | Who fixes it | Retry helps |
|---|---|---|---|---|---|
| `4` | App rate limit reached | This WhatsApp app has used its hourly API budget, so WhatsApp is refusing further calls until the window resets. | Pause sends and retry later with backoff. Retrying immediately burns the same budget. | Meta | yes |
| `80007` | WABA rate limit reached | This WhatsApp Business Account has hit Meta's rate limit. | Reduce how many sends the scenario fires per minute and retry with backoff. | Meta | yes |
| `130429` | Cloud API throughput reached | This phone number sent more messages per second than WhatsApp allows. | Queue messages and retry with backoff. This is a short spike, not a quality ban. Guide: https://docs.whatsable.app/whatsapp-error-130429 | Meta | yes |
| `131056` | Too many messages to this user | WhatsApp rate-limited this app, WABA, or phone number. | Slow the scenario down and retry with backoff. Do not hammer the same send. | Meta | yes |
| `133016` | Account has too many contacts | WhatsApp rate-limited this app, WABA, or phone number. | Slow the scenario down and retry with backoff. Do not hammer the same send. | Meta | no |

Meta's reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/support/error-codes
