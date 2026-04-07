#!/usr/bin/env node
/**
 * get-message-logs.js — Retrieve message logs with optional phone and type filters.
 *
 * GET /api:ereqLKj6/log?phone_number=<int>&filter=<type>
 *
 * Usage:
 *   node scripts/get-message-logs.js                              # all logs
 *   node scripts/get-message-logs.js --filter broadcast           # broadcast logs only
 *   node scripts/get-message-logs.js --filter automation          # automation logs only
 *   node scripts/get-message-logs.js --phone 14155550123          # filter by phone
 *   node scripts/get-message-logs.js --filter broadcast --phone 14155550123
 *   node scripts/get-message-logs.js --page 2 --per-page 10
 *   node scripts/get-message-logs.js --pretty
 *
 * Flags:
 *   --phone <number>    Phone number filter (integer, no + prefix)    (optional)
 *   --filter <type>     automation | broadcast  (optional, default: all)
 *   --page <n>          Page for client-side pagination (default: 1)
 *   --per-page <n>      Items per page (default: 20)
 *   --pretty            Print human-readable table to stderr
 *
 * Output (success):
 *   {
 *     "ok": true,
 *     "data": {
 *       "logs": [
 *         {
 *           "body": "Hello John, your order #12345 has shipped.",
 *           "phone_number": "14155550123",
 *           "created_at": 1706184000000,
 *           "status": "read"
 *         }
 *       ],
 *       "count": 20,
 *       "total": 345,
 *       "page": 1,
 *       "per_page": 20,
 *       "filter": "broadcast",
 *       "phone": 14155550123
 *     }
 *   }
 *
 * Status values: "sent" | "delivered" | "read"
 * Filter values: "automation" (API/webhook triggers) | "broadcast" (bulk sends) | null (all)
 *
 * Notes:
 *   - This endpoint runs /cors_origin_console first — the script sends
 *     Origin: https://console.notifyer-systems.com automatically.
 *   - phone_number is typed as integer in Xano. Strip the + prefix before passing.
 *     If omitted, the endpoint returns logs for all phone numbers.
 *   - Xano returns the full unfiltered log array. Pagination is handled client-side
 *     by this script using --page and --per-page.
 *   - `filter` discriminates between logs created by automation (Make/Zapier/n8n/API)
 *     and logs from bulk broadcast sends.
 *   - Uses console auth mode (Authorization: Bearer <token>).
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL   required
 *   NOTIFYER_API_TOKEN      required (from login.js)
 */

import { loadConfig, requestJson } from "./lib/notifyer-api.js";
import { parseArgs, getFlag, getBooleanFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";

const VALID_FILTERS = ["", "automation", "broadcast"];
const CONSOLE_ORIGIN = "https://console.notifyer-systems.com";

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

function printSummary(logs, total, page, perPage, filter, phone) {
  const filterLabel = filter ? filter.toUpperCase() : "ALL";
  const phoneLabel = phone ? ` | Phone: ${phone}` : "";
  process.stderr.write(
    `\nMessage Logs — ${filterLabel}${phoneLabel} (${total} total, page ${page} of ${Math.ceil(total / perPage) || 1})\n`
  );
  process.stderr.write(`${"─".repeat(102)}\n`);
  process.stderr.write(
    `${"Phone".padEnd(16)} ${"Status".padEnd(12)} ${"Date".padEnd(20)} ${"Message".padEnd(50)}\n`
  );
  process.stderr.write(`${"─".repeat(102)}\n`);

  for (const log of logs) {
    const ph = String(log.phone_number ?? "").padEnd(16);
    const st = (log.status ?? "unknown").toUpperCase().padEnd(12);
    const dt = formatTimestamp(log.created_at).padEnd(20);
    const body = (log.body ?? "").replace(/\n/g, " ").slice(0, 49).padEnd(50);
    process.stderr.write(`${ph} ${st} ${dt} ${body}\n`);
  }
  process.stderr.write("\n");
}

async function main() {
  const flags = parseArgs();
  const pretty = getBooleanFlag(flags, "pretty");
  const phoneRaw = getFlag(flags, "phone") ?? "";
  const filter = getFlag(flags, "filter") ?? "";
  const pageRaw = getFlag(flags, "page") ?? "1";
  const perPageRaw = getFlag(flags, "per-page") ?? "20";

  if (!VALID_FILTERS.includes(filter)) {
    printJson(
      err(
        `--filter must be "automation", "broadcast", or omitted for all. Got: "${filter}"`
      )
    );
    return;
  }

  const page = parseInt(pageRaw, 10);
  const perPage = parseInt(perPageRaw, 10);
  if (isNaN(page) || page < 1) {
    printJson(err("--page must be a positive integer."));
    return;
  }
  if (isNaN(perPage) || perPage < 1) {
    printJson(err("--per-page must be a positive integer."));
    return;
  }

  // phone_number is typed as integer in Xano — strip +, parse as number
  let phoneNumber = null;
  if (phoneRaw) {
    const cleaned = phoneRaw.replace(/^\+/, "");
    const parsed = parseInt(cleaned, 10);
    if (isNaN(parsed)) {
      printJson(
        err(
          "--phone must be a numeric phone number without + prefix (e.g. 14155550123)."
        )
      );
      return;
    }
    phoneNumber = parsed;
  }

  const config = loadConfig({ requireToken: true });

  const query = { filter };
  if (phoneNumber !== null) query.phone_number = phoneNumber;

  const result = await requestJson(config, {
    method: "GET",
    path: "/api:ereqLKj6/log",
    query,
    extraHeaders: { Origin: CONSOLE_ORIGIN },
  });

  if (!result.ok) {
    printJson(err(result.error, result.data, false, result.status));
    return;
  }

  const allLogs = Array.isArray(result.data) ? result.data : [];
  const total = allLogs.length;

  const startIdx = (page - 1) * perPage;
  const pageLogs = allLogs.slice(startIdx, startIdx + perPage);

  if (pretty) printSummary(pageLogs, total, page, perPage, filter, phoneRaw || null);

  printJson(
    ok({
      logs: pageLogs,
      count: pageLogs.length,
      total,
      page,
      per_page: perPage,
      filter: filter || null,
      phone: phoneNumber,
    })
  );
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
