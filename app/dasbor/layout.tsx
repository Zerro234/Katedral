import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SidebarUser } from "@/components/layout/sidebar-user";
import { HeaderBar } from "@/components/layout/header-bar";

export default async function DasborLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/masuk");
  }

  if (session.user.role !== "COUPLE") {
    redirect("/masuk");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF7F2]">
      <SidebarUser />
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar title="Portal Pengantin" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
