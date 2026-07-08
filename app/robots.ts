import { MetadataRoute } from "next";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://kp-web-katedral-pontianak.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/berita", "/jadwal-misa", "/sakramen-perkawinan", "/kontak"],
        disallow: ["/admin/", "/dasbor/", "/api/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
