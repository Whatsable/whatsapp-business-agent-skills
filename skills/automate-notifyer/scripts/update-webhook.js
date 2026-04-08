#!/usr/bin/env node
/**
 * update-webhook.js — Update an existing webhook (URL, status, triggers).
 *
 * PATCH /api:qh9OQ3OW/webhook/dev/{id}         (--type dev, default)
 * PATCH /api:qh9OQ3OW/user/io/webhook?id=<id>  (--type io, id is text/string)
 *
 * Strategy: fetch-then-patch.
 *   Calls GET first to load the current record, merges your flag overrides,
 *   then sends the PATCH. This is required because Xano's "Add Or Edit Record"
 *   function expects a complete record object.
 *
 * Usage:
 *   # Dev webhook updates:
 *   node scripts/update-webhook.js --id 5 --url "https://new-endpoint.com/wh"
 *   node scripts/update-webhook.js --id 5 --status false
 *   node scripts/update-webhook.js --id 5 --no-outgoing --no-incoming
 *   node scripts/update-webhook.js --id 5 --schedule-activity --waiting-duration 1800
 *   node scripts/update-webhook.js --id 5 --no-schedule-activity
 *
 *   # IO webhook updates (id is a string):
 *   node scripts/update-webhook.js --type io --id "abc123" --url "https://new-endpoint.com"
 *   node scripts/update-webhook.js --type io --id "abc123" --status false
 *
 * Required Flags:
 *   --id <id>                    Webhook ID to update
 *                                Dev: integer. IO: string/text.
 *
 * Dev-specific Update Flags (ignored for --type io):
 *   --outgoing / --no-outgoing   Toggle outgoing message trigger
 *   --incoming / --no-incoming   Toggle incoming message trigger
 *   --schedule-activity / --no-schedule-activity   Toggle schedule trigger
 *   --waiting-duration <secs>    Update waiting duration in seconds
 *
 * Shared Update Flags:
 *   --url <url>                  Update the webhook endpoint URL
 *   --status true|false          Enable or disable the webhook
 *   --type dev|io                Webhook type (default: dev)
 *   --pretty                     Print summary to stderr
 *
 * Output (success):
 *   {
 *     "ok": true,
 *     "data": { ...updated webhook record }
 *   }
 *
 * Notes:
 *   - Dev webhook: PATCH uses id as a path parameter (PATCH /webhook/dev/:id).
 *   - IO webhook: PATCH sends id as a body field (Xano uses it for lookup).
 *     The id field for IO webhooks is TEXT type in Xano — do not cast to integer.
 *   - Dev PATCH only checks cors_origin_console (CORS), no user auth step.
 *     However, the script sends Authorization: Bearer as it is still an
 *     authenticated zone in practice (CORS check validates console session).
 *   - Dev webhook PATCH also accepts signature_secret field; use create-webhook.js
 *     with --signature to generate a new secret on a new webhook instead.
 *   - IO PATCH inputs: id (text), webhook (text — not "webhooks"), status (bool).
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

function hasFlag(flags, name) {
  return flags[name] !== undefined;
}

async function main() {
  const flags = parseArgs();
  const type = (getFlag(flags, "type") ?? "dev").toLowerCase();
  const pretty = getBooleanFlag(flags, "pretty");
  const idRaw = getFlag(flags, "id");

  if (!VALID_TYPES.includes(type)) {
    printJson(err(`--type must be "dev" or "io". Got: "${type}"`));
    return;
  }

  if (!idRaw) {
    printJson(err("--id is required."));
    return;
  }

  const config = loadConfig({ requireToken: true });

  if (type === "dev") {
    const id = parseInt(idRaw, 10);
    if (isNaN(id)) {
      printJson(err("--id must be an integer for dev webhooks."));
      return;
    }

    // Fetch current state
    const listResult = await requestJson(config, {
      method: "GET",
      path: "/api:qh9OQ3OW/webhook/dev",
      extraHeaders: { Origin: CONSOLE_ORIGIN },
    });

    if (!listResult.ok) {
      printJson(err(`Failed to fetch current webhooks: ${listResult.error}`, listResult.data));
      return;
    }

    const all = Array.isArray(listResult.data) ? listResult.data : [];
    const current = all.find((w) => w.id === id);
    if (!current) {
      printJson(err(`Dev webhook with id ${id} not found. Use list-webhooks.js to see available webhooks.`));
      return;
    }

    // Merge overrides
    const merged = {
      id,
      webhooks: hasFlag(flags, "url") ? getFlag(flags, "url") : current.webhooks,
      status: hasFlag(flags, "status")
        ? getFlag(flags, "status") !== "false"
        : Boolean(current.status),
      outgoing: hasFlag(flags, "outgoing")
        ? getBooleanFlag(flags, "outgoing")
        : Boolean(current.outgoing ?? current.is_incoming_outgoing_enable ?? false),
      incoming: hasFlag(flags, "incoming")
        ? getBooleanFlag(flags, "incoming")
        : Boolean(current.incoming ?? current.is_incoming_outgoing_enable ?? false),
      schedule_activity: hasFlag(flags, "schedule-activity")
        ? getBooleanFlag(flags, "schedule-activity")
        : Boolean(current.schedule_activity ?? false),
      waiting_duration: hasFlag(flags, "waiting-duration")
        ? (getNumberFlag(flags, "waiting-duration") ?? 0)
        : (current.waiting_duration ?? 0),
    };

    const patchResult = await requestJson(config, {
      method: "PATCH",
      path: `/api:qh9OQ3OW/webhook/dev/${id}`,
      body: merged,
      extraHeaders: { Origin: CONSOLE_ORIGIN },
    });

    if (!patchResult.ok) {
      printJson(err(patchResult.error, patchResult.data, false, patchResult.status));
      return;
    }

    if (pretty) {
      const d = patchResult.data;
      process.stderr.write(`\nDev webhook ${id} updated:\n`);
      process.stderr.write(`  URL:               ${d.webhooks}\n`);
      process.stderr.write(`  Status:            ${d.status ? "Active" : "Off"}\n`);
      process.stderr.write(`  Outgoing:          ${d.outgoing ? "Yes" : "No"}\n`);
      process.stderr.write(`  Incoming:          ${d.incoming ? "Yes" : "No"}\n`);
      process.stderr.write(`  Schedule Activity: ${d.schedule_activity ? "Yes" : "No"}\n`);
      process.stderr.write(`  Waiting Duration:  ${d.waiting_duration}s\n`);
      process.stderr.write("\n");
    }

    printJson(ok(patchResult.data));
  } else {
    // IO webhook — id is TEXT type in Xano
    const id = idRaw;

    // Fetch current state to merge
    const listResult = await requestJson(config, {
      method: "GET",
      path: "/api:qh9OQ3OW/user/io/webhook",
    });

    if (!listResult.ok) {
      printJson(
        err(`Failed to fetch current IO webhooks: ${listResult.error}`, listResult.data)
      );
      return;
    }

    const all = Array.isArray(listResult.data) ? listResult.data : [];
    const current = all.find((w) => String(w.id) === String(id));
    if (!current) {
      printJson(
        err(`IO webhook with id "${id}" not found. Use list-webhooks.js --type io to see available.`)
      );
      return;
    }

    // IO PATCH inputs: id (text), webhook (text — singular), status (bool)
    const body = {
      id,
      webhook: hasFlag(flags, "url")
        ? getFlag(flags, "url")
        : (current.webhooks ?? current.webhook),
      status: hasFlag(flags, "status")
        ? getFlag(flags, "status") !== "false"
        : Boolean(current.is_active ?? current.status ?? true),
    };

    const patchResult = await requestJson(config, {
      method: "PATCH",
      path: "/api:qh9OQ3OW/user/io/webhook",
      body,
    });

    if (!patchResult.ok) {
      printJson(err(patchResult.error, patchResult.data, false, patchResult.status));
      return;
    }

    if (pretty) {
      const d = patchResult.data;
      process.stderr.write(`\nIO webhook "${id}" updated:\n`);
      process.stderr.write(`  URL:    ${d.webhooks ?? d.webhook}\n`);
      process.stderr.write(`  Active: ${d.is_active ?? d.status ? "Yes" : "No"}\n`);
      process.stderr.write("\n");
    }

    printJson(ok(patchResult.data));
  }
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
