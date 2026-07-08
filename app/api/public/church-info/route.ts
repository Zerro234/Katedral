import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SETTINGS_SLUG = "church-settings-v1";

export const revalidate = 3600; // ISR: revalidate every 1 hour

export async function GET() {
  try {
    const record = await db
      .select({ body: contents.body })
      .from(contents)
      .where(eq(contents.slug, SETTINGS_SLUG))
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json({ settings: null });
    }

    const settings = JSON.parse(record[0].body ?? "{}");
    return NextResponse.json({ settings }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ settings: null });
  }
}
