#!/usr/bin/env node
/**
 * delete-webhook.js — Permanently delete a webhook endpoint.
 *
 * DELETE /api:qh9OQ3OW/webhook/dev/{id}         (--type dev, default)
 * DELETE /api:qh9OQ3OW/user/io/webhook?id=<id>  (--type io, id is text/string)
 *
 * Usage:
 *   node scripts/delete-webhook.js --id 5 --confirm
 *   node scripts/delete-webhook.js --type io --id "abc123" --confirm
 *
 * Required Flags:
 *   --id <id>      Webhook ID to delete. Dev: integer. IO: string/text.
 *   --confirm      Safety gate — must be passed to execute deletion.
 *
 * Optional Flags:
 *   --type dev|io  Webhook type (default: dev)
 *   --pretty       Print summary to stderr
 *
 * Output (dev webhook success):
 *   { "ok": true, "data": { "deleted": true, "id": 5, "type": "dev" } }
 *
 *   NOTE: DELETE /webhook/dev/:id returns an empty body (no response keys in Xano).
 *   The script synthesizes the response so agents can confirm success.
 *
 * Output (IO webhook success):
 *   { "ok": true, "data": { "success": "true", "id": "abc123", "type": "io" } }
 *
 *   NOTE: Xano returns { "success": "true" } — success is a STRING "true", not
 *   a boolean. This is documented Xano behavior; the script passes it through
 *   and adds id and type fields for agent clarity.
 *
 * CRITICAL — Dev Webhook Security:
 *   DELETE /webhook/dev/:id is a PUBLIC ENDPOINT in Xano.
 *   Xano only runs /cors_origin_console (CORS check) — there is NO /get_user call.
 *   This script mitigates this at the script level with an ownership check:
 *     1. GET /webhook/dev (fully authenticated — runs /get_user) to list all
 *        webhooks belonging to the authenticated account.
 *     2. Confirm the requested ID appears in that list before deleting.
 *   This means an attacker with only a webhook ID but no valid token cannot
 *   use this script to delete a webhook they don't own.
 *   Note: the raw API endpoint remains public — this is a script-level defence.
 *
 * IO vs Dev difference:
 *   - IO DELETE is fully authenticated (Xano runs /get_user) — standard security.
 *   - IO id is TEXT type (not integer). Pass as a string.
 *   - IO CORS: not required.
 *   - IO response: { success: "true" } (as JSON body from Xano Return step).
 *
 * CORS:
 *   Dev webhook endpoints run /cors_origin_console. The script sends
 *   Origin: https://console.notifyer-systems.com automatically.
 *   IO webhook endpoints do NOT require a CORS header.
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

async function main() {
  const flags = parseArgs();
  const type = (getFlag(flags, "type") ?? "dev").toLowerCase();
  const pretty = getBooleanFlag(flags, "pretty");
  const idRaw = getFlag(flags, "id");
  const confirmed = getBooleanFlag(flags, "confirm");

  if (!VALID_TYPES.includes(type)) {
    printJson(err(`--type must be "dev" or "io". Got: "${type}"`));
    return;
  }

  if (!idRaw) {
    printJson(err("--id is required."));
    return;
  }

  if (!confirmed) {
    printJson(
      err(
        "Add --confirm to proceed. This action permanently deletes the webhook and cannot be undone."
      )
    );
    return;
  }

  const config = loadConfig({ requireToken: true });

  if (type === "dev") {
    const id = parseInt(idRaw, 10);
    if (isNaN(id)) {
      printJson(err("--id must be an integer for dev webhooks."));
      return;
    }

    // Ownership check: GET /webhook/dev is fully authenticated (runs /get_user).
    // Verify the requested ID belongs to this account before calling DELETE,
    // which has no server-side user auth check in Xano.
    const listResult = await requestJson(config, {
      method: "GET",
      path: "/api:qh9OQ3OW/webhook/dev",
      extraHeaders: { Origin: CONSOLE_ORIGIN },
    });

    if (!listResult.ok) {
      printJson(err(`Ownership check failed: could not list webhooks. ${listResult.error}`, listResult.data, false, listResult.status));
      return;
    }

    const webhooks = Array.isArray(listResult.data) ? listResult.data : (listResult.data?.webhooks ?? []);
    const owns = webhooks.some((w) => Number(w.id) === id);
    if (!owns) {
      printJson(err(
        `Dev webhook ID ${id} was not found in your account's webhook list. ` +
        "Deletion blocked — only webhooks belonging to the authenticated account can be deleted.",
        null,
        true
      ));
      return;
    }

    const result = await requestJson(config, {
      method: "DELETE",
      path: `/api:qh9OQ3OW/webhook/dev/${id}`,
      extraHeaders: { Origin: CONSOLE_ORIGIN },
    });

    // Xano returns empty body (no Response keys defined) → result.data may be null/{}
    // Treat HTTP 2xx as success regardless of body.
    if (!result.ok) {
      printJson(err(result.error, result.data, false, result.status));
      return;
    }

    if (pretty) {
      process.stderr.write(`\nDev webhook ${id} deleted.\n\n`);
    }

    printJson(ok({ deleted: true, id, type: "dev" }));
  } else {
    // IO webhook — id is TEXT type in Xano
    const id = idRaw;

    // IO PATCH sends id as query param or body? From Xano: input "id" is text.
    // The frontend sends PATCH /user/io/webhook with body { id, webhook, status }
    // For DELETE /user/io/webhook: Xano input is "id" (text).
    // Looking at Xano DELETE screenshot: inputs show "id" as text field.
    // The function sends id as a query parameter based on Xano pattern.
    const result = await requestJson(config, {
      method: "DELETE",
      path: `/api:qh9OQ3OW/user/io/webhook?id=${encodeURIComponent(id)}`,
    });

    if (!result.ok) {
      printJson(err(result.error, result.data, false, result.status));
      return;
    }

    // Xano explicitly returns { "success": "true" } (string, not boolean)
    // via Return step: json_decode('{"success":"true"}')
    if (pretty) {
      process.stderr.write(`\nIO webhook "${id}" deleted.\n\n`);
    }

    printJson(
      ok({
        ...(result.data ?? {}),
        id,
        type: "io",
      })
    );
  }
}

main().catch((e) => {
  printJson(err(`Unexpected error: ${e.message}`));
});
