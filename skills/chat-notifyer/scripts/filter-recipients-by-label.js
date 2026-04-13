#!/usr/bin/env node
/**
 * filter-recipients-by-label.js — List recipients filtered by one or more labels.
 *
 * GET /api:bVXsw_FD/web/recipient (with labels[] filter)
 *
 * Thin wrapper around list-recipients.js with --labels required.
 * Labels are the global_label names created in setup-notifyer (create-label.js).
 *
 * IMPORTANT: Label matching is CASE-SENSITIVE by default. If the API returns 0 results,
 * the script will automatically retry with case-insensitive client-side filtering.
 *
 * Usage:
 *   node scripts/filter-recipients-by-label.js --labels "Support"
 *   node scripts/filter-recipients-by-label.js --labels "Support,Billing"
 *   node scripts/filter-recipients-by-label.js --labels "VIP" --status unread
 *   node scripts/filter-recipients-by-label.js --labels "Support" --all --pretty
 *
 * Flags:
 *   --labels <csv>      Required. Label names to filter by, comma-separated.
 *                       Matching is case-sensitive; script falls back to case-insensitive if no exact matches.
 *   --status unread     Only return unread conversations.
 *   --page <n>          Page number, 1-based (default: 1).
 *   --per-page <n>      Results per page (default: 20).
 *   --all               Fetch all pages sequentially (up to 1000 recipients).
 *   --pretty            Print human-readable table to stderr.
 *
 * Output (success):
 *   {
 *     "ok": true,
 *     "data": {
 *       "labels": ["Support"],
 *       "recipients": [...],
 *       "count": 5,
 *       "page": 1,
 *       "has_more": false
 *     }
 *   }
 *
 * Note on role behaviour:
 *   - Team Members are automatically restricted to their assigned labels server-side.
 *     Filtering here is an additional client-side label selection on top of that.
 *   - Admin/Super Admin can filter any label across all recipients.
 *
 * CORS: Script sends Origin: https://chat.notifyer-systems.com automatically.
 *   Override with NOTIFYER_CHAT_ORIGIN env var.
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL    required
 *   NOTIFYER_API_TOKEN       required (from setup-notifyer/login.js)
 *   NOTIFYER_CHAT_ORIGIN     optional (default: https://chat.notifyer-systems.com)
 */

import { loadConfig, requestJson, AUTH_MODE_CHAT } from "./lib/notifyer-api.js";
import { parseArgs, getFlag, getBooleanFlag, getNumberFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";

const CHAT_ORIGIN = process.env.NOTIFYER_CHAT_ORIGIN ?? "https://chat.notifyer-systems.com";

async function fetchPage(config, params) {
  const parts = [];
  parts.push(`page_number=${params.page_number}`);
  parts.push(`per_page=${params.per_page}`);
  parts.push(`search=`);
  for (const l of params.labels) parts.push(`labels[]=${encodeURIComponent(l)}`);
  if (params.status) parts.push(`status=${encodeURIComponent(params.status)}`);
  else parts.push(`status=`);

  return requestJson(config, {
    method: "GET",
    path: `/api:bVXsw_FD/web/recipient?${parts.join("&")}`,
    extraHeaders: { Origin: CHAT_ORIGIN },
  });
}

/**
 * Client-side case-insensitive label filter fallback.
 * Used when the API returns 0 results with exact case match.
 */
function filterByCaseInsensitiveLabels(recipients, searchLabels, statusFilter = "") {
  const searchLower = searchLabels.map(l => l.toLowerCase());
  return recipients.filter(row => {
    const r = (row.recipient && typeof row.recipient === "object") ? row.recipient : row;
    
    // Check labels (case-insensitive)
    const recipientLabels = Array.isArray(r.global_label) 
      ? r.global_label 
      : (typeof r.global_label === "string" ? JSON.parse(r.global_label || "[]") : []);
    const recipientLower = recipientLabels.map(l => String(l).toLowerCase());
    const hasMatchingLabel = searchLower.some(label => recipientLower.includes(label));
    
    if (!hasMatchingLabel) return false;
    
    // Apply status filter if specified
    if (statusFilter === "unread") {
      return r.read_time == null || r.read_time === 0;
    }
    
    return true;
  });
}

async function main() {
  const flags = parseArgs();
  const labelsRaw = getFlag(flags, "labels");
  const status = getFlag(flags, "status") ?? "";
  const page = getNumberFlag(flags, "page") ?? 1;
  const perPage = getNumberFlag(flags, "per-page") ?? 20;
  const fetchAll = getBooleanFlag(flags, "all");
  const pretty = getBooleanFlag(flags, "pretty");

  if (!labelsRaw) {
    printJson(err("--labels is required. Provide comma-separated label names (e.g. --labels \"Support,Billing\")."));
    return;
  }

  const labels = labelsRaw.split(",").map((l) => l.trim()).filter(Boolean);
  if (labels.length === 0) {
    printJson(err("--labels must contain at least one non-empty label name."));
    return;
  }

  const config = loadConfig({ authMode: AUTH_MODE_CHAT, requireToken: true });

  if (fetchAll) {
    const allRecipients = [];
    let currentPage = 0;
    const MAX_PAGES = 50;

    while (currentPage < MAX_PAGES) {
      const result = await fetchPage(config, { page_number: currentPage, per_page: perPage, labels, status });
      if (!result.ok) {
        printJson(err(result.error, result.data, false, result.status));
        return;
      }
      const items = Array.isArray(result.data) ? result.data : [];
      allRecipients.push(...items);
      if (items.length < perPage) break;
      currentPage++;
    }

    // If no results with exact case match, try case-insensitive fallback
    let finalRecipients = allRecipients;
    let usedFallback = false;
    if (allRecipients.length === 0) {
      // Fetch all recipients without label filter and do client-side case-insensitive matching
      const allResult = await requestJson(config, {
        method: "GET",
        path: `/api:bVXsw_FD/web/recipient?page_number=0&per_page=100&search=&labels=[]&status=`,
        extraHeaders: { Origin: CHAT_ORIGIN },
      });
      if (allResult.ok) {
        const allItems = Array.isArray(allResult.data) ? allResult.data : [];
        finalRecipients = filterByCaseInsensitiveLabels(allItems, labels, status);
        usedFallback = finalRecipients.length > 0;
      }
    }

    if (pretty) {
      if (usedFallback) {
        process.stderr.write(`\n⚠ No exact case match for [${labels.join(", ")}]. Using case-insensitive fallback.\n`);
      }
      if (finalRecipients.length === 0) {
        process.stderr.write(`\n⚠ No recipients found with label(s) [${labels.join(", ")}].\n`);
        process.stderr.write(`   Label matching is case-sensitive. Check that labels exist with: node scripts/list-labels.js\n\n`);
      } else {
        process.stderr.write(`\nRecipients with label(s) [${labels.join(", ")}]: ${finalRecipients.length} total\n\n`);
      }
    }
    printJson(ok({ labels, recipients: finalRecipients, count: finalRecipients.length, page: "all", has_more: false, used_case_insensitive_fallback: usedFallback }));
  } else {
    const result = await fetchPage(config, { page_number: page - 1, per_page: perPage, labels, status });

    if (!result.ok) {
      printJson(err(result.error, result.data, false, result.status));
      return;
    }

    let items = Array.isArray(result.data) ? result.data : [];
    let usedFallback = false;

    // If no results with exact case match, try case-insensitive fallback
    if (items.length === 0) {
      const allResult = await requestJson(config, {
        method: "GET",
        path: `/api:bVXsw_FD/web/recipient?page_number=${page - 1}&per_page=${perPage}&search=&labels=[]&status=`,
        extraHeaders: { Origin: CHAT_ORIGIN },
      });
      if (allResult.ok) {
        const allItems = Array.isArray(allResult.data) ? allResult.data : [];
        items = filterByCaseInsensitiveLabels(allItems, labels, status);
        usedFallback = items.length > 0;
      }
    }

    if (pretty) {
      if (usedFallback) {
        process.stderr.write(`\n⚠ No exact case match for [${labels.join(", ")}]. Using case-insensitive fallback.\n`);
      }
      if (items.length === 0) {
        process.stderr.write(`\n⚠ No recipients found with label(s) [${labels.join(", ")}] on page ${page}.\n`);
        process.stderr.write(`   Label matching is case-sensitive. Check that labels exist with: node scripts/list-labels.js\n\n`);
      } else {
        process.stderr.write(`\nRecipients with label(s) [${labels.join(", ")}]: ${items.length} on page ${page}\n\n`);
        for (const row of items) {
          const r = (row.recipient && typeof row.recipient === "object") ? row.recipient : row;
          const recipientLabels = Array.isArray(r.global_label) ? r.global_label : [];
          process.stderr.write(`  [${r.id}] ${r.name ?? "Unknown"} — ${r.phone_number_string ?? r.phone_number} — ${recipientLabels.join(",")}\n`);
        }
        process.stderr.write("\n");
      }
    }

    printJson(ok({ labels, recipients: items, count: items.length, page, has_more: items.length === perPage, used_case_insensitive_fallback: usedFallback }));
  }
}

main().catch((e) => { printJson(err(`Unexpected error: ${e.message}`)); });
