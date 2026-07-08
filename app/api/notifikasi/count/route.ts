import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ count: 0 });

  const result = await db.select({ count: count() })
    .from(notifications)
    .where(and(
      eq(notifications.userId, session.user.id),
      eq(notifications.isRead, false)
    ));

  return NextResponse.json({ count: result[0]?.count ?? 0 });
}
