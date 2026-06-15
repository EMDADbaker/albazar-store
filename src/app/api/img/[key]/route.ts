import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

export const runtime = 'nodejs';

// Serves images persisted to Netlify Blobs by the admin upload route.
// (Local-dev uploads live in /public/img/uploads and are served statically.)
export async function GET(
  _req: Request,
  { params }: { params: { key: string } },
) {
  try {
    const store = getStore('uploads');
    const blob = await store.getWithMetadata(params.key, { type: 'arrayBuffer' });
    if (!blob) return new NextResponse('Not found', { status: 404 });

    const type =
      typeof blob.metadata?.type === 'string' ? blob.metadata.type : 'image/jpeg';
    return new NextResponse(blob.data, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
