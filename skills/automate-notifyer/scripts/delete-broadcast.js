#!/usr/bin/env node
/**
 * delete-broadcast.js — Delete (cancel) a broadcast.
 *
 * DELETE /api:6_ZYypAc/broadcast/{id}
 * Body: { broadcast_id: <integer> }
 *
 * Use this to cancel an UPCOMING broadcast that hasn't started sending yet.
 * Broadcasts that are already ONGOING or PREVIOUS (completed) cannot be
 * meaningfully cancelled — Xano may still accept the request but messages
 * already sent will not be recalled.
 *
 * Usage:
 *   node scripts/delete-broadcast.js --id 5 --confirm
 *   node scripts/delete-broadcast.js --id 5 --confirm --pretty
 *
 * Required Flags:
 *   --id <integer>   Broadcast ID (from list-broadcasts.js).
 *   --confirm        Required safety flag to prevent accidental deletion.
 *
 * Optional Flags:
 *   --pretty         Print confirmation to stderr.
 *
 * How to get the broadcast ID:
 *   node scripts/list-broadcasts.js --status upcoming --pretty
 *   → Look for the id field.
 *
 * Output (success):
 *   { "ok": true, "data": { "deleted": true, "broadcast_id": 5 } }
 *
 * Output (not found):
 *   { "ok": false, "error": "Broadcast with ID 5 not found or already completed." }
 *
 * WARNING: Only upcoming (scheduled, not yet started) broadcasts should be
 *   deleted via this script. For ongoing broadcasts, messages already dispatched
 *   cannot be recalled. Deleting an ongoing broadcast stops future batches but
 *   does not undo messages already sent.
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
    printJson(err(
      "--id is required. Provide the broadcast ID from list-broadcasts.js.\n" +
      "  Run: node scripts/list-broadcasts.js --status upcoming --pretty"
    ));
    return;
  }
  if (!confirm) {
    printJson(err(
      "--confirm is required. Broadcast deletion cannot be undone.\n" +
      "  Messages already sent will NOT be recalled.\n" +
      "  Add --confirm to proceed."
    ));
    return;
  }

  const config = loadConfig({ requireToken: true });

  const result = await requestJson(config, {
    method: "DELETE",
    path: `/api:6_ZYypAc/broadcast/${id}`,
    body: { broadcast_id: Number(id) },
  });

  if (!result.ok) {
    if (result.status === 404) {
      printJson(err(`Broadcast with ID ${id} not found or already completed.`, null, false));
    } else {
      printJson(err(result.error, result.data, false, result.status));
    }
    return;
  }

  if (pretty) {
    process.stderr.write(`\nBroadcast ID ${id} deleted.\n`);
    process.stderr.write(`  Note: Messages already sent (if any) were not recalled.\n\n`);
  }

  printJson(ok({ deleted: true, broadcast_id: Number(id) }));
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
