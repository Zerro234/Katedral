import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Bell } from "lucide-react";
import NotifikasiClient from "./NotifikasiClient";

export default async function NotifikasiPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const userNotifications = await db.select().from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt));

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  // Mark all unread as read
  if (unreadCount > 0) {
    await db.update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.isRead, false)
        )
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <NotifikasiClient
        initialNotifications={userNotifications.map(n => ({
          id: n.id,
          message: n.message ?? "",
          isRead: n.isRead ?? false,
          createdAt: n.createdAt ? n.createdAt.toISOString() : new Date().toISOString(),
        }))}
        initialUnreadCount={unreadCount}
      />
    </div>
  );
}
