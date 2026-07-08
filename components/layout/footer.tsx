import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SETTINGS_SLUG = "church-settings-v1";

const DEFAULT_INFO = {
  name: "Katedral Santo Yosef Pontianak",
  address: "Jl. Pattimura Indah No. 195, Darat Sekip, Kec. Pontianak Kota, Kota Pontianak, Kalimantan Barat 78011",
  phone: "+62 851-7544-7819",
  email: "skrt.kat.ptk@gmail.com",
};

async function getChurchInfo() {
  try {
    const record = await db
      .select({ body: contents.body })
      .from(contents)
      .where(eq(contents.slug, SETTINGS_SLUG))
      .limit(1);

    if (record.length === 0) return DEFAULT_INFO;

    const settings = JSON.parse(record[0].body ?? "{}");
    return { ...DEFAULT_INFO, ...settings };
  } catch {
    return DEFAULT_INFO;
  }
}

export async function Footer() {
  const info = await getChurchInfo();

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "#2C1F14",
        borderTop: "1px solid rgba(184,150,12,0.25)",
      }}
    >
      {/* Decorative soft glow */}
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background: "radial-gradient(circle at top right, rgba(184,150,12,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative z-10">

        {/* ── Gold Divider Top ── */}
        <div className="divider-gold mb-14" />

        {/* ── 3-Column Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Col 1: Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-4 mb-6 group">
              <div
                className="w-16 h-16 transition-colors group-hover:opacity-90 flex-shrink-0"
                style={{
                  backgroundColor: "#B8960C",
                  WebkitMaskImage: "url('/logo-katedral.png')",
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskImage: "url('/logo-katedral.png')",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              />
              <div>
                <span
                  className="font-bold text-2xl leading-none block text-white"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Katedral Santo Yosef
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.25em] font-semibold block mt-1"
                  style={{ color: "#B8960C" }}
                >
                  Pontianak
                </span>
              </div>
            </Link>
            <p
              className="text-[15px] leading-relaxed font-light max-w-sm"
              style={{ color: "rgba(253,247,242,0.65)" }}
            >
              Menjadi komunitas umat beriman yang paguyuban, memasyarakat, dan berpusat pada Kristus.
            </p>
          </div>

          {/* Col 2: Navigasi */}
          <div className="md:col-span-3">
            <h4
              className="text-[11px] uppercase tracking-[0.2em] font-bold mb-6"
              style={{ color: "#B8960C", fontFamily: "var(--font-dm-sans)" }}
            >
              Navigasi
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "Beranda",              href: "/" },
                { label: "Jadwal Misa",          href: "/jadwal-misa" },
                { label: "Berita Paroki",        href: "/berita" },
                { label: "Sakramen Perkawinan",  href: "/sakramen-perkawinan" },
                { label: "Kontak",               href: "/kontak" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] transition-colors hover:text-[#B8960C] font-light"
                    style={{ color: "rgba(253,247,242,0.65)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Kontak Sekretariat — Dynamic from DB */}
          <div className="md:col-span-4">
            <h4
              className="text-[11px] uppercase tracking-[0.2em] font-bold mb-6"
              style={{ color: "#B8960C", fontFamily: "var(--font-dm-sans)" }}
            >
              Sekretariat
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3.5">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#B8960C" }} />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] leading-relaxed font-light transition-colors hover:text-[#B8960C]"
                  style={{ color: "rgba(253,247,242,0.65)" }}
                >
                  {info.address}
                </a>
              </li>
              <li className="flex items-center gap-3.5">
                <Phone size={16} className="flex-shrink-0" style={{ color: "#B8960C" }} />
                <a
                  href={`tel:${info.phone?.replace(/\s|-/g, "")}`}
                  className="text-[14px] font-light tracking-wide transition-colors hover:text-[#B8960C]"
                  style={{ color: "rgba(253,247,242,0.65)" }}
                >
                  {info.phone}
                </a>
              </li>
              <li className="flex items-center gap-3.5">
                <Mail size={16} className="flex-shrink-0" style={{ color: "#B8960C" }} />
                <a
                  href={`mailto:${info.email}`}
                  className="text-[14px] font-light transition-colors hover:text-[#B8960C]"
                  style={{ color: "rgba(253,247,242,0.65)" }}
                >
                  {info.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Gold Divider Bottom ── */}
        <div className="divider-gold mt-14 mb-8" />

        {/* ── Copyright Row ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p
            className="text-[12px] font-light tracking-wide"
            style={{ color: "rgba(253,247,242,0.40)" }}
          >
            © {new Date().getFullYear()} Paroki Katedral Santo Yosef Pontianak. Semua hak dilindungi.
          </p>
          <div
            className="flex gap-6 text-[12px] font-light tracking-wide"
            style={{ color: "rgba(253,247,242,0.40)" }}
          >
            <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-white transition-colors">Syarat &amp; Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
