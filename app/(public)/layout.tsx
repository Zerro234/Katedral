import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] overflow-x-clip">
      <Navbar />
      <main className="flex-1 w-full pt-[72px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
