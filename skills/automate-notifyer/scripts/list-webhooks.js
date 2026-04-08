#!/usr/bin/env node
/**
 * list-webhooks.js — List webhook endpoints.
 *
 * GET /api:qh9OQ3OW/webhook/dev           (--type dev, default)
 * GET /api:qh9OQ3OW/user/io/webhook       (--type io)
 *
 * Usage:
 *   node scripts/list-webhooks.js                    # dev webhooks (default)
 *   node scripts/list-webhooks.js --type io          # IO (incoming & outgoing) webhooks
 *   node scripts/list-webhooks.js --pretty
 *
 * Flags:
 *   --type dev|io   dev = developer/schedule webhooks for n8n, Make, Zapier (default)
 *                   io  = incoming & outgoing bidirectional webhooks
 *   --pretty        Print human-readable table to stderr
 *
 * Output (success):
 *   {
 *     "ok": true,
 *     "data": {
 *       "type": "dev",
 *       "webhooks": [
 *         {
 *           "id": 5,
 *           "webhooks": "https://hook.eu2.make.com/...",
 *           "status": true,
 *           "outgoing": true,
 *           "incoming": true,
 *           "schedule_activity": false,
 *           "waiting_duration": 0,
 *           "signature_secret": null,
 *           "created_at": 1706184000000
 *         }
 *       ],
 *       "count": 1
 *     }
 *   }
 *
 * IO webhook fields: id, webhooks (URL), is_active, created_at
 *
 * Notes:
 *   - Dev webhook endpoints ALL require Origin: https://console.notifyer-systems.com
 *     because Xano runs /cors_origin_console. The script sends this automatically.
 *   - IO webhook endpoints do NOT require a CORS header (no cors check in Xano).
 *   - Dev webhook raw response may use is_incoming_outgoing_enable or
 *     is_incoming_outgoing instead of outgoing/incoming — this script normalizes both.
 *   - Xano table for dev: zapier_make_webhooks.
 *   - Xano table for IO: webhook_incoming_and_outgoing.
 *   - Both endpoints return direct arrays (As Self response).
 *   - Uses console auth mode (Authorization: Bearer <token>).
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL   required
 *   NOTIFYER_API_TOKEN      required (from login.js)
 */

import { loadConfig, requestJson } from "./lib/notifyer-api.js";
import { parseArgs, getFlag, getBooleanFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";

const CONSOLE_ORIGIN = "https://console.notifyer-systems.com";
const VALID_TYPES = ["dev", "io"];

function normalizeDev(raw) {
  return {
    id: raw.id,
    webhooks: raw.webhooks,
    status: typeof raw.status === "boolean" ? raw.status : Boolean(raw.status),
    outgoing:
      typeof raw.outgoing === "boolean"
        ? raw.outgoing
        : Boolean(
            raw.is_incoming_outgoing_enable ??
              raw.is_incoming_outgoing ??
              raw.outgoing
          ),
    incoming:
      typeof raw.incoming === "boolean"
        ? raw.incoming
        : Boolean(
            raw.is_incoming_outgoing_enable ??
              raw.is_incoming_outgoing ??
              raw.outgoing
          ),
    schedule_activity:
      typeof raw.schedule_activity === "boolean" ? raw.schedule_activity : false,
    waiting_duration:
      typeof raw.waiting_duration === "number" ? raw.waiting_duration : 0,
    signature_secret: raw.signature_secret ?? null,
    created_at: raw.created_at,
  };
}

function formatTimestamp(ms) {
  if (!ms) return "N/A";
  return new Date(ms).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function printDevSummary(webhooks) {
  process.stderr.write(`\nDev Webhooks (${webhooks.length} total)\n`);
  process.stderr.write(`${"─".repeat(110)}\n`);
  process.stderr.write(
    `${"ID".padEnd(5)} ${"Status".padEnd(9)} ${"Out".padEnd(5)} ${"In".padEnd(5)} ${"Sched".padEnd(6)} ${"URL".padEnd(55)} ${"Created".padEnd(18)}\n`
  );
  process.stderr.write(`${"─".repeat(110)}\n`);
  for (const w of webhooks) {
    const id = String(w.id ?? "").padEnd(5);
    const status = (w.status ? "Active" : "Off").padEnd(9);
    const out = (w.outgoing ? "✓" : "✗").padEnd(5);
    const inc = (w.incoming ? "✓" : "✗").padEnd(5);
    const sched = (w.schedule_activity ? "✓" : "✗").padEnd(6);
    const url = (w.webhooks ?? "").slice(0, 54).padEnd(55);
    const date = formatTimestamp(w.created_at).padEnd(18);
    process.stderr.write(`${id} ${status} ${out} ${inc} ${sched} ${url} ${date}\n`);
  }
  process.stderr.write("\n");
}

function printIoSummary(webhooks) {
  process.stderr.write(`\nIO Webhooks (${webhooks.length} total)\n`);
  process.stderr.write(`${"─".repeat(90)}\n`);
  process.stderr.write(
    `${"ID".padEnd(5)} ${"Active".padEnd(8)} ${"URL".padEnd(55)} ${"Created".padEnd(18)}\n`
  );
  process.stderr.write(`${"─".repeat(90)}\n`);
  for (const w of webhooks) {
    const id = String(w.id ?? "").padEnd(5);
    const active = (w.is_active ? "✓" : "✗").padEnd(8);
    const url = (w.webhooks ?? "").slice(0, 54).padEnd(55);
    const date = formatTimestamp(w.created_at).padEnd(18);
    process.stderr.write(`${id} ${active} ${url} ${date}\n`);
  }
  process.stderr.write("\n");
}

async function main() {
  const flags = parseArgs();
  const type = (getFlag(flags, "type") ?? "dev").toLowerCase();
  const pretty = getBooleanFlag(flags, "pretty");

  if (!VALID_TYPES.includes(type)) {
    printJson(err(`--type must be "dev" or "io". Got: "${type}"`));
    return;
  }

  const config = loadConfig({ requireToken: true });

  const isDev = type === "dev";
  const result = await requestJson(config, {
    method: "GET",
    path: isDev ? "/api:qh9OQ3OW/webhook/dev" : "/api:qh9OQ3OW/user/io/webhook",
    ...(isDev ? { extraHeaders: { Origin: CONSOLE_ORIGIN } } : {}),
  });

  if (!result.ok) {
    printJson(err(result.error, result.data, false, result.status));
    return;
  }

  const raw = Array.isArray(result.data) ? result.data : [];
  const webhooks = isDev ? raw.map(normalizeDev) : raw;

  if (pretty) {
    isDev ? printDevSummary(webhooks) : printIoSummary(webhooks);
  }

  printJson(ok({ type, webhooks, count: webhooks.length }));
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
