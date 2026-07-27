# Compatibilidade de aparelhos — por que a landing quebrava em celular antigo

> Vale para os dois lados do repo. O painel admin roda no aparelho do dono e
> tem margem para exigir navegador atual; a **landing roda no celular do
> cliente**, que vem do Instagram e pode ser um iPhone 7 ou um Android de
> entrada. As regras abaixo são obrigatórias na landing.

## O que estava acontecendo

Duas camadas do stack assumem navegador moderno **por padrão**, e as duas
assumem quase a mesma linha de corte:

| Camada | Alvo padrão | Onde está definido |
|---|---|---|
| Next.js 16 (SWC) | Chrome 111 · Safari 16.4 | `node_modules/next/dist/docs/03-architecture/supported-browsers.md` |
| Tailwind CSS 4 | Chrome 111 · Safari 16.4 · Firefox 128 | fixo no `@tailwindcss/node`; **ignora o `browserslist`** |

O problema é que o **iPhone 7 para no iOS 15.8** — a Apple não deu iOS 16 para
ele. Ou seja, ele nasce abaixo da linha e nunca vai subir. O mesmo vale para
Androids que travaram numa versão antiga do Chrome, e para a WebView usada pelo
navegador interno do Instagram.

O CSS que o projeto gerava tinha, antes da correção:

- **380 usos de `color-mix()`** — só existe a partir do Safari 16.2
- **75 blocos `@property`** — só existem a partir do Safari 16.4

Quando o navegador não entende uma função de cor, ele **descarta a declaração
inteira**. Não é um detalhe que fica feio: é o card sem fundo, a borda invisível,
o texto sem cor. E no JavaScript, sintaxe não suportada é erro de parse — o
bundle inteiro morre e a página fica **em branco**.

De onde vinham esses 380 `color-mix()`: do **modificador de opacidade do
Tailwind**. Escrever `bg-white/10` no Tailwind 4 gera
`color-mix(in oklab, white 10%, transparent)`.

## O que foi feito

**1. `browserslist` explícito no `package.json`** — resolve o lado JavaScript,
fazendo o SWC transpilar para as versões alvo:

```json
"browserslist": ["chrome >= 88", "edge >= 88", "firefox >= 88",
                 "safari >= 14", "ios_saf >= 14", "samsung >= 13", "not dead"]
```

**2. Regras de CSS na landing** — o `browserslist` **não** conserta o Tailwind,
porque os alvos dele são fixos no pacote. Então na landing:

- ❌ **Nunca** usar modificador de opacidade: `bg-white/10`, `text-black/70`,
  `border-white/20`. Usar `rgba()` literal ou um token sólido
  (`bg-xxi-graphite-hi`, `border-xxi-line`, `text-xxi-mute`).
- ❌ Evitar utilitários que dependem das variáveis `--tw-*` registradas via
  `@property`: gradiente (`bg-gradient-*`), `shadow-*` composta, `ring-*`,
  `scale-*`/`rotate-*`/`translate-*` combinados. Quando precisar, escrever a
  propriedade CSS direto (`style` ou uma classe em `globals.css`).
- ✅ Layout (flex, grid, gap, padding, breakpoints) é seguro — não usa nenhuma
  das duas features.

**3. Fontes** — o `globals.css` carregava 5 famílias por `@import` de CDN. Um
`@import` de folha externa é render-blocking: o navegador não pinta nada até
baixar. Agora são duas famílias auto-hospedadas por `next/font` (Anton para
título, Inter para corpo), que não bloqueiam a pintura.

## Como verificar antes de subir

```bash
npm run build
# Nenhum destes deve aparecer em CSS que a landing use:
grep -o 'color-mix(' .next/static/chunks/*.css | wc -l
grep -o '@property'  .next/static/chunks/*.css | wc -l
```

O admin ainda produz `color-mix()` (os temas usam opacidade), e por ora tudo
bem — ele não roda em iPhone 7. O que não pode é a **landing** depender disso.

## Teste real

O que pega os casos que o `grep` não pega é abrir no aparelho. Com o dev server
rodando, o Next imprime o endereço de rede — dá para abrir no celular na mesma
Wi-Fi. Se não houver um aparelho antigo à mão, o Safari do macOS tem
_Develop → Open Page With → Safari Technology Preview_ e o modo responsivo, mas
**nenhum simulador reproduz um Safari 15 de verdade** — o teste que vale é o
aparelho.
