#!/usr/bin/env node
/**
 * set-handoff.js — Control AI bot vs. human agent for a recipient's conversation.
 *
 * Strategy (fetch-then-merge PATCH):
 *   1. GET /auth/me → user_id (uuid)
 *   2. GET /chatapp/recipient?phone_number=&user_id= → recipient row + id
 *   3. PATCH /web/recipient/:id with merged identity fields + is_ai_assistant
 *
 * The legacy PATCH /chatapp/recipient/handoff endpoint expects a boolean `handoff`
 * (not the strings "human"|"bot") and can be inconsistent; merging into
 * /web/recipient/:id avoids wiping phone/name when toggling AI mode.
 *
 * Handoff types in Notifyer:
 *   "bot"   → AI bot handles the conversation (is_ai_assistant = true)
 *   "human" → Human agent handles the conversation (is_ai_assistant = false)
 *
 * Usage:
 *   node scripts/set-handoff.js --phone 14155550123 --mode human
 *   node scripts/set-handoff.js --phone 14155550123 --mode bot
 *   node scripts/set-handoff.js --phone 14155550123 --mode human --pretty
 *
 * Required Flags:
 *   --phone <number>    Recipient phone number WITHOUT + prefix (integer).
 *   --mode <mode>       "human" or "bot".
 *
 * Optional Flags:
 *   --pretty            Print handoff summary to stderr.
 *
 * Output (success):
 *   { "ok": true, "data": { ...recipient from PATCH... } }
 *
 * Auth: Authorization: <token> (raw JWT, no Bearer — chat auth mode).
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL    required
 *   NOTIFYER_API_TOKEN       required (from setup-notifyer/login.js)
 *   NOTIFYER_CHAT_ORIGIN     optional (default: https://chat.notifyer-systems.com)
 */

import { loadConfig, requestJson, AUTH_MODE_CHAT } from "./lib/notifyer-api.js";
import { parseArgs, getFlag, getBooleanFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";

const CHAT_ORIGIN = process.env.NOTIFYER_CHAT_ORIGIN ?? "https://chat.notifyer-systems.com";

async function getUserId(config) {
  const result = await requestJson(config, {
    method: "GET",
    path: "/api:-4GSCDHb/auth/me",
  });
  if (!result.ok) return null;
  return result.data?.user_id ?? result.data?.id ?? null;
}

async function main() {
  const flags = parseArgs();
  const phoneRaw = getFlag(flags, "phone");
  const mode = getFlag(flags, "mode");
  const pretty = getBooleanFlag(flags, "pretty");

  if (!phoneRaw) {
    printJson(err("--phone is required. Provide phone number without + prefix (e.g. 14155550123)."));
    return;
  }
  if (!mode || !["human", "bot"].includes(mode)) {
    printJson(err('--mode is required. Must be "human" or "bot".'));
    return;
  }

  const phone = parseInt(phoneRaw.replace(/^\+/, ""), 10);
  if (isNaN(phone)) {
    printJson(err("--phone must be a valid integer phone number."));
    return;
  }

  const config = loadConfig({ authMode: AUTH_MODE_CHAT, requireToken: true });

  const userId = await getUserId(config);
  if (!userId) {
    printJson(err("Could not resolve user_id from auth token. Ensure NOTIFYER_API_TOKEN is valid."));
    return;
  }

  const getResult = await requestJson(config, {
    method: "GET",
    path: `/api:bVXsw_FD/chatapp/recipient?phone_number=${phone}&user_id=${userId}`,
  });

  if (!getResult.ok) {
    printJson(err(getResult.error, getResult.data, false, getResult.status));
    return;
  }

  const raw = Array.isArray(getResult.data) ? getResult.data[0] : getResult.data;
  if (!raw || (Array.isArray(getResult.data) && getResult.data.length === 0)) {
    printJson(err(`Recipient with phone ${phone} not found.`, null, false));
    return;
  }

  const wantBot = mode === "bot";
  const patchBody = {
    name: raw.name ?? "",
    phone_number: raw.phone_number,
    phone_number_string: raw.phone_number_string ?? String(raw.phone_number ?? phone),
    note: raw.note ?? "",
    global_label: Array.isArray(raw.global_label) ? raw.global_label : [],
    is_ai_assistant: wantBot,
  };

  if (patchBody.phone_number == null || patchBody.phone_number === "") {
    printJson(err("Recipient record is missing phone_number; cannot patch safely."));
    return;
  }

  if (pretty) {
    process.stderr.write(`\nSetting conversation handoff for +${phone} → ${mode.toUpperCase()}\n`);
    process.stderr.write(`  (is_ai_assistant → ${wantBot})\n`);
  }

  const result = await requestJson(config, {
    method: "PATCH",
    path: `/api:bVXsw_FD/web/recipient/${raw.id}`,
    body: patchBody,
    extraHeaders: { Origin: CHAT_ORIGIN },
  });

  if (!result.ok) {
    printJson(err(result.error, result.data, false, result.status));
    return;
  }

  const d = result.data;

  if (pretty) {
    process.stderr.write(`  is_ai_assistant: ${d?.is_ai_assistant ?? "unknown"}\n`);
    process.stderr.write(
      `  Mode: ${wantBot ? "AI Bot is handling conversation" : "Human agent is handling conversation"}\n\n`
    );
  }

  printJson(ok(d));
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
