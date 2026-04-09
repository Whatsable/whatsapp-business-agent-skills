#!/usr/bin/env node
/**
 * update-bot.js — Update an existing AI bot configuration.
 *
 * PATCH /api:Sc_sezER/ai_config/{id}
 *
 * Updates only the fields you provide. All flags are optional (pass only
 * the fields you want to change). Unchanged fields remain as-is on the server.
 *
 * IMPORTANT — OpenAI Sync:
 *   Xano re-syncs the underlying OpenAI Assistant on every update.
 *   If your workspace OpenAI key is invalid or revoked, the update will
 *   fail even if only non-AI fields (like tone or delay) are changed.
 *
 * Usage:
 *   node scripts/update-bot.js --id 12 --name "New Bot Name"
 *   node scripts/update-bot.js --id 12 --tone "Professional" --delay 5
 *   node scripts/update-bot.js --id 12 --knowledge-base "Updated FAQ content here."
 *   node scripts/update-bot.js --id 12 --notification --pretty
 *
 * Required Flags:
 *   --id <integer>              Bot ID (from list-bots.js).
 *
 * Optional Flags (provide at least one):
 *   --name <text>               New bot name.
 *   --mission <text>            Updated mission/purpose.
 *   --knowledge-base <text>     Updated knowledge base (plain text).
 *   --system-prompt <text>      Updated system-level instructions.
 *   --tone <text>               Updated tone: "Friendly" | "Professional" | "Casual".
 *   --delay <integer>           Seconds to wait before sending each reply.
 *   --handoff-instruction <text>  Updated human handoff message.
 *   --trigger-keywords <csv>    Comma-separated keywords for handoff trigger.
 *   --notification              Enable human-handoff notification alerts.
 *   --no-notification           Disable human-handoff notification alerts.
 *   --pretty                    Print update summary to stderr.
 *
 * Output (success):
 *   {
 *     "ok": true,
 *     "data": {
 *       "id": 12,
 *       "bot_name": "New Bot Name",
 *       "mission": "...",
 *       ...
 *     }
 *   }
 *
 * Note: To set a bot as default, use set-default-bot.js instead of this script.
 *   To upload file-based knowledge, use the Notifyer console (not supported here).
 *
 * Auth: Authorization: Bearer <token> (console auth mode).
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL   required
 *   NOTIFYER_API_TOKEN      required (from login.js, must be Super Admin or Admin)
 */

import { loadConfig, requestJson } from "./lib/notifyer-api.js";
import { parseArgs, getFlag, getBooleanFlag, getNumberFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";

async function main() {
  const flags = parseArgs();

  const id = getNumberFlag(flags, "id");
  if (id === null || id === undefined) {
    printJson(err("--id is required. Provide the bot ID from list-bots.js."));
    return;
  }

  const name = getFlag(flags, "name");
  const mission = getFlag(flags, "mission");
  const knowledgeBase = getFlag(flags, "knowledge-base");
  const systemPrompt = getFlag(flags, "system-prompt");
  const tone = getFlag(flags, "tone");
  const handoffInstruction = getFlag(flags, "handoff-instruction");
  const triggerKeywordsRaw = getFlag(flags, "trigger-keywords");
  const pretty = getBooleanFlag(flags, "pretty");

  const delayRaw = getFlag(flags, "delay");
  let delay;
  if (delayRaw !== undefined && delayRaw !== null) {
    delay = parseInt(delayRaw, 10);
    if (isNaN(delay) || delay < 0) {
      printJson(err(`--delay must be a non-negative integer, got: ${delayRaw}`));
      return;
    }
  }

  let notification;
  if (flags["notification"] !== undefined) notification = true;
  if (flags["no-notification"] !== undefined) notification = false;

  const payload = {};
  if (name !== undefined && name !== null) payload.bot_name = name.trim();
  if (mission !== undefined && mission !== null) payload.mission = mission;
  if (knowledgeBase !== undefined && knowledgeBase !== null) payload.knowledge_base = knowledgeBase;
  if (systemPrompt !== undefined && systemPrompt !== null) payload.system_prompt = systemPrompt;
  if (tone !== undefined && tone !== null) payload.tone = tone;
  if (delay !== undefined) payload.delay = delay;
  if (handoffInstruction !== undefined && handoffInstruction !== null) payload.handoff_instruction = handoffInstruction;
  if (notification !== undefined) payload.notification = notification;
  if (triggerKeywordsRaw !== undefined && triggerKeywordsRaw !== null) {
    payload.human_trigger_keywords = triggerKeywordsRaw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }

  if (Object.keys(payload).length === 0) {
    printJson(err("At least one update flag is required (e.g. --name, --tone, --delay, --knowledge-base)."));
    return;
  }

  const config = loadConfig({ requireToken: true });

  const result = await requestJson(config, {
    method: "PATCH",
    path: `/api:Sc_sezER/ai_config/${id}`,
    body: payload,
  });

  if (!result.ok) {
    printJson(err(result.error, result.data, false, result.status));
    return;
  }

  if (pretty) {
    process.stderr.write(`\nBot ID ${id} updated successfully.\n`);
    process.stderr.write(`  Updated fields: ${Object.keys(payload).join(", ")}\n\n`);
  }

  printJson(ok(result.data));
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
