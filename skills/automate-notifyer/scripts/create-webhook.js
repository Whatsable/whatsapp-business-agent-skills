#!/usr/bin/env node
/**
 * create-webhook.js — Create a new webhook endpoint.
 *
 * POST /api:qh9OQ3OW/webhook/dev/create    (--type dev, default)
 * POST /api:qh9OQ3OW/user/io/webhook       (--type io)
 *
 * Usage:
 *   # Dev webhook (for n8n, Make, Zapier integrations):
 *   node scripts/create-webhook.js --url "https://hook.eu2.make.com/abc123"
 *   node scripts/create-webhook.js --url "https://..." --no-outgoing --no-incoming
 *   node scripts/create-webhook.js --url "https://..." --schedule-activity --waiting-duration 3600
 *   node scripts/create-webhook.js --url "https://..." --signature
 *
 *   # IO webhook (bidirectional incoming & outgoing):
 *   node scripts/create-webhook.js --type io --url "https://myapp.com/webhook"
 *   node scripts/create-webhook.js --type io --url "https://myapp.com/webhook" --signature
 *
 * Required Flags:
 *   --url <url>                  The HTTPS endpoint URL to receive webhook events
 *
 * Dev-specific Flags (ignored for --type io):
 *   --outgoing / --no-outgoing   Include outgoing messages in triggers (default: true)
 *   --incoming / --no-incoming   Include incoming messages in triggers (default: true)
 *   --schedule-activity          Enable schedule-based activity trigger (default: false)
 *   --waiting-duration <secs>    Wait time in seconds before triggering (required when --schedule-activity)
 *   --no-status                  Create webhook as inactive (default: active/true)
 *
 * Shared Flags:
 *   --signature                  Generate an HMAC signature secret key (default: false)
 *   --type dev|io                Webhook type (default: dev)
 *   --pretty                     Print summary to stderr
 *
 * Output (success):
 *   {
 *     "ok": true,
 *     "data": {
 *       "id": 5,
 *       "webhooks": "https://hook.eu2.make.com/abc123",
 *       "status": true,
 *       "outgoing": true,
 *       "incoming": true,
 *       "schedule_activity": false,
 *       "waiting_duration": 0,
 *       "signature_secret": null,
 *       "created_at": 1706184000000
 *     }
 *   }
 *
 * Preconditions:
 *   - Dev webhook: a webhook with the same URL must not already exist.
 *     Returns { ok: false, blocked: true } if duplicate URL is detected (HTTP 400).
 *   - Dev webhook: active WhatsApp connection recommended for events to fire.
 *   - IO webhook: no explicit duplicate check observed in Xano.
 *
 * Notes on --signature:
 *   When --signature is passed (active_signature: true), Xano's /cors_origin_console
 *   or /get_user function generates a secret key via "Create Secret Key" and stores it
 *   in signature_secret. The response will include the signature_secret value.
 *   Keep this secret; it is used to verify HMAC signatures on incoming webhook events.
 *
 * Waiting Duration:
 *   waiting_duration is an integer number of seconds. The Xano input type is `integer`.
 *   Example: --waiting-duration 3600 = 1 hour.
 *
 * CORS:
 *   Dev webhook endpoints run /cors_origin_console. The script sends
 *   Origin: https://console.notifyer-systems.com automatically.
 *   IO webhook endpoints do NOT require a CORS header.
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL   required
 *   NOTIFYER_API_TOKEN      required (from login.js)
 */

import { loadConfig, requestJson } from "./lib/notifyer-api.js";
import { parseArgs, getFlag, getBooleanFlag, getNumberFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";

const CONSOLE_ORIGIN = "https://console.notifyer-systems.com";
const VALID_TYPES = ["dev", "io"];

function boolFlagWithDefault(flags, name, defaultValue) {
  const v = flags[name];
  if (v === undefined) return defaultValue;
  if (typeof v === "boolean") return v;
  return v !== "false" && v !== "0";
}

async function main() {
  const flags = parseArgs();
  const type = (getFlag(flags, "type") ?? "dev").toLowerCase();
  const pretty = getBooleanFlag(flags, "pretty");
  const url = getFlag(flags, "url");

  if (!VALID_TYPES.includes(type)) {
    printJson(err(`--type must be "dev" or "io". Got: "${type}"`));
    return;
  }

  if (!url) {
    printJson(err("--url is required. Provide the target webhook endpoint URL."));
    return;
  }

  if (!url.startsWith("http")) {
    printJson(err("--url must be a valid HTTP(S) URL."));
    return;
  }

  const config = loadConfig({ requireToken: true });

  if (type === "dev") {
    const outgoing = boolFlagWithDefault(flags, "outgoing", true);
    const incoming = boolFlagWithDefault(flags, "incoming", true);
    const scheduleActivity = getBooleanFlag(flags, "schedule-activity");
    const waitingDuration = getNumberFlag(flags, "waiting-duration") ?? 0;
    const signature = getBooleanFlag(flags, "signature");
    const status = boolFlagWithDefault(flags, "status", true);

    if (scheduleActivity && waitingDuration === 0) {
      process.stderr.write(
        "Warning: --schedule-activity is set but --waiting-duration is 0 (or not provided). " +
          "Consider passing --waiting-duration <seconds>.\n"
      );
    }

    const body = {
      webhooks: url,
      status,
      outgoing,
      incoming,
      schedule_activity: scheduleActivity,
      waiting_duration: waitingDuration,
      active_signature: signature,
    };

    const result = await requestJson(config, {
      method: "POST",
      path: "/api:qh9OQ3OW/webhook/dev/create",
      body,
      extraHeaders: { Origin: CONSOLE_ORIGIN },
    });

    if (!result.ok) {
      if (result.status === 400) {
        printJson(
          err(
            `A webhook pointing to "${url}" already exists. Use list-webhooks.js to view existing webhooks.`,
            result.data,
            true
          )
        );
      } else {
        printJson(err(result.error, result.data, false, result.status));
      }
      return;
    }

    if (pretty) {
      const d = result.data;
      process.stderr.write("\nDev webhook created:\n");
      process.stderr.write(`  ID:                ${d.id}\n`);
      process.stderr.write(`  URL:               ${d.webhooks}\n`);
      process.stderr.write(`  Status:            ${d.status ? "Active" : "Off"}\n`);
      process.stderr.write(`  Outgoing:          ${d.outgoing ? "Yes" : "No"}\n`);
      process.stderr.write(`  Incoming:          ${d.incoming ? "Yes" : "No"}\n`);
      process.stderr.write(`  Schedule Activity: ${d.schedule_activity ? "Yes" : "No"}\n`);
      process.stderr.write(`  Waiting Duration:  ${d.waiting_duration}s\n`);
      if (d.signature_secret) {
        process.stderr.write(`  Signature Secret:  ${d.signature_secret}  ← SAVE THIS!\n`);
      }
      process.stderr.write("\n");
    }

    printJson(ok(result.data));
  } else {
    // IO webhook
    const signature = getBooleanFlag(flags, "signature");
    const status = boolFlagWithDefault(flags, "status", true);

    const body = {
      webhook: url,
      status,
      active_signature: signature,
    };

    const result = await requestJson(config, {
      method: "POST",
      path: "/api:qh9OQ3OW/user/io/webhook",
      body,
    });

    if (!result.ok) {
      printJson(err(result.error, result.data, false, result.status));
      return;
    }

    if (pretty) {
      const d = result.data;
      process.stderr.write("\nIO webhook created:\n");
      process.stderr.write(`  ID:               ${d.id}\n`);
      process.stderr.write(`  URL:              ${d.webhooks ?? d.webhook}\n`);
      process.stderr.write(`  Active:           ${d.is_active ?? d.status ? "Yes" : "No"}\n`);
      if (d.signature_secret) {
        process.stderr.write(`  Signature Secret: ${d.signature_secret}  ← SAVE THIS!\n`);
      }
      process.stderr.write("\n");
    }

    printJson(ok(result.data));
  }
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
