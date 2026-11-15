import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { del, put } from '@vercel/blob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@x.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin4321';
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');

function signAdminToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, iat: Date.now(), exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Boolean(parsed.email && parsed.exp > Date.now());
  } catch {
    return false;
  }
}

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

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  const dataDir = path.join(__dirname, 'data');
  const overridesFile = path.join(dataDir, 'site-overrides.json');

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });

  app.use('/uploads', express.static(uploadsDir));

  // Direct Admin Login endpoint (supports user-requested admin@x.com / admin4321)
  app.post('/api/admin/login', express.json(), (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (email === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const token = signAdminToken(email);
      return res.json({ ok: true, email, token });
    }
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  });

  app.get('/api/admin/verify', (req, res) => {
    const authHeader = String(req.headers.authorization || '');
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (verifyAdminToken(token)) {
      return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false });
  });

  app.get('/api/storage-status', (_req, res) => {
    const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    res.json({
      provider: configured ? 'vercel-blob' : 'local-asset',
      vercelBlobConfigured: configured,
    });
  });

  // Public read & authenticated admin write for site customizations
  app.get('/api/site-data', async (_req, res) => {
    try {
      const raw = await fs.readFile(overridesFile, 'utf8');
      return res.json(JSON.parse(raw));
    } catch {
      return res.json({});
    }
  });

  app.post('/api/site-data', express.json({ limit: '6mb' }), async (req, res) => {
    const authHeader = String(req.headers.authorization || '');
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Sessão administrativa expirada ou não autorizada.' });
    }

    try {
      let existing: Record<string, unknown> = {};
      try {
        existing = JSON.parse(await fs.readFile(overridesFile, 'utf8'));
      } catch {
        existing = {};
      }
      const next = { ...existing, ...(req.body || {}) };
      await fs.writeFile(overridesFile, JSON.stringify(next, null, 2), 'utf8');
      return res.json({ ok: true });
    } catch (error) {
      console.error('Error saving site-data:', error);
      return res.status(500).json({ error: 'Falha ao salvar alterações.' });
    }
  });

  // Media upload endpoint: uses @vercel/blob when BLOB_READ_WRITE_TOKEN is configured,
  // and stores safely into /public/uploads in local/preview environments.
  app.post('/api/upload', express.raw({ type: '*/*', limit: '15mb' }), async (req, res) => {
    try {
      const rawName = String(req.headers['x-file-name'] || 'imagem.jpg');
      const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'imagem.jpg';
      const categoryFolder = sanitizeCategoryFolder(req.headers['x-media-category']);
      const contentType = String(req.headers['content-type'] || 'image/jpeg');
      const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');

      if (!buffer.length) {
        return res.status(400).json({ error: 'Arquivo vazio.' });
      }
      if (!contentType.startsWith('image/')) {
        return res.status(400).json({ error: 'Apenas arquivos de imagem são permitidos.' });
      }

      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(
          `rodolfo-tenda/${categoryFolder}/${Date.now()}-${safeName}`,
          buffer,
          {
            access: 'public',
            addRandomSuffix: true,
            contentType,
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }
        );
        return res.json({ url: blob.url, provider: 'vercel-blob' });
      }

      const fileName = `${Date.now()}-${safeName}`;
      await fs.writeFile(path.join(uploadsDir, fileName), buffer);
      return res.json({ url: `/uploads/${fileName}`, provider: 'local-asset' });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Falha ao enviar mídia.' });
    }
  });

  // Delete uploaded image from Vercel Blob or local /public/uploads
  app.post('/api/delete-blob', express.json(), async (req, res) => {
    try {
      const targetUrl = String(req.body?.url || '').trim();
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL não informada.' });
      }

      if (targetUrl.includes('blob.vercel-storage.com') && process.env.BLOB_READ_WRITE_TOKEN) {
        await del(targetUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
        return res.json({ ok: true, provider: 'vercel-blob' });
      }

      if (targetUrl.startsWith('/uploads/')) {
        const fileName = path.basename(targetUrl);
        if (fileName && !fileName.includes('..')) {
          await fs.unlink(path.join(uploadsDir, fileName)).catch(() => {});
        }
        return res.json({ ok: true, provider: 'local-asset' });
      }

      return res.json({ ok: true, skipped: true });
    } catch (error) {
      console.error('Delete blob error:', error);
      return res.status(500).json({ error: 'Falha ao remover arquivo do storage.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
