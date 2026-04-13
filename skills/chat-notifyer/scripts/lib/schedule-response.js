/**
 * Validates Xano chat "scheduled send" responses.
 *
 * Some deployments return HTTP 200 with success: true but status "not_passed",
 * id: null, and no send_message_response — meaning nothing was queued. Scripts
 * must not treat that as a successful schedule.
 */

/**
 * @param {Record<string, unknown>|null|undefined} d  Parsed JSON body from send/* response
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateScheduledSendResponse(d) {
    if (!d || typeof d !== "object") {
      return { ok: false, message: "Empty or invalid API response for scheduled send." };
    }
  
    const sendMsg = d.send_message_response;
    if (sendMsg === "scheduled") {
      return { ok: true };
    }
    if (d.scheduled === true) {
      return { ok: true };
    }
    const id = d.id;
    if (typeof id === "number" && id > 0) {
      return { ok: true };
    }
    if (typeof id === "string" && /^\d+$/.test(id) && Number(id) > 0) {
      return { ok: true };
    }
  
    const status = d.status;
    if (status === "not_passed" || id == null) {
      return {
        ok: false,
        message:
          "Scheduled message was not queued: API returned no schedule id and send_message_response is not \"scheduled\". " +
          "Template scheduling is often broken on this stack; use an immediate send, automate-notifyer broadcast, or an external scheduler. " +
          `status=${String(status)} id=${String(id)} send_message_response=${String(sendMsg)}`,
      };
    }
  
    return { ok: true };
  }  