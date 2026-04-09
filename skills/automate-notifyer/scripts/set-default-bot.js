#!/usr/bin/env node
/**
 * set-default-bot.js — Set an AI bot as the workspace default.
 *
 * PATCH /api:Sc_sezER/ai_config/set-as-default/{id}
 *
 * The default bot is automatically assigned to new recipients when AI mode
 * is enabled for them (via set-handoff.js or assign-bot.js). Only one bot
 * can be the workspace default at a time; setting a new one unsets the previous.
 *
 * Usage:
 *   node scripts/set-default-bot.js --id 12
 *   node scripts/set-default-bot.js --id 12 --pretty
 *
 * Required Flags:
 *   --id <integer>   Bot ID to set as default (from list-bots.js).
 *
 * Optional Flags:
 *   --pretty         Print confirmation to stderr.
 *
 * Output (success):
 *   {
 *     "ok": true,
 *     "data": {
 *       "id": 12,
 *       "bot_name": "Support Bot",
 *       "default": true,
 *       ...
 *     }
 *   }
 *
 * Note: Only Super Admin or Admin roles can set the default bot.
 *   Team Members cannot change the workspace default.
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
  const pretty = getBooleanFlag(flags, "pretty");

  if (id === null || id === undefined) {
    printJson(err("--id is required. Provide the bot ID from list-bots.js."));
    return;
  }

  const config = loadConfig({ requireToken: true });

  const result = await requestJson(config, {
    method: "PATCH",
    path: `/api:Sc_sezER/ai_config/set-as-default/${id}`,
    body: { bot_config_id: Number(id) },
  });

  if (!result.ok) {
    if (result.status === 404) {
      printJson(err(`Bot with ID ${id} not found.`, null, false));
    } else {
      printJson(err(result.error, result.data, false, result.status));
    }
    return;
  }

  if (pretty) {
    const name = result.data?.bot_name ?? `Bot ${id}`;
    process.stderr.write(`\n"${name}" (ID ${id}) is now the workspace default bot.\n`);
    process.stderr.write(`  New recipients in AI mode will be assigned this bot automatically.\n\n`);
  }

  printJson(ok(result.data));
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
