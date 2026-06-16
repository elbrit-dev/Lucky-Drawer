import { StoredEntry } from "./types";

/**
 * Pushes a lucky-draw entry into ERPNext (UAT) by creating a record in the
 * DocType backing your form_pro form.
 *
 * Connection is env-driven (set these in Netlify → Site settings → Environment
 * variables, or a local .env.local — never commit them):
 *   ERP_URL          e.g. https://uat.elbrit.org   (base URL, no trailing /api)
 *   ERP_API_KEY      ERPNext API key
 *   ERP_API_SECRET   ERPNext API secret
 *   ERP_DOCTYPE      the DocType your form_pro form writes to
 *                    (defaults to "Lucky Draw Entry")
 *
 * FIELD MAPPING: the keys below must match the fieldnames in your form_pro form
 * /DocType. Defaults follow Frappe's auto-generated fieldname convention
 * (label lower-cased, spaces → underscores). If your form uses different
 * fieldnames, just adjust the keys here.
 */
export async function sendToErpnext(
  entry: StoredEntry
): Promise<{ ok: boolean; skipped?: boolean; detail?: string }> {
  const url = process.env.ERP_URL;
  const key = process.env.ERP_API_KEY;
  const secret = process.env.ERP_API_SECRET;
  const doctype = process.env.ERP_DOCTYPE || "Lucky Draw Entry";

  if (!url || !key || !secret) {
    return { ok: false, skipped: true, detail: "ERP env not configured" };
  }

  const payload: Record<string, unknown> = {
    full_name: entry.name,
    email: entry.email,
    mobile_no: entry.phone,
    specialisation: entry.specialisation,
    city: entry.city,
    clinic_name: entry.clinic,
    lucky_number: entry.luckyNumber,
  };

  try {
    const res = await fetch(
      `${url.replace(/\/+$/, "")}/api/resource/${encodeURIComponent(doctype)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${key}:${secret}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, detail: `HTTP ${res.status}: ${text.slice(0, 400)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "fetch failed" };
  }
}
