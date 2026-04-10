#!/usr/bin/env node
/**
 * send-attachment.js — Upload a file and send it as a WhatsApp media message.
 *
 * Step 1: POST /api:bVXsw_FD/upload_file_by_attachment  (multipart/form-data, field "file")
 *         (Legacy /api:ox_LN9zX/upload_file_by_attachment may 404 on some deployments.)
 * Step 2: POST /api:bVXsw_FD/web/send/<type>            (JSON)
 *           where <type> is: image | video | audio | document
 *
 * The send endpoint is chosen from the file's MIME type:
 *   image     .jpg, .jpeg, .png, .gif, .webp   → /web/send/image   (max 5 MB)
 *   video     .mp4                              → /web/send/video   (max 16 MB)
 *   audio     .aac, .mp3, .ogg, .amr, .opus    → /web/send/audio   (max 16 MB)
 *   document  .pdf, .docx, .xlsx, .txt, etc.   → /web/send/document (max 100 MB)
 *
 * Steps performed by this script:
 *   1. Fetch the full recipient object (needed for currentRecipient field)
 *   2. Upload the file to Xano storage
 *   3. POST to the appropriate /web/send/<type> endpoint
 *
 * Usage:
 *   node scripts/send-attachment.js --phone 14155550123 --file /path/to/invoice.pdf
 *   node scripts/send-attachment.js --phone 14155550123 --file /path/to/photo.jpg
 *   node scripts/send-attachment.js --phone 14155550123 --file /path/to/video.mp4 --caption "Watch this!"
 *   node scripts/send-attachment.js --phone 14155550123 --file /path/to/photo.jpg --schedule "25/01/2025 14:00"
 *
 * Required Flags:
 *   --phone <number>    Recipient phone number WITHOUT + prefix (integer).
 *   --file <path>       Absolute or relative path to the file to upload.
 *
 * Optional Flags:
 *   --caption <text>    Optional caption for image/video messages.
 *   --schedule <time>   Schedule the message: "DD/MM/YYYY HH:mm"
 *                       When set, Xano saves to chat_schedule (no immediate send).
 *   --pretty            Print upload and send summary to stderr.
 *
 * Send Payload (Step 3) built by this script:
 *   {
 *     media_link, mime_type, caption,
 *     type + document|image|video|audio  ← Meta shape, e.g. type "document" + document: { link, filename, caption }
 *     currentRecipient, scheduled_time
 *   }
 *
 * Side effects on success:
 *   - Logs to chat_log, conversation tables
 *   - Fires /send_outgoing_message_by_webhook if webhooks configured
 *
 * CRITICAL — 24h Window Rule:
 *   Media attachments can only be sent within 24h of recipient's last message.
 *   For outside the window, use send-template.js with a media template.
 *   Check the window with: node scripts/get-recipient.js --phone <number>
 *
 * Auth: Authorization: <token> (raw JWT, no Bearer — chat auth mode).
 *
 * Environment:
 *   NOTIFYER_API_BASE_URL    required
 *   NOTIFYER_API_TOKEN       required (from setup-notifyer/login.js)
 *   NOTIFYER_CHAT_ORIGIN     optional (default: https://chat.notifyer-systems.com)
 */

import { readFileSync } from "fs";
import { basename, extname } from "path";
import { loadConfig, requestJson, AUTH_MODE_CHAT } from "./lib/notifyer-api.js";
import { parseArgs, getFlag, getBooleanFlag } from "./lib/args.js";
import { ok, err, printJson } from "./lib/result.js";

const CHAT_ORIGIN = process.env.NOTIFYER_CHAT_ORIGIN ?? "https://chat.notifyer-systems.com";

const MIME_MAP = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".aac": "audio/aac", ".mp3": "audio/mpeg", ".ogg": "audio/ogg",
  ".amr": "audio/amr", ".opus": "audio/opus",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
};

function mimeToEndpoint(mimeType) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

/**
 * Meta Cloud API requires lowercase `type` plus a sibling object, e.g.
 * `{ type: "document", document: { link, filename } }` — not `type: "application/pdf"`.
 */
function buildWhatsAppMediaPayload(endpointType, mediaLink, filePath, caption) {
  const cap = caption ?? "";
  switch (endpointType) {
    case "image":
      return {
        type: "image",
        image: { link: mediaLink, ...(cap ? { caption: cap } : {}) },
      };
    case "video":
      return {
        type: "video",
        video: { link: mediaLink, ...(cap ? { caption: cap } : {}) },
      };
    case "audio":
      return { type: "audio", audio: { link: mediaLink } };
    default:
      return {
        type: "document",
        document: {
          link: mediaLink,
          filename: basename(filePath),
          caption: cap,
        },
      };
  }
}

function parseDateDDMMYYYY(str) {
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, dd, mm, yyyy, hh, min] = match;
  const d = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00`);
  return isNaN(d.getTime()) ? null : d.getTime();
}

async function getUserId(config) {
  const result = await requestJson(config, {
    method: "GET",
    path: "/api:-4GSCDHb/auth/me",
  });
  if (!result.ok) return null;
  return result.data?.user_id ?? result.data?.id ?? null;
}

async function findRecipient(config, phone) {
  const result = await requestJson(config, {
    method: "GET",
    path: `/api:bVXsw_FD/web/recipient?page_number=0&per_page=20&search=${encodeURIComponent(String(phone))}&labels=[]&status=`,
    extraHeaders: { Origin: CHAT_ORIGIN },
  });
  if (!result.ok) return result;
  const items = Array.isArray(result.data) ? result.data : [];
  const match = items.find((row) => {
    const r = row.recipient ?? row;
    return String(r.phone_number) === String(phone) ||
      String(r.phone_number_string ?? "").replace(/\D/g, "") === String(phone).replace(/\D/g, "");
  });
  if (match) return { ok: true, data: match.recipient ?? match };

  const userId = await getUserId(config);
  if (!userId) {
    return { ok: false, error: `Recipient with phone ${phone} not found (web search empty; could not resolve user for chatapp lookup).` };
  }
  const chatResult = await requestJson(config, {
    method: "GET",
    path: `/api:bVXsw_FD/chatapp/recipient?phone_number=${encodeURIComponent(String(phone))}&user_id=${userId}`,
  });
  if (!chatResult.ok) return { ok: false, error: `Recipient with phone ${phone} not found. They must have messaged you first.` };
  const raw = Array.isArray(chatResult.data) ? chatResult.data[0] : chatResult.data;
  if (!raw || (Array.isArray(chatResult.data) && chatResult.data.length === 0)) {
    return { ok: false, error: `Recipient with phone ${phone} not found. They must have messaged you first.` };
  }
  return { ok: true, data: raw };
}

async function uploadFile(filePath, mimeType) {
  const baseUrl = process.env.NOTIFYER_API_BASE_URL?.replace(/\/$/, "");
  const token = process.env.NOTIFYER_API_TOKEN;
  const fileName = basename(filePath);
  const fileBuffer = readFileSync(filePath);

  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: mimeType });
  formData.append("file", blob, fileName);

  const response = await fetch(`${baseUrl}/api:bVXsw_FD/upload_file_by_attachment`, {
    method: "POST",
    headers: { Authorization: token, Origin: CHAT_ORIGIN },
    body: formData,
  });

  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!response.ok) {
    return { ok: false, error: `Upload failed (HTTP ${response.status})`, data };
  }
  if (data && data.success === false) {
    return { ok: false, error: data.message || "Upload rejected by API", data };
  }
  return { ok: true, data };
}

async function sendMedia(config, endpointType, body) {
  const baseUrl = process.env.NOTIFYER_API_BASE_URL?.replace(/\/$/, "");
  const token = process.env.NOTIFYER_API_TOKEN;

  const response = await fetch(`${baseUrl}/api:bVXsw_FD/web/send/${endpointType}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      Origin: CHAT_ORIGIN,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!response.ok) {
    return { ok: false, error: `Send failed (HTTP ${response.status})`, data };
  }
  return { ok: true, data };
}

async function main() {
  const flags = parseArgs();
  const phoneRaw = getFlag(flags, "phone");
  const filePath = getFlag(flags, "file");
  const caption = getFlag(flags, "caption") ?? "";
  const scheduleStr = getFlag(flags, "schedule");
  const pretty = getBooleanFlag(flags, "pretty");

  if (!phoneRaw) {
    printJson(err("--phone is required. Provide phone number without + prefix (e.g. 14155550123)."));
    return;
  }
  if (!filePath) {
    printJson(err("--file is required. Provide the path to the file to upload."));
    return;
  }

  const phone = parseInt(phoneRaw.replace(/^\+/, ""), 10);
  if (isNaN(phone)) {
    printJson(err("--phone must be a valid integer phone number."));
    return;
  }

  try { readFileSync(filePath); } catch {
    printJson(err(`File not found or unreadable: ${filePath}`));
    return;
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

  const ext = extname(filePath).toLowerCase();
  const mimeType = MIME_MAP[ext];
  if (!mimeType) {
    printJson(err(
      `Unsupported file type: "${ext}". Allowed extensions: ${Object.keys(MIME_MAP).join(", ")}.\n` +
      "  Only explicitly supported media types can be sent to prevent accidental data exposure."
    ));
    return;
  }
  const endpointType = mimeToEndpoint(mimeType);

  const config = loadConfig({ authMode: AUTH_MODE_CHAT, requireToken: true });

  if (pretty) process.stderr.write(`\nFetching recipient record for +${phone}...\n`);
  const recipientResult = await findRecipient(config, String(phone));
  if (!recipientResult.ok) {
    printJson(err(recipientResult.error));
    return;
  }
  const currentRecipient = recipientResult.data;

  if (pretty) process.stderr.write(`Uploading ${basename(filePath)} (${mimeType})...\n`);
  const uploadResult = await uploadFile(filePath, mimeType);
  if (!uploadResult.ok) {
    printJson(err(uploadResult.error, uploadResult.data));
    return;
  }

  const mediaLink =
    uploadResult.data?.file_url ??
    uploadResult.data?.url ??
    (typeof uploadResult.data === "string" ? uploadResult.data : null);
  if (!mediaLink || typeof mediaLink !== "string") {
    printJson(err("Upload succeeded but no file URL in response.", uploadResult.data));
    return;
  }

  if (pretty) {
    process.stderr.write(`  Uploaded URL: ${mediaLink}\n`);
    process.stderr.write(`  Sending via /web/send/${endpointType}...\n`);
  }

  const waPayload = buildWhatsAppMediaPayload(endpointType, mediaLink, filePath, caption);
  const sendBody = {
    media_link: mediaLink,
    mime_type: mimeType,
    caption,
    currentRecipient,
    scheduled_time: scheduledTime,
    ...waPayload,
  };

  const sendResult = await sendMedia(config, endpointType, sendBody);
  if (!sendResult.ok) {
    printJson(err(sendResult.error, sendResult.data));
    return;
  }

  const d = sendResult.data;
  if (d?.success === false) {
    printJson(err(d.message || "Media send failed (API returned success: false)", d, false));
    return;
  }

  if (pretty) {
    process.stderr.write(scheduledTime
      ? `\nMedia scheduled for ${scheduleStr}\n`
      : `\nMedia sent!\n`);
    process.stderr.write(`  To: +${phone}\n`);
    process.stderr.write(`  File: ${basename(filePath)} (${endpointType})\n`);
    if (caption) process.stderr.write(`  Caption: "${caption}"\n`);
    process.stderr.write("\n");
  }

  printJson(ok({ media_link: mediaLink, mime_type: mimeType, media_type: endpointType, send_result: d }));
}

main().catch((e) => { printJson(err(`Unexpected error: ${e.message}`)); });