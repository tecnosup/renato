# Onboarding — Sistema Barbearia Século XXI

Bem-vindo, Abraão! Este guia prepara seu ambiente local e dá o contexto do projeto.

## O que é o projeto

Sistema próprio (WaaS) pra Barbearia Século XXI do cliente **Renato**, que está abrindo
a 2ª unidade. A meta é substituir o **AppBarber** por completo, replicando o que ele faz
e indo além. Dois lados:

- **Landing page** (`src/app/(client)`) — área pública / do cliente → **seu foco**
- **Painel Admin** (`src/app/admin`) — dono e funcionários → foco do Vitor

Time: **Vitor** (admin, Claude Code) e **Abraão** (landing, Claude Code).

## Stack

- **Next.js 16.2.7 (Turbopack)** — ⚠️ versão com breaking changes em relação ao que os
  modelos conhecem por padrão. **Consultar `node_modules/next/dist/docs/` antes** de usar
  APIs/convenções de versões anteriores.
- React 19, Tailwind CSS 4, TypeScript, Firebase (Auth + Firestore + Admin SDK)
- Ícones: `lucide-react` e `react-icons`

## Setup local (passo a passo)

```bash
git clone <repo>
cd renato
git checkout dev          # sempre parta da dev
npm install               # inclui firebase-admin
cp .env.example .env.local # depois preencha (abaixo)
npm run dev               # http://localhost:3000
```

### Preenchendo o `.env.local`

1. **Chaves `NEXT_PUBLIC_*` (públicas)** — peça pro Vitor, ou pegue no console:
   console.firebase.google.com → ⚙ Configurações do projeto → aba **Geral** →
   seção **Seus apps** → config do SDK.
2. **`FIREBASE_SERVICE_ACCOUNT` (privada — você gera a SUA)** — console → ⚙ Configurações
   do projeto → aba **Contas de serviço** → **Gerar nova chave privada** → baixa um `.json`.
   **Não cole o conteúdo em chat:** peça ao seu Claude pra injetar o `.json` baixado no
   `.env.local` automaticamente. Cada dev tem a sua chave (dá pra revogar individual).

> No Windows o `npm run dev` já roda com `NODE_OPTIONS=--use-system-ca` (necessário pra
> auth do Firebase). Não remova isso dos scripts.

## Workflow de Git (importante)

- **Nunca** commitar/push direto na `main`.
- Fluxo: **feature branch (a partir de `dev`) → `dev` → revisão conjunta (Vitor + Abraão) → `main`**.
- Sempre crie branches a partir de `dev`.
- Commits descritivos (dois agentes de IA mexem no mesmo repo).

## Convenções

- **Responder/escrever em português (pt-BR).**
- **Debater antes de codar:** apresentar a proposta (o quê, como, decisões) e perguntar
  antes de implementar. Exceção: correções triviais.
- **Tema do Admin** (Diurno / Noturno / Liquid Glass): telas novas nascem tematizadas com
  as classes `admin-*` — guia completo em **`docs/admin-theme.md`**. (Mais relevante pro
  lado admin, mas bom saber.)
- Separar bem **landing** (`(client)`) de **admin** (`admin`) na estrutura de pastas.

## Segurança (não repetir erros)

- `.env.local` **nunca** vai pro git (está no `.gitignore`) nem em chat/WhatsApp/Discord.
- `FIREBASE_SERVICE_ACCOUNT` é credencial de admin (acesso total ao banco) — só circula
  gerando a sua própria; nunca cole o valor em lugar nenhum.
- Só o `.env.example` (a casca, sem valores) pode ir pro git.

## Estado atual (16/06/2026)

Recém-integrado o **agendamento** entre landing e admin:
- Grade de horários por barbeiro (config semanal, almoço, bloqueios)
- Agendamento da landing filtra horários ocupados (endpoint `/api/appointments/slots`)
- Anti-conflito server-side (`/api/appointments/create`) — não marca 2× no mesmo horário
- Lista de espera, RBAC de acessos

**Pendências em aberto:** foto do barbeiro no agendamento, agendamento→comanda, e cadastros
reais (clientes / serviços / produtos ainda são telas-maquete).

Bom desenvolvimento! 🚀
