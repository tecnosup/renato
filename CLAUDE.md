@AGENTS.md

# Projeto: Sistema para Barbearia Século XXI (cliente Renato)

O cliente é Renato, dono da Barbearia Século XXI, que está abrindo uma segunda unidade.
Hoje ele usa o AppBarber, mas o sistema tem muitas limitações. A proposta é construir um
sistema próprio (WaaS) que substitua o AppBarber completamente, replicando as funcionalidades
dele e indo além — o AppBarber é considerado ultrapassado.

## Estrutura do produto

- **Landing page** — área pública/do cliente
- **Painel Admin** — área do proprietário e funcionários (hoje painel, futuramente pode virar
  portal com acesso próprio para clientes)

## Time e divisão de trabalho

- **Vitor** — Painel Admin, usa Claude Code (VSCode)
- **Abraão** — Landing Page, usa Antigravity AI (IDE própria)

Como dois agentes de IA diferentes trabalham nesse repo, é importante:
- Manter commits descritivos
- Manter estrutura de pastas clara, separando bem painel admin de landing page
- Evitar convenções implícitas — escrever aqui no CLAUDE.md o que for relevante para os dois lados

## Workflow de Git

- **Nunca** commitar ou dar push direto na branch `main`.
- Fluxo: branch de feature (a partir de `dev`) → `dev` → revisão conjunta (Vitor + Abraão) → `main` (merge manual, após validação na `dev`).
- Sempre criar branches a partir de `dev`.

## Como trabalhar comigo (Claude) neste projeto

- **Sempre debater antes de codar**: ao entender o que precisa ser feito, apresentar a proposta
  resumida (o que vai ser feito, como, principais decisões de design) e perguntar antes de
  implementar. Só codar após confirmação explícita.
  - Exceção: correções triviais de bug ou ajustes pontuais de texto/estilo recém-pedidos.
- **Regras vivas**: as regras deste arquivo evoluem conforme o projeto avança. Se o Vitor
  discordar de algo que está escrito aqui (mesmo sem pedir explicitamente para mudar),
  perguntar se devemos atualizar este CLAUDE.md para refletir a nova decisão.

## Stack

- Next.js 16.2.7 (Turbopack) — **atenção**: versão com mudanças relevantes em relação ao que
  modelos de IA conhecem por padrão. Consultar `node_modules/next/dist/docs/` antes de usar
  APIs/convenções de versões anteriores.
- React 19, Tailwind CSS 4, TypeScript
- Ícones: `lucide-react` e `react-icons`

## Estrutura atual (src/app)

- `/` — dashboard
- `/comandas` e `/comandas/nova`
- `/cadastros/clientes`
- `/financeiro/caixa`
- `/financeiro/comissoes`
- `/menu`
- `src/components/layout/Sidebar.tsx` — navegação principal
