# Prompt para o Fable — Redesign da Landing Page (Barbearia Século 21)

---

## CONTEXTO

Você vai redesenhar a landing page da **Barbearia Século 21** (Cruzeiro/SP, dono: Renato).
O projeto é Next.js 16.2.7 + React 19 + Tailwind CSS 4 + TypeScript.

**Leia `AGENTS.md` antes de escrever código.** Esta versão do Next.js tem breaking changes
em relação ao que você conhece — consulte `node_modules/next/dist/docs/` antes de usar
qualquer API ou convenção de versões anteriores.

A barbearia acabou de receber um **manual de marca profissional completo**, que está em
`public/Barbearia Século 21/`. A landing atual foi construída ANTES desse manual, sobre uma
identidade provisória que **está errada e precisa ser substituída**.

---

## A TAREFA CENTRAL

Aplicar a identidade visual real da marca em toda a landing page, com padrão de UX/UI de
produto sério — não um reskin de trocar cor de botão.

---

## ⚠️ CONFLITO CRÍTICO — LEIA ANTES DE TUDO

A landing hoje usa uma paleta **tricolor vermelho/azul/branco** que NÃO é a marca.
Em `src/app/globals.css` existem estes tokens:

```css
/* Identidade tricolor da marca (logo graffiti vermelho/azul/branco) */
--color-brand-red: #e23a2e;
--color-brand-red-deep: #b81e16;
--color-brand-blue: #2b4fb8;
--color-brand-blue-deep: #1d3585;
--color-brand-cream: #f4f4f2;
```

**Esse comentário está factualmente errado.** A marca real não tem vermelho nem azul.

São **198 ocorrências em 10 arquivos**:
`src/app/(client)/page.tsx`, `BookingForm.tsx`, `ClientDashboard.tsx`, `Header.tsx`,
`JornadaSobre.tsx`, `Memberships.tsx`, `OrbCarousel.tsx`, `PaymentMethodFields.tsx`,
`PlanCheckout.tsx`, `ProductCheckout.tsx` (todos em `src/components/(client)/`).

**O que fazer:** substituir essa paleta pela identidade real. Não "harmonize" as duas,
não deixe vermelho/azul como cor de apoio, não crie um degradê entre elas. O vermelho e o
azul devem **desaparecer** da landing. Também existe um `--color-gold: #c2a35d` (dourado
mostarda) de uma fase ainda anterior — esse também sai, é o oposto do amarelo vivo que a
marca pede.

Ao terminar, `grep -r "brand-red\|brand-blue\|color-gold" src/` na área da landing deve
voltar vazio.

---

## A IDENTIDADE REAL DA MARCA

### Fontes de verdade (arquivos reais no repo)

| O quê | Onde |
|---|---|
| Manual da marca completo | `public/Barbearia Século 21/Manual da Marca/Manual da marca - Barbearia Século 21-compactado.pdf` |
| Logos (7 versões + 7 sem fundo) | `public/Barbearia Século 21/Versões Logo/` |
| Grafismos / padrões | `public/Barbearia Século 21/Grafismos/` |
| Ícones da marca | `public/Barbearia Século 21/Grafismos/Ícones.png` |
| Fachada real das lojas | `public/Barbearia Século 21/Fachada/17.png`, `18.png` |
| Padrão de Instagram | `public/Barbearia Século 21/Instagram/Modelo Instagram.png` |
| Vídeo oficial | `public/Barbearia Século 21/Vídeo/XXI Vídeo Oficial.mp4` |
| Estampas | `public/Barbearia Século 21/Estampas/` |
| Papelaria / cartão | `public/Barbearia Século 21/Papelaria/` |

**Abra esses arquivos e olhe.** O manual em PDF é a autoridade final — se algo aqui
divergir dele, o manual vence.

### O símbolo

O logo é um **monograma "XX"** (século 21 em romano) construído como uma **tesoura
estilizada**: duas lâminas cruzadas em X, com os anéis/cabos formando círculos vazados em
cima e embaixo, unidos por um eixo vertical. É geométrico, simétrico, de traço grosso e
cantos arredondados. Funciona sozinho como ícone.

Lockup completo: símbolo em amarelo + "BARBEARIA SÉCULO 21" em sans-serif condensada,
pesada, caixa-alta.

Existe também versão horizontal: `BARBEARIA ✕ SÉCULO 21` (símbolo entre as palavras) —
é a que está na fachada real.

### Paleta

O Renato (o dono) deu direção explícita por WhatsApp, e ela é o critério de aceite:

> "Se puder trabalhar com **cinza, amarelo flevo (que é o amarelo mais vivo) e preto com
> branco para realçar** vou curtir bastante. **Digo nos fundos e tal.**"

Traduzindo:

| Papel | Cor | Uso |
|---|---|---|
| **Amarelo vivo** (o "flevo") | `#FFC800` aprox. — confirme no manual | Cor de marca. Símbolo, CTAs primários, destaques, blocos de fundo inteiros |
| **Preto** | `#000000` / quase preto | Fundos, o contraponto do amarelo |
| **Cinza escuro** | `#333333` aprox. | Fundo alternativo, superfícies de card, o cinza do lockup |
| **Branco** | `#FFFFFF` / `#F5F5F5` | Texto e realce sobre preto/amarelo |

Regras que saem daí:
- É uma paleta de **alto contraste**, não de meios-tons. Amarelo sobre preto, preto sobre
  amarelo, branco realçando. Sem pastéis, sem cores de apoio inventadas.
- **"Nos fundos e tal"** = ele quer seções de fundo inteiro alternando (preto → amarelo →
  cinza → preto), como o feed do Instagram faz. Não é só detalhe em botão.
- Amarelo é **cor de destaque, não de texto corrido**. Texto longo em amarelo sobre preto
  cansa e reprova contraste.
- Nunca texto branco sobre amarelo em corpo de texto (contraste ~1.8:1, reprova WCAG).
  Sobre amarelo, texto é **preto**.

### Tipografia

O manual manda. Do lockup: sans-serif **condensada, pesada, caixa-alta** para títulos —
é o que dá o tom "barbearia street" sem ser cartoon.

O `globals.css` hoje carrega um monte de fonte de fases anteriores: `Bricolage Grotesque`,
`Playfair Display`, `Space Grotesk`, `CC That's All Folks` (cartoon), `JetBrains Mono`.
**Faça a limpeza**: mantenha só o que a marca pede + uma sans neutra pra corpo de texto.
Cada família a menos é payload a menos.

⚠️ `CC That's All Folks` (`.font-toon`) é uma fonte cartoon de uma fase antiga. Ela não
combina com o manual novo — remova, salvo se o manual disser o contrário.

### Grafismo / padrão

`Grafismos/` traz um **padrão de repetição** feito do próprio monograma tesourado, em
amarelo. Na fachada real ele aparece aplicado em grande escala na parede lateral.

Use como textura de fundo em amarelo sobre preto, com opacidade baixa — dá profundidade
sem competir com o conteúdo. **Não** encha a página com ele; é respiro, não wallpaper.

### Ícones

`Grafismos/Ícones.png` tem o set da marca: navalha, barba, bigode, máquina, tesoura,
poste de barbeiro, pincel+tigela, corte, "21" em blackletter.

**Prefira esses ícones aos do `lucide-react`** nas seções de serviço — são da marca e
carregam a identidade. Extraia como SVG. Mantenha o lucide para UI funcional (setas, X,
check, menu), onde ícone ilustrativo atrapalharia.

---

## O QUE JÁ EXISTE (não quebrar)

A landing é `src/app/(client)/page.tsx` (569 linhas) + `src/components/(client)/`.

Componentes atuais:
`Header` · `BookingForm` · `Memberships` · `ClientDashboard` · `ProductCheckout` ·
`PlanCheckout` · `PaymentMethodFields` · `JornadaSobre` · `LocationMap` · `OrbCarousel` ·
`ShowcaseBanner` · `Reveal` · `Toast` · `ThreeDText` / `ThreeDBox` / `ThreeDTiltCard`

**Fluxos que funcionam de verdade e NÃO podem regredir:**
- Agendamento real, gravando no Firestore (com anti-conflito de horário)
- Área do cliente lendo agenda real do Firestore
- Checkout de produto e de plano/assinatura
- Rate limiting nas rotas públicas (`src/lib/rate-limit.ts`)
- Hooks `useLockBodyScroll`, `usePaymentMethod`

Isto é **redesign visual**. Você reescreve aparência, layout, hierarquia e microinterações —
mas a lógica de negócio, as chamadas de API e os contratos de dados continuam funcionando
igual. Se precisar mexer em lógica pra viabilizar o design, isole a mudança e me avise.

⚠️ Já houve trabalho de performance nesta landing (remoção de vídeo órfão de 2.2MB,
lazy-load de imagens, Lenis desligado no mobile, orbes e letreiro otimizados). **Não
reintroduza peso.** Se o redesign pedir um efeito caro, ele tem que se pagar.

---

## PADRÃO DE UX/UI ESPERADO

Não quero "bonito". Quero **um site que converte agendamento**. A régua:

### Hierarquia e conversão
- O objetivo primário da landing é **agendar um corte**. Isso tem que estar óbvio nos
  primeiros 3 segundos, acima da dobra, e acessível de qualquer ponto da página.
- Um CTA primário claro por seção. Se tudo é destaque, nada é.
- Prova social (cortes reais em `public/cortes/`, fotos da fachada) perto da decisão, não
  no rodapé.

### Mobile-first, de verdade
- O público desta barbearia agenda pelo celular. Desenhe pro mobile primeiro, depois suba.
- Alvos de toque ≥ 44px. Nada de hover como único caminho de interação.
- Já existe o breakpoint `xs: 25rem` no `@theme` — use.

### Acessibilidade (não negociável)
- Contraste WCAG AA: 4.5:1 corpo de texto, 3:1 texto grande.
  **Cheque o amarelo** — `#FFC800` sobre branco dá ~1.5:1 e reprova feio. Amarelo pede
  preto por baixo ou por cima, nunca branco.
- Foco visível em tudo que é navegável por teclado.
- `prefers-reduced-motion` respeitado em toda animação.
- Hierarquia real de headings, `alt` descritivo nas imagens, labels nos inputs.

### Movimento
- Animação serve pra orientar (o que mudou, o que veio de onde), não pra impressionar.
- Transições rápidas: 150–300ms. Nada que faça o usuário esperar.
- Se um efeito custa frames no celular, ele não entra.

### Densidade e ritmo
- Escala de espaçamento consistente. Respiro generoso entre seções.
- Alterne fundos (preto → amarelo → cinza) pra marcar seções — é o que o Renato pediu com
  "nos fundos e tal", e é o que o feed do Instagram já faz.
- Largura de leitura confortável em texto corrido (~65 caracteres).

---

## ENTREGÁVEIS

1. **`globals.css` reescrito**: tokens da marca real, paleta antiga removida, fontes
   enxutas. Tokens semânticos (`--color-brand-yellow`, `--surface-dark`), não valor solto
   espalhado em componente.
2. **Todos os 10 arquivos migrados** pra nova paleta, sem resíduo de vermelho/azul/dourado.
3. **Logo e grafismos reais aplicados** — chega de placeholder. Otimize os PNGs (o manual
   entrega em 4500×4500; a web não precisa disso) e prefira SVG onde der.
4. **Landing coesa de ponta a ponta**: hero → serviços → cortes → planos → localização →
   agendamento, cada seção com identidade e função claras.
5. **Sem regressão de performance**: nada de lib pesada nova. Se adicionar dependência,
   justifique.

---

## COMO TRABALHAR

- **Debata antes de codar.** Apresente a proposta (direção visual, estrutura de seções,
  decisões de design) e espere confirmação antes de implementar. Esta é regra do projeto.
- Se o manual da marca contradisser qualquer coisa deste prompt, **o manual vence** — me
  avise da divergência.
- Commits descritivos. Dois agentes de IA diferentes trabalham neste repo.
- Branch: `redesign/nova-identidade-visual` (já criada, a partir de `dev`).
- **Nunca** commitar direto na `main`.

---

## CRITÉRIO DE ACEITE

- [ ] Zero ocorrência de `brand-red`, `brand-blue`, `color-gold` na landing
- [ ] Amarelo, preto, cinza e branco aplicados **em fundos de seção**, não só em detalhes
- [ ] Logo/monograma real da marca no header e no rodapé
- [ ] Grafismo do manual usado como textura, com contenção
- [ ] Todo par texto/fundo passa em WCAG AA
- [ ] Agendamento, checkout e área do cliente continuam funcionando
- [ ] Sem queda de performance no mobile
- [ ] Renato bate o olho e reconhece a barbearia dele
