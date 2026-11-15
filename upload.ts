import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

function sanitizeCategoryFolder(raw: unknown): string {
  const clean = String(raw || 'geral')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
  return clean || 'geral';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawName = String(req.headers['x-file-name'] || 'imagem.jpg');
    const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'imagem.jpg';
    const categoryFolder = sanitizeCategoryFolder(req.headers['x-media-category']);
    const contentType = String(req.headers['content-type'] || 'image/jpeg');

    if (!contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'Apenas arquivos de imagem são permitidos.' });
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (!buffer.length) {
      return res.status(400).json({ error: 'Arquivo vazio.' });
    }
    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ error: 'Imagem excede o limite de 15MB.' });
    }

    const blob = await put(
      `rodolfo-tenda/${categoryFolder}/${Date.now()}-${safeName}`,
      buffer,
      {
        access: 'public',
        addRandomSuffix: true,
        contentType,
      }
    );

    return res.status(200).json({ url: blob.url, provider: 'vercel-blob' });
  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    return res.status(500).json({ error: 'Falha no upload Vercel Blob.' });
  }
}
