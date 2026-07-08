# KP - Web Katedral Pontianak

Sistem Informasi Paroki Katedral Santo Yosef Pontianak untuk layanan informasi publik, pendaftaran pernikahan, jadwal misa, berita paroki, galeri, dan administrasi sekretariat.

## Tech Stack

- **Framework**: Next.js 16 App Router
- **Runtime UI**: React 19
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth
- **Storage**: Supabase Storage
- **Email**: Nodemailer / Resend
- **Styling**: Tailwind CSS 4
- **UI**: shadcn/ui, Base UI, lucide-react

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Useful Scripts

```bash
npm run lint
npm run build
npm run start
```

## Environment

The app expects these environment variables for the main production-like flow:

```env
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Optional:

```env
DOWNLOAD_ALLOWED_HOSTS=
```

Use `DOWNLOAD_ALLOWED_HOSTS` only when gallery downloads need to allow trusted image hosts outside Supabase Storage.
