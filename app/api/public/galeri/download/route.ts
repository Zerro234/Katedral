import { NextRequest, NextResponse } from "next/server";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8_000;
const ALLOWED_CONTENT_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

function getAllowedHosts() {
  const hosts = new Set<string>();

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      hosts.add(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname);
    } catch {
      // Fail closed later if the configured URL is invalid.
    }
  }

  const extraHosts = process.env.DOWNLOAD_ALLOWED_HOSTS?.split(",") ?? [];
  for (const host of extraHosts) {
    const trimmed = host.trim().toLowerCase();
    if (trimmed) hosts.add(trimmed);
  }

  return hosts;
}

function parseAllowedImageUrl(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  if (!getAllowedHosts().has(url.hostname.toLowerCase())) return null;

  return url;
}

function sanitizeFilename(filename: string) {
  const clean = filename
    .replace(/[\r\n"\\/:*?<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  return clean || "foto-katedral";
}

async function readImageBody(response: Response) {
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_IMAGE_BYTES) {
    throw new Error("image_too_large");
  }

  if (!response.body) {
    return response.arrayBuffer();
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = response.body.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    total += value.byteLength;
    if (total > MAX_IMAGE_BYTES) {
      await reader.cancel();
      throw new Error("image_too_large");
    }

    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body.buffer;
}

/**
 * Downloads a trusted gallery image with Content-Disposition: attachment.
 *
 * Usage: /api/public/galeri/download?url=<encoded_image_url>&filename=<name>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const imageUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || "foto-katedral";

  if (!imageUrl) {
    return NextResponse.json({ error: "url diperlukan" }, { status: 400 });
  }

  const allowedUrl = parseAllowedImageUrl(imageUrl);
  if (!allowedUrl) {
    return NextResponse.json({ error: "URL gambar tidak diizinkan" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const imageRes = await fetch(allowedUrl, {
      headers: { "User-Agent": "KatedralBot/1.0" },
      signal: controller.signal,
    });

    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil gambar" },
        { status: 502 }
      );
    }

    const contentTypeHeader = imageRes.headers.get("content-type") ?? "";
    const contentType = contentTypeHeader.split(";")[0].trim().toLowerCase();
    const ext = ALLOWED_CONTENT_TYPES.get(contentType);
    if (!ext) {
      return NextResponse.json({ error: "File bukan gambar yang didukung" }, { status: 415 });
    }

    const buffer = await readImageBody(imageRes);
    const safeFilename = `${sanitizeFilename(filename)}.${ext}`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "image_too_large") {
      return NextResponse.json({ error: "Ukuran gambar terlalu besar" }, { status: 413 });
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengunduh gambar" },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
