#!/usr/bin/env node
/**
 * delete-bot.js — Delete an AI bot from the Notifyer workspace.
 *
 * DELETE /api:Sc_sezER/ai_config/{id}
 *
 * IMPORTANT — This is PERMANENT and has TWO side effects:
 *   1. Deletes the bot_config record from Notifyer.
 *   2. Deletes the corresponding OpenAI Assistant from your OpenAI account.
 *      This cannot be undone — any conversation history associated with
 *      the OpenAI assistant is lost.
 *
 * Before deleting:
 *   - If any recipients are assigned to this bot (ai_bot_id = this ID),
 *     they will lose their bot assignment. Reassign them first via assign-bot.js.
 *   - If this is the workspace default bot, assign a new default first
 *     via set-default-bot.js.
 *
 * Usage:
 *   node scripts/delete-bot.js --id 12 --confirm
 *   node scripts/delete-bot.js --id 12 --confirm --pretty
 *
 * Required Flags:
 *   --id <integer>   Bot ID (from list-bots.js).
 *   --confirm        Required safety flag to prevent accidental deletion.
 *
 * Optional Flags:
 *   --pretty         Print deletion confirmation to stderr.
 *
 * Output (success):
 *   { "ok": true, "data": { "deleted": true, "id": 12 } }
 *
 * Output (not found):
 *   { "ok": false, "error": "Bot with ID 12 not found or already deleted." }
 *
 * Auth: Authorization: Bearer <token> (console auth mode).
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL   required
 *   NOTIFYER_API_TOKEN      required (from login.js, must be Super Admin or Admin)
 */

import { loadConfig, requestJson } from "./lib/notifyer-api.js";
import { parseArgs, getBooleanFlag, getNumberFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";

async function main() {
  const flags = parseArgs();

  const id = getNumberFlag(flags, "id");
  const confirm = getBooleanFlag(flags, "confirm");
  const pretty = getBooleanFlag(flags, "pretty");

  if (id === null || id === undefined) {
    printJson(err("--id is required. Provide the bot ID from list-bots.js."));
    return;
  }
  if (!confirm) {
    printJson(err(
      "--confirm is required. Bot deletion is permanent:\n" +
      "  - Deletes the bot from Notifyer.\n" +
      "  - Deletes the OpenAI Assistant from your OpenAI account.\n" +
      "  Add --confirm to proceed."
    ));
    return;
  }

  const config = loadConfig({ requireToken: true });

  const result = await requestJson(config, {
    method: "DELETE",
    path: `/api:Sc_sezER/ai_config/${id}`,
  });

  if (!result.ok) {
    if (result.status === 404) {
      printJson(err(`Bot with ID ${id} not found or already deleted.`, null, false));
    } else {
      printJson(err(result.error, result.data, false, result.status));
    }
    return;
  }

  if (pretty) {
    process.stderr.write(`\nBot ID ${id} deleted successfully.\n`);
    process.stderr.write(`  The associated OpenAI Assistant has also been removed.\n\n`);
  }

  printJson(ok({ deleted: true, id: Number(id) }));
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
