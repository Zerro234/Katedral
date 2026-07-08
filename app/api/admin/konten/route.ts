import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to create slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    + "-" + nanoid(6);
}

// POST: Create new content
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, body: contentBody, type, category, eventDate, eventEndDate, location, imageUrl } = body;

  if (!title || !type) {
    return NextResponse.json({ error: "Judul dan tipe konten wajib diisi." }, { status: 400 });
  }

  // VALIDASI KETAT: Berita hanya boleh 2 kategori
  if (type === "NEWS" && category !== "Berita Paroki" && category !== "Pengumuman") {
    return NextResponse.json({ error: "Bug Fatal Dicegah: Kategori berita HANYA boleh 'Berita Paroki' atau 'Pengumuman'." }, { status: 400 });
  }

  const now = new Date();
  const newContent = await db.insert(contents).values({
    id: nanoid(),
    title,
    slug: createSlug(title),
    body: contentBody || "",
    type,
    category: category || null,
    eventDate: eventDate || null,
    eventEndDate: eventEndDate || null,
    location: location || null,
    imageUrl: imageUrl || null,
    createdBy: session.user.id,
    createdAt: now,
    updatedAt: now,
  }).returning();

  revalidatePath("/", "layout");

  return NextResponse.json({ success: true, content: newContent[0] });
}

// PUT: Update existing content
export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, title, body: contentBody, type, category, eventDate, eventEndDate, location, imageUrl } = body;

  if (!id) {
    return NextResponse.json({ error: "ID konten tidak ditemukan." }, { status: 400 });
  }

  // VALIDASI KETAT: Berita hanya boleh 2 kategori
  if (type === "NEWS" && category !== "Berita Paroki" && category !== "Pengumuman") {
    return NextResponse.json({ error: "Bug Fatal Dicegah: Kategori berita HANYA boleh 'Berita Paroki' atau 'Pengumuman'." }, { status: 400 });
  }

  await db.update(contents).set({
    title,
    body: contentBody || "",
    type,
    category: category || null,
    eventDate: eventDate || null,
    eventEndDate: eventEndDate || null,
    location: location || null,
    imageUrl: imageUrl || null,
    updatedAt: new Date(),
  }).where(eq(contents.id, id));

  revalidatePath("/", "layout");

  return NextResponse.json({ success: true });
}

// DELETE: Remove content
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID tidak ditemukan." }, { status: 400 });
  }

  await db.delete(contents).where(eq(contents.id, id));

  revalidatePath("/", "layout");

  return NextResponse.json({ success: true });
}
