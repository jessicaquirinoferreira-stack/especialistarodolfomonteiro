export default function handler(_req: any, res: any) {
  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return res.status(200).json({
    provider: configured ? 'vercel-blob' : 'local-asset',
    vercelBlobConfigured: configured,
  });
}
