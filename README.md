# Rodolfo Monteiro | Especialista Tenda

Site público institucional imobiliário e painel administrativo privado para **Rodolfo Monteiro** (`@rodolfo_monteiro_tenda`), focado em empreendimentos Tenda em Salvador e região metropolitana (Patamares, Matatu, Abrantes/Camaçari) com destaque para FGTS, entrada facilitada, subsídio e simulações sem compromisso.

## Stack Tecnológica

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion (`motion/react`), React Router DOM, Lucide React
- **Backend / Banco de Dados / Auth:** Firebase Authentication (Google Sign-In) + Cloud Firestore (banco isolado configurado em `firebase-applet-config.json`)
- **Mídia:** `@vercel/blob` (`/api/upload`) com fallback automático para `/public/uploads` em desenvolvimento local
- **Segurança:** Regras `firestore.rules` validadas com `@firebase/eslint-plugin-security-rules`

## Instalação e Execução Local

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Configuração do Firebase e Primeiro Administrador

1. O projeto Firebase e o banco Firestore isolado já estão configurados automaticamente em `firebase-applet-config.json` (nenhuma chave manual necessária).
2. As regras de segurança em `firestore.rules` protegem as coleções `leads` e `visitRequests` contra leitura pública e restringem alterações administrativas.
3. Acesse `/admin` pelo rodapé discreto (**Painel Admin**) e faça login com a conta Google autorizada (`nonhu2490@gmail.com`).
4. No primeiro login administrativo, o sistema popula automaticamente no Firestore os dados iniciais de referência (`siteSettings`, `professionalProfile`, `empreendimentos`, `properties`, `landingPages` e `media`).

## Deploy na Vercel

1. Conecte o repositório na Vercel.
2. Configure a variável de ambiente opcional `BLOB_READ_WRITE_TOKEN` caso deseje armazenamento em nuvem via Vercel Blob.
3. O arquivo `vercel.json` já inclui as reescritas de SPA e rota `/api/upload`.

## Verificação e Build

```bash
npm run lint
npm run build
npx eslint firestore.rules
```
