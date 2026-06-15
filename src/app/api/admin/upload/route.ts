import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { assertAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

// Stores an uploaded image and returns its public path.
//  - On Netlify (read-only FS): persist to Netlify Blobs, served via /api/img/[key].
//  - In local dev: write to public/img/uploads so the file is served directly.
export async function POST(req: Request) {
  await assertAdmin();

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'bad_type' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'too_large' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const base = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'img';
  const name = `${base}-${Date.now().toString(36)}.${ext}`;
  const ab = await file.arrayBuffer();

  // Serverless / Netlify: filesystem is read-only — use Blobs.
  if (process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT) {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('uploads');
    await store.set(name, ab, { metadata: { type: file.type } });
    return NextResponse.json({ path: `/api/img/${name}` });
  }

  // Local dev: write to the public folder.
  const dir = path.join(process.cwd(), 'public', 'img', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(ab));
  return NextResponse.json({ path: `/img/uploads/${name}` });
}
