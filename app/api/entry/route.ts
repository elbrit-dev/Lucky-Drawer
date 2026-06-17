import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { LuckyDrawEntry, StoredEntry } from "@/lib/types";
import { sendToErpnext } from "@/lib/erpnext";

// Candidate storage dirs, tried in order. The project dir works locally; on a
// read-only serverless host (e.g. Vercel) it falls back to the OS temp dir.
const STORE_DIRS = [
  path.join(process.cwd(), "data"),
  path.join(os.tmpdir(), "elbrit-lucky-draw"),
];
const FILE = "entries.json";

function isValid(b: Partial<LuckyDrawEntry>): b is LuckyDrawEntry {
  return (
    typeof b.name === "string" && b.name.trim().length > 1 &&
    // email is optional: accept blank, but reject a malformed address if provided
    typeof b.email === "string" && (b.email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email.trim())) &&
    typeof b.phone === "string" && b.phone.replace(/\D/g, "").length >= 10 &&
    typeof b.specialisation === "string" && b.specialisation.length > 0 &&
    typeof b.city === "string" && b.city.trim().length > 1 &&
    typeof b.clinic === "string" && b.clinic.trim().length > 1 &&
    typeof b.luckyNumber === "number" && b.luckyNumber >= 1 && b.luckyNumber <= 100
  );
}

async function readEntries(): Promise<StoredEntry[]> {
  for (const dir of STORE_DIRS) {
    try {
      const raw = await fs.readFile(path.join(dir, FILE), "utf-8");
      return JSON.parse(raw) as StoredEntry[];
    } catch {
      // try next dir
    }
  }
  return [];
}

async function persist(stored: StoredEntry): Promise<boolean> {
  for (const dir of STORE_DIRS) {
    try {
      await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, FILE);
      let entries: StoredEntry[] = [];
      try {
        entries = JSON.parse(await fs.readFile(file, "utf-8")) as StoredEntry[];
      } catch {
        entries = [];
      }
      entries.push(stored);
      await fs.writeFile(file, JSON.stringify(entries, null, 2), "utf-8");
      return true;
    } catch {
      // try next dir
    }
  }
  return false;
}

export async function POST(req: Request) {
  let body: Partial<LuckyDrawEntry>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 422 });
  }

  const stored: StoredEntry = {
    ...body,
    id: `LD-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    submittedAt: new Date().toISOString(),
  };

  const persisted = await persist(stored);

  // Always log the full entry so it is recoverable from the host's runtime logs
  // even when durable storage isn't configured (serverless temp dir is ephemeral).
  console.log("LUCKY_DRAW_ENTRY", JSON.stringify(stored));

  // Push into ERPNext (UAT) — the form_pro form's DocType. Non-blocking: a failed
  // ERP write is logged but never stops the user completing their entry.
  const erp = await sendToErpnext(stored);
  if (!erp.ok && !erp.skipped) {
    console.error("ERP_SUBMIT_FAILED", erp.detail);
  }

  return NextResponse.json({ ok: true, id: stored.id, persisted, erp: erp.ok });
}

export async function GET() {
  const entries = await readEntries();
  return NextResponse.json({ count: entries.length });
}
