# Dívida técnica: integração Admin → Landing

> Registrada em 2026-06-15 durante o trabalho de performance mobile da landing
> (branch `perf/landing-mobile`). Levantada pelo Vitor.

## Contexto

A landing page (`src/app/(client)/`) hoje exibe **dados e imagens hardcoded
(placeholders)**. A visão do produto é que esse conteúdo seja **personalizável
pelo admin** e que **produtos e serviços sejam reflexo do que é cadastrado no
painel admin** (não mais mock).

## O que está mockado hoje e onde

| Dado | Local atual | Destino futuro |
|------|-------------|----------------|
| `SERVICES` | `src/lib/data.ts` (array fixo) | Cadastro de serviços do admin |
| `PRODUCTS` | **dentro** de `OrbCarousel.tsx` (array local) | Cadastro de produtos do admin |
| `trendingCuts` | **dentro** de `ShowcaseBanner.tsx` (array local) | Conteúdo editável (admin) |
| `BARBERS` (avatars) | `src/lib/data.ts` | Cadastro de profissionais + upload |
| Imagens Unsplash (galeria, fundo hero, orbs) | URLs `images.unsplash.com` espalhadas | Upload do Renato (Firebase Storage) / personalização |

## Pendências quando a integração for feita

1. **Centralizar dados**: tirar `PRODUCTS`/`trendingCuts` de dentro dos
   componentes; toda a landing deve ler de uma fonte única (admin/Firebase).
2. **Imagens reais**: ao trocar os placeholders Unsplash por imagens do
   Storage, migrar de `<img>` para **`next/image`** de uma vez — configurar
   `images.remotePatterns` no `next.config.ts` (domínio do Firebase Storage).
   Foi deliberadamente adiado no Passo 4 de performance porque otimizar
   placeholders que serão substituídos seria trabalho jogado fora.
3. Os atributos `loading="lazy"` / `decoding="async"` já aplicados nas `<img>`
   continuam válidos / servem de base até a migração para `next/image`.

## O que JÁ foi feito (performance, branch perf/landing-mobile)

Não confundir com a integração acima. O trabalho de performance apenas:
- moveu `backdrop-blur` para `>=768px` (mobile sólido) via utilities
  `.glass-card` / `.glow-decor` em `globals.css`;
- tornou o cubo 3D (`ThreeDBox`) interativo por toque no mobile;
- desligou o Lenis (`SmoothScroll`) no mobile;
- removeu deps órfãs de three.js;
- adicionou lazy-load nas imagens e reduziu o `w=` do fundo do hero.
