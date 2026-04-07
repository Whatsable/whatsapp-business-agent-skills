#!/usr/bin/env node
/**
 * get-message-analytics.js — Retrieve messaging analytics summary for a date range.
 *
 * GET /api:5l-RgW1B/anslytics?start_timestamp=<ms>&end_timestamp=<ms>
 *
 * Usage:
 *   node scripts/get-message-analytics.js                        # last 7 days (default)
 *   node scripts/get-message-analytics.js --days 30              # last 30 days
 *   node scripts/get-message-analytics.js --from 2025-01-01 --to 2025-01-31
 *   node scripts/get-message-analytics.js --days 7 --pretty
 *
 * Flags:
 *   --days <n>          Last N days shortcut (default: 7). Ignored if --from/--to given.
 *   --from YYYY-MM-DD   Start date (inclusive, start of day local time)
 *   --to   YYYY-MM-DD   End date   (inclusive, end of day local time)
 *   --pretty            Print human-readable summary to stderr
 *
 * Output (success):
 *   {
 *     "ok": true,
 *     "data": {
 *       "total_sent": 1200,
 *       "sent_count": 1180,
 *       "delivered_count": 1050,
 *       "read_count": 890,
 *       "read_rate": "74.2%",
 *       "delivery_rate": "87.5%",
 *       "start_readable_time": "2025-01-01T00:00:00.000Z",
 *       "end_readable_time": "2025-01-31T23:59:59.999Z",
 *       "period": { "from_ms": 1735689600000, "to_ms": 1738367999999 }
 *     }
 *   }
 *
 * Notes:
 *   - The Xano endpoint path is "anslytics" (with a typo) — this is the real path.
 *   - start_timestamp / end_timestamp are passed as Unix milliseconds (text strings).
 *   - Xano queries the `conversation` table filtered by timestamp range.
 *   - `total_sent`   = all messages attempted in the period.
 *   - `sent_count`   = messages with a confirmed "sent" status from Meta.
 *   - `delivered_count` = messages confirmed delivered to the device.
 *   - `read_count`   = messages opened by the recipient.
 *   - `read_rate` and `delivery_rate` are calculated by this script (not Xano).
 *   - Xano also returns `start_readable_time` and `end_readable_time` as formatted strings.
 *   - Uses console auth mode (Authorization: Bearer <token>). No CORS header needed.
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL   required
 *   NOTIFYER_API_TOKEN      required (from login.js)
 */

import { loadConfig, requestJson } from "./lib/notifyer-api.js";
import { parseArgs, getFlag, getBooleanFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";

function parseDateToMs(dateStr, endOfDay = false) {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function getLastNDays(n) {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  const from = new Date(now);
  from.setDate(from.getDate() - (n - 1));
  from.setHours(0, 0, 0, 0);
  return { fromMs: from.getTime(), toMs: to.getTime() };
}

function pct(num, denom) {
  if (!denom || denom === 0) return "0.0%";
  return ((num / denom) * 100).toFixed(1) + "%";
}

function printSummary(data) {
  const from = new Date(data.period.from_ms).toLocaleDateString("en-GB");
  const to = new Date(data.period.to_ms).toLocaleDateString("en-GB");
  process.stderr.write(`\nMessaging Analytics — ${from} to ${to}\n`);
  process.stderr.write(`${"─".repeat(40)}\n`);
  process.stderr.write(`Total Sent:    ${data.total_sent}\n`);
  process.stderr.write(`Sent (Meta):   ${data.sent_count}\n`);
  process.stderr.write(`Delivered:     ${data.delivered_count}\n`);
  process.stderr.write(`Read:          ${data.read_count}\n`);
  process.stderr.write(`Delivery Rate: ${data.delivery_rate}\n`);
  process.stderr.write(`Read Rate:     ${data.read_rate}\n`);
  process.stderr.write("\n");
}

async function main() {
  const flags = parseArgs();
  const pretty = getBooleanFlag(flags, "pretty");
  const fromStr = getFlag(flags, "from");
  const toStr = getFlag(flags, "to");
  const daysRaw = getFlag(flags, "days") ?? "7";

  let fromMs, toMs;

  if (fromStr || toStr) {
    if (!fromStr || !toStr) {
      printJson(err("--from and --to must both be provided (YYYY-MM-DD)."));
      return;
    }
    fromMs = parseDateToMs(fromStr, false);
    toMs = parseDateToMs(toStr, true);
    if (!fromMs || !toMs) {
      printJson(err("Invalid date format. Use YYYY-MM-DD (e.g. 2025-01-01)."));
      return;
    }
    if (fromMs > toMs) {
      printJson(err("--from must be before or equal to --to."));
      return;
    }
  } else {
    const days = parseInt(daysRaw, 10);
    if (isNaN(days) || days < 1) {
      printJson(err("--days must be a positive integer (e.g. --days 7)."));
      return;
    }
    ({ fromMs, toMs } = getLastNDays(days));
  }

  const config = loadConfig({ requireToken: true });

  const result = await requestJson(config, {
    method: "GET",
    path: "/api:5l-RgW1B/anslytics",
    query: {
      start_timestamp: String(fromMs),
      end_timestamp: String(toMs),
    },
  });

  if (!result.ok) {
    printJson(err(result.error, result.data, false, result.status));
    return;
  }

  const raw = result.data;
  const enriched = {
    total_sent: raw.total_sent ?? 0,
    sent_count: raw.sent_count ?? 0,
    delivered_count: raw.delivered_count ?? 0,
    read_count: raw.read_count ?? 0,
    read_rate: pct(raw.read_count ?? 0, raw.total_sent ?? 0),
    delivery_rate: pct(raw.delivered_count ?? 0, raw.total_sent ?? 0),
    start_readable_time: raw.start_readable_time,
    end_readable_time: raw.end_readable_time,
    period: { from_ms: fromMs, to_ms: toMs },
  };

  if (pretty) printSummary(enriched);

  printJson(ok(enriched));
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
