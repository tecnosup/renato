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

## Compatibilidade de aparelhos (landing) — não negociável

A landing roda no celular do cliente, que vem do Instagram e pode ser um
**iPhone 7 (para no iOS 15)** ou um Android de entrada. Next 16 e Tailwind 4
miram Safari 16.4+ por padrão, e o Tailwind **ignora o `browserslist`**.

Na landing, portanto:

- **Nunca** usar modificador de opacidade do Tailwind (`bg-white/10`,
  `text-black/70`) — no Tailwind 4 isso vira `color-mix()`, que o Safari 15
  descarta, deixando o elemento sem fundo. Usar `rgba()` ou token sólido.
- Evitar utilitários que dependem de `@property` (gradiente, `shadow-*`
  composta, `ring-*`, transforms combinados).
- Layout (flex/grid/gap/breakpoints) é seguro.

Detalhe completo, com o porquê e como verificar: **`docs/compatibilidade.md`**.

## Identidade visual da landing

A marca real está em `public/Barbearia Século 21/` (manual + logos + grafismos).
Cores medidas dos arquivos oficiais, não estimadas: **`#ffc200`** (amarelo),
`#1a1a1a` (grafite), `#f2f2f2` (off-white). Tokens `--color-xxi-*` no
`globals.css`.

Regra de contraste que define os pares: amarelo sobre preto e preto sobre
amarelo passam com folga; **branco sobre amarelo dá 1.6:1 e reprova** — sobre
amarelo, texto é preto.

Logo e monograma são SVG vetorizados dos arquivos oficiais, em
`src/components/brand/` (`Monogram`, `Lockup`) — não usar os PNGs de 4500×4500
na web.

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

## Tema do Admin (Diurno / Noturno / Liquid Glass)

O painel admin tem 3 temas escolhidos pelo usuário em `Configurações > Tema`. **Telas novas
do admin devem nascer já tematizadas** — usar as utility classes `admin-*` em vez de cores
fixas, e seguir a regra "texto dentro de card segue o tema (`admin-text-primary/secondary`),
texto sobre o fundo é branco fixo (`text-slate-100`)". O dourado da marca e cores semânticas
(verde/vermelho/amber) ficam iguais nos 3 modos.

Guia completo (tokens, classes, template de tela nova, regra do restart do Turbopack):
**`docs/admin-theme.md`**.
