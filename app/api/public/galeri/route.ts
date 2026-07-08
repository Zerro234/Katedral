import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const revalidate = 3600;

export async function GET() {
  try {
    const photos = await db
      .select({
        id: contents.id,
        title: contents.title,
        body: contents.body,
        imageUrl: contents.imageUrl,
        createdAt: contents.createdAt,
      })
      .from(contents)
      .where(eq(contents.type, "GALLERY"))
      .orderBy(desc(contents.createdAt));

    return NextResponse.json({ photos }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
