# révise. 🎓

Application de révision scolaire alimentée par l'IA Claude.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **API Anthropic** (Claude Sonnet)
- Zéro dépendance UI (tout en CSS-in-JS inline)

## Installation

### 1. Crée le projet

```bash
npx create-next-app@latest revise-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd revise-app
```

### 2. Remplace les fichiers

Colle les fichiers fournis dans les emplacements suivants :

```
src/
├── app/
│   ├── layout.tsx          ← remplace
│   ├── page.tsx            ← remplace
│   ├── globals.css         ← remplace
│   └── api/
│       └── ai/
│           └── route.ts    ← crée
└── components/
    └── App.tsx             ← crée
```

### 3. Clé API

Crée `.env.local` à la racine :

```
ANTHROPIC_API_KEY=sk-ant-TA_CLE_ICI
```

Obtiens ta clé sur → https://console.anthropic.com

### 4. Lance

```bash
npm run dev
```

→ http://localhost:3000

## Déploiement Vercel

```bash
npx vercel
```

Ajoute la variable `ANTHROPIC_API_KEY` dans les settings Vercel.

## Fonctionnalités

- 🔐 Système de connexion / inscription
- 📝 Zone pour coller un cours
- ⚡ **Résumé IA** — points clés en HTML structuré
- 🎯 **Quiz interactif** — 5 QCM avec corrections
- 📋 **Fiche de révision** — mémo complet structuré
- 📱 100% responsive mobile
- 🎨 Design noir/blanc moderne 2026
