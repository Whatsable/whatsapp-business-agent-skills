#!/usr/bin/env node
/**
 * send-template.js — Send a WhatsApp template message to a recipient.
 *
 * POST /api:bVXsw_FD/web/send/template
 *
 * Use this when:
 *   - The 24h messaging window is closed (expiration_timestamp null or past)
 *   - You want to initiate a new conversation
 *   - You want to send a scheduled marketing/transactional message
 *
 * Usage (by template name - recommended):
 *   node scripts/send-template.js --phone 14155550123 --name friendly_reminder
 *   node scripts/send-template.js --phone 14155550123 --name order_confirmation --variables '{"body1":"John","body2":"#12345"}'
 *
 * Usage (by template ID):
 *   node scripts/send-template.js --phone 14155550123 --template tmpl_abc123
 *
 * Usage (list templates):
 *   node scripts/send-template.js --list
 *
 * Usage (dry run):
 *   node scripts/send-template.js --phone 14155550123 --name promo --dry-run
 *
 * Required Flags:
 *   --phone <number>         Recipient phone number WITHOUT + prefix (integer).
 *   --name <template_name>   Template name (e.g. friendly_reminder) - easier than template ID.
 *                            OR
 *   --template <template_id> Notifyer template_id string (legacy support).
 *
 * Optional Flags:
 *   --list                   List all available templates and exit.
 *   --dry-run                Preview what would be sent without actually sending.
 *   --variables <json>       Template variable values as JSON object.
 *                            Keys: body1, body2, body3 (for {{1}}, {{2}}, {{3}} in body)
 *                                  m_1 (for image/video/document header media URL)
 *                                  visit_website (for button URL variable)
 *                            Example: '{"body1":"John","body2":"#12345"}'
 *   --schedule <time>        Schedule the message: "DD/MM/YYYY HH:mm"
 *                            When set, Xano adds to chat_schedule (no immediate send).
 *                            scheduled_time == 0 means immediate; non-zero means scheduled.
 *   --pretty                 Print summary to stderr.
 *
 * Output (success):
 *   { "ok": true, "data": { "success": true, "message_id": "...", ... } }
 *
 * Side effects on success:
 *   - If recipient doesn't exist, Xano auto-creates them (/recipient_create)
 *   - Logs to success_messaging_templates, conversation, log tables
 *   - Updates subscriber_packages (billing/usage tracking)
 *   - Fires /send_outgoing_message_by_webhook if webhooks are configured
 *
 * CORS: Xano runs /cors_origin_web_chat on this endpoint.
 *   Script sends Origin: https://chat.notifyer-systems.com automatically.
 *
 * Template lookup: Xano looks up the template from its template_request table
 *   using the template_id string. Get the template_id from:
 *   node ../automate-notifyer/scripts/list-templates.js --pretty
 *
 * Variables format: Xano reads variables from the payload and passes them to
 *   the template dynamic data builder. Supported variable keys:
 *   body1, body2, body3, m_1, visit_website, button_dynamic_url_value
 *
 * Scheduling: Xano checks scheduled_time != 0. Sending 0 = immediate send.
 *   The script sends 0 when --schedule is not provided.
 *
 * Auth: Authorization: <token> (raw JWT, no Bearer — chat auth mode).
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL    required
 *   NOTIFYER_API_TOKEN       required (from setup-notifyer/login.js)
 *   NOTIFYER_CHAT_ORIGIN     optional (default: https://chat.notifyer-systems.com)
 */

import { loadConfig, requestJson, AUTH_MODE_CHAT, AUTH_MODE_CONSOLE } from "./lib/notifyer-api.js";
import { parseArgs, getFlag, getBooleanFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";
import { validateScheduledSendResponse } from "./lib/schedule-response.js";

const CHAT_ORIGIN = process.env.NOTIFYER_CHAT_ORIGIN ?? "https://chat.notifyer-systems.com";

function parseDateDDMMYYYY(str) {
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, dd, mm, yyyy, hh, min] = match;
  const d = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00`);
  return isNaN(d.getTime()) ? null : d.getTime();
}

/**
 * Fetch all templates and return them.
 * Uses console auth mode (Bearer token).
 */
async function fetchTemplates(config) {
  const result = await requestJson(config, {
    method: "GET",
    path: "/api:AFRA_QCy/templates_web",
  });
  
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  
  const templates = result.data?.templates ?? result.data ?? [];
  return { ok: true, data: templates };
}

/**
 * Find template by name (case-insensitive).
 * Returns { ok: true, template: {...} } or { ok: false, error: "..." }
 */
async function findTemplateByName(config, templateName) {
  const result = await fetchTemplates(config);
  if (!result.ok) {
    return { ok: false, error: `Failed to fetch templates: ${result.error}` };
  }
  
  const templates = result.data;
  const match = templates.find(t => 
    t.name && t.name.toLowerCase() === templateName.toLowerCase()
  );
  
  if (!match) {
    return { 
      ok: false, 
      error: `Template "${templateName}" not found. Use --list to see available templates.` 
    };
  }
  
  return { ok: true, template: match };
}

/**
 * Print templates list in a user-friendly format.
 */
function printTemplatesList(templates) {
  if (templates.length === 0) {
    process.stderr.write("\nNo templates found.\n\n");
    return;
  }
  
  process.stderr.write(`\nAvailable Templates (${templates.length} total)\n`);
  process.stderr.write("─".repeat(80) + "\n");
  process.stderr.write(`${"Name".padEnd(35)} ${"Category".padEnd(12)} ${"Status".padEnd(12)} Lang\n`);
  process.stderr.write("─".repeat(80) + "\n");
  
  for (const t of templates) {
    const name = (t.name || "").slice(0, 34);
    const category = (t.category || "").slice(0, 11);
    const status = t.status === "APPROVED" ? "✓ APPROVED" : 
                   t.status === "PENDING" ? "⏳ PENDING" :
                   t.status === "REJECTED" ? "✗ REJECTED" : 
                   (t.status || "").slice(0, 11);
    const lang = t.language || "en";
    
    process.stderr.write(`${name.padEnd(35)} ${category.padEnd(12)} ${status.padEnd(12)} ${lang}\n`);
  }
  
  process.stderr.write("\n");
  process.stderr.write("Usage: node scripts/send-template.js --phone <number> --name <template_name>\n\n");
}

async function main() {
  const flags = parseArgs();
  const phoneRaw = getFlag(flags, "phone");
  const templateId = getFlag(flags, "template");
  const templateName = getFlag(flags, "name");
  const variablesRaw = getFlag(flags, "variables");
  const scheduleStr = getFlag(flags, "schedule");
  const pretty = getBooleanFlag(flags, "pretty");
  const listTemplates = getBooleanFlag(flags, "list");
  const dryRun = getBooleanFlag(flags, "dry-run");

  // Handle --list flag
  if (listTemplates) {
    const config = loadConfig({ requireToken: true });
    const result = await fetchTemplates(config);
    
    if (!result.ok) {
      printJson(err(result.error));
      return;
    }
    
    printTemplatesList(result.data);
    return;
  }

  // Validate required flags
  if (!phoneRaw) {
    printJson(err("--phone is required. Provide phone number without + prefix (e.g. 14155550123)."));
    return;
  }
  
  if (!templateId && !templateName) {
    printJson(err(
      "--name or --template is required.\n\n" +
      "Use --name for easier template selection (e.g. --name friendly_reminder)\n" +
      "Or use --list to see all available templates."
    ));
    return;
  }

  const phone = parseInt(phoneRaw.replace(/^\+/, ""), 10);
  if (isNaN(phone)) {
    printJson(err("--phone must be a valid integer phone number."));
    return;
  }

  let variables = {};
  if (variablesRaw) {
    try {
      variables = JSON.parse(variablesRaw);
    } catch {
      printJson(err("--variables must be valid JSON (e.g. '{\"body1\":\"John\"}')."));
      return;
    }
  }

  let scheduledTime = 0;
  if (scheduleStr) {
    const ms = parseDateDDMMYYYY(scheduleStr);
    if (!ms) {
      printJson(err(`Invalid --schedule format. Use "DD/MM/YYYY HH:mm" (e.g. "25/01/2025 14:00").`));
      return;
    }
    scheduledTime = ms;
  }

  // Resolve template name to ID if --name was provided
  let finalTemplateId = templateId;
  let resolvedTemplate = null;
  
  if (templateName && !templateId) {
    const config = loadConfig({ requireToken: true });
    const lookupResult = await findTemplateByName(config, templateName);
    
    if (!lookupResult.ok) {
      printJson(err(lookupResult.error));
      return;
    }
    
    resolvedTemplate = lookupResult.template;
    finalTemplateId = resolvedTemplate.template_id;
    
    if (pretty || dryRun) {
      process.stderr.write(`\n✓ Found template: ${resolvedTemplate.name}\n`);
      process.stderr.write(`  Template ID: ${finalTemplateId}\n`);
      process.stderr.write(`  Category: ${resolvedTemplate.category}\n`);
      process.stderr.write(`  Status: ${resolvedTemplate.status}\n`);
    }
    
    // Check if template is approved
    if (resolvedTemplate.status !== "APPROVED") {
      process.stderr.write(`\n⚠️  Warning: Template status is "${resolvedTemplate.status}" (not APPROVED).\n`);
      process.stderr.write(`   The message may fail to send.\n\n`);
    }
  }

  // Dry run mode - preview without sending
  if (dryRun) {
    process.stderr.write("\n" + "=".repeat(80) + "\n");
    process.stderr.write("DRY RUN MODE — No message will be sent\n");
    process.stderr.write("=".repeat(80) + "\n");
    process.stderr.write(`\nRecipient: +${phone}\n`);
    process.stderr.write(`Template ID: ${finalTemplateId}\n`);
    if (templateName) {
      process.stderr.write(`Template Name: ${templateName}\n`);
    }
    if (Object.keys(variables).length > 0) {
      process.stderr.write(`Variables:\n${JSON.stringify(variables, null, 2)}\n`);
    }
    if (scheduledTime) {
      process.stderr.write(`Scheduled: ${scheduleStr} (${new Date(scheduledTime).toISOString()})\n`);
    } else {
      process.stderr.write(`Timing: Immediate send\n`);
    }
    process.stderr.write("\n" + "=".repeat(80) + "\n");
    process.stderr.write("No message was sent. Remove --dry-run to send.\n");
    process.stderr.write("=".repeat(80) + "\n\n");
    return;
  }

  const config = loadConfig({ authMode: AUTH_MODE_CHAT, requireToken: true });

  // Xano reads the entire body as _self/payload via Get All Input.
  // current_recipient must be an object with phone_number (integer).
  // scheduled_time: 0 = immediate, non-zero = scheduled.
  const body = {
    template: finalTemplateId,
    variables,
    current_recipient: { phone_number: phone },
    scheduled_time: scheduledTime,
  };

  const result = await requestJson(config, {
    method: "POST",
    path: "/api:bVXsw_FD/web/send/template",
    body,
    extraHeaders: { Origin: CHAT_ORIGIN },
  });

  if (!result.ok) {
    let errorMsg = result.error;
    let helpText = "";
    
    // Add helpful hints based on error type
    if (typeof errorMsg === "string") {
      if (errorMsg.toLowerCase().includes("template")) {
        helpText = "\n\nHint: Use --name instead of --template for easier template selection, or run with --list to see available templates.";
      } else if (errorMsg.toLowerCase().includes("variable")) {
        helpText = "\n\nHint: Check that all required template variables are provided with --variables '{\"body1\":\"value\",...}'";
      } else if (errorMsg.toLowerCase().includes("24 hour") || errorMsg.toLowerCase().includes("window")) {
        helpText = "\n\nNote: Template messages can be sent outside the 24-hour window. This error may be due to other reasons.";
      }
    }
    
    printJson(err(errorMsg + helpText, result.data, false, result.status));
    return;
  }

  const d = result.data;

  // Check for business_logic failure (Xano returns HTTP 200 with success: false)
  if (d && d.success === false) {
    const msg = d.message
      || d.whatsapp_response_info?.error_user_msg
      || d.whatsapp_response_info?.error_data?.details
      || "Template message failed";
    
    let helpText = "";
    if (typeof msg === "string" && msg.toLowerCase().includes("parameter")) {
      helpText = "\n\nHint: Template may require variables. Use --variables to provide them.";
    }
    
    printJson(err(msg + helpText, d, false));
    return;
  }

  if (scheduledTime) {
    const schedCheck = validateScheduledSendResponse(d);
    if (!schedCheck.ok) {
      printJson(err(schedCheck.message, d, false));
      return;
    }
  }

  if (pretty) {
    if (scheduledTime) {
      process.stderr.write(`\n✓ Template message scheduled for ${scheduleStr}\n`);
    } else {
      process.stderr.write(`\n✓ Template message sent successfully!\n`);
    }
    process.stderr.write(`  To: +${phone}\n`);
    process.stderr.write(`  Template ID: ${finalTemplateId}\n`);
    if (templateName) {
      process.stderr.write(`  Template Name: ${templateName}\n`);
    }
    if (Object.keys(variables).length > 0) {
      process.stderr.write(`  Variables: ${JSON.stringify(variables)}\n`);
    }
    
    // Show message preview if available
    if (d.system_user) {
      process.stderr.write(`\n  Message preview:\n`);
      const preview = d.system_user.length > 200 ? d.system_user.slice(0, 200) + "..." : d.system_user;
      process.stderr.write(`  "${preview}"\n`);
    }
    
    // Show button information if present
    if (d.buttons && Array.isArray(d.buttons) && d.buttons.length > 0) {
      process.stderr.write(`\n  Buttons:\n`);
      d.buttons.forEach(btn => {
        const btnText = btn.text || btn.buttonText || btn.code || "(button)";
        const btnType = btn.type || "unknown";
        process.stderr.write(`    • ${btnText} (${btnType})\n`);
      });
    }
    
    process.stderr.write(`\n  Message ID: ${d.message_id || "N/A"}\n`);
    process.stderr.write(`  Status: ${d.status || "passed"}\n\n`);
  }

  printJson(ok(result.data));
}

main().catch((e) => { printJson(err(`Unexpected error: ${e.message}`)); });
