#!/usr/bin/env node
/**
 * delete-template.js — Delete a WhatsApp message template from Notifyer.
 *
 * DELETE /api:AFRA_QCy/templates/delete
 * Body: { whatsapp_template_id: <integer> }
 *
 * IMPORTANT — This is PERMANENT and IRREVERSIBLE:
 *   - Deletes the template record from Notifyer's database.
 *   - Submits a deletion request to the Meta WhatsApp API.
 *   - Meta propagates the deletion; the template name cannot be reused
 *     for 30 days per Meta's policy.
 *   - Approved templates count against your workspace quota; deletion
 *     frees up one slot.
 *
 * Usage:
 *   node scripts/delete-template.js --id 1234567890 --confirm
 *   node scripts/delete-template.js --id 1234567890 --confirm --pretty
 *
 * Required Flags:
 *   --id <integer>   The whatsapp_template_id (integer) from list-templates.js.
 *                    NOT the template name — use the whatsapp_template_id field.
 *   --confirm        Required safety flag to prevent accidental deletion.
 *
 * Optional Flags:
 *   --pretty         Print deletion confirmation to stderr.
 *
 * How to get the whatsapp_template_id:
 *   node scripts/list-templates.js --pretty
 *   → Look for the whatsapp_template_id field (numeric, e.g. 987654321).
 *     Do NOT use the template_id string (e.g. "tmpl_...").
 *
 * Output (success):
 *   { "ok": true, "data": { "deleted": true, "whatsapp_template_id": 1234567890 } }
 *
 * Output (not found):
 *   { "ok": false, "error": "Template with whatsapp_template_id 123 not found or already deleted." }
 *
 * Output (in-use / Meta rejected):
 *   { "ok": false, "error": "...", "blocked": true, "data": { ... } }
 *
 * Note: Broadcasted templates cannot be deleted while a broadcast is ongoing.
 *   Wait for the broadcast to complete before deleting the template.
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
  const confirm = getBooleanFlag(flags, "confirm");
  const pretty = getBooleanFlag(flags, "pretty");

  if (id === null || id === undefined) {
    printJson(err(
      "--id is required. Provide the whatsapp_template_id (integer) from list-templates.js.\n" +
      "  Run: node scripts/list-templates.js --pretty"
    ));
    return;
  }
  if (!confirm) {
    printJson(err(
      "--confirm is required. Template deletion is permanent and cannot be undone.\n" +
      "  Meta will prevent reuse of the template name for 30 days.\n" +
      "  Add --confirm to proceed."
    ));
    return;
  }

  const config = loadConfig({ requireToken: true });

  const result = await requestJson(config, {
    method: "DELETE",
    path: "/api:AFRA_QCy/templates/delete",
    body: { whatsapp_template_id: Number(id) },
  });

  if (!result.ok) {
    if (result.status === 404) {
      printJson(err(
        `Template with whatsapp_template_id ${id} not found or already deleted.`,
        null,
        false
      ));
    } else {
      printJson(err(result.error, result.data, true, result.status));
    }
    return;
  }

  if (pretty) {
    process.stderr.write(`\nTemplate ${id} deleted successfully.\n`);
    process.stderr.write(`  Note: Meta blocks reuse of this template name for 30 days.\n\n`);
  }

  printJson(ok({ deleted: true, whatsapp_template_id: Number(id) }));
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
