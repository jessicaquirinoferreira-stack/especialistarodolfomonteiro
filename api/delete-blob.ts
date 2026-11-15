import { del } from '@vercel/blob';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const targetUrl = String(body.url || '').trim();

    if (!targetUrl) {
      return res.status(400).json({ error: 'URL não informada.' });
    }

    if (targetUrl.includes('blob.vercel-storage.com')) {
      await del(targetUrl);
      return res.status(200).json({ ok: true, provider: 'vercel-blob' });
    }

    return res.status(200).json({ ok: true, skipped: true });
  } catch (error) {
    console.error('Vercel Blob delete error:', error);
    return res.status(500).json({ error: 'Falha ao remover arquivo do Vercel Blob.' });
  }
}
