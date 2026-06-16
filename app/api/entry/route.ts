import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { LuckyDrawEntry, StoredEntry } from "@/lib/types";

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
    typeof b.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) &&
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

  // ───────────────────────────────────────────────────────────────
  // ERP HOOK — wire this up for durable storage. Example for ERPNext (Lead):
  //
  //   await fetch(`${process.env.ERP_URL}/api/resource/Lead`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
  //     },
  //     body: JSON.stringify({
  //       lead_name: stored.name,
  //       email_id: stored.email,
  //       mobile_no: stored.phone,
  //       company_name: stored.clinic,
  //       city: stored.city,
  //       custom_specialisation: stored.specialisation,
  //       custom_lucky_number: stored.luckyNumber,
  //       source: "Lucky Draw",
  //     }),
  //   });
  // ───────────────────────────────────────────────────────────────

  // Entry never blocks on storage — validation passed, so the user is in the draw.
  return NextResponse.json({ ok: true, id: stored.id, persisted });
}

export async function GET() {
  const entries = await readEntries();
  return NextResponse.json({ count: entries.length });
}
