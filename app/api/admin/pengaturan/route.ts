import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";

const SETTINGS_SLUG = "church-settings-v1";

// GET: fetch current church settings
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await db
      .select()
      .from(contents)
      .where(eq(contents.slug, SETTINGS_SLUG))
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json({ settings: null });
    }

    try {
      const settings = JSON.parse(record[0].body ?? "{}");
      return NextResponse.json({ settings });
    } catch {
      return NextResponse.json({ settings: null });
    }
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: save/update church settings
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const content = JSON.stringify(body);
    const now = new Date();

    // Check if record exists
    const existing = await db
      .select({ id: contents.id })
      .from(contents)
      .where(eq(contents.slug, SETTINGS_SLUG))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(contents)
        .set({ body: content, updatedAt: now })
        .where(eq(contents.slug, SETTINGS_SLUG));
    } else {
      await db.insert(contents).values({
        id: nanoid(),
        title: "Church Settings",
        slug: SETTINGS_SLUG,
        type: "SETTINGS",
        body: content,
        createdBy: session.user.id,
        isPublished: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
