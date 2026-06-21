---
version: anydesign-element-1
name: "Lettering graffiti da logo Século XXI (CTAs)"
source: public/img/logo.png
captured_at: 2026-06-21
kind: hybrid
target:
  description: "A arte de lettering graffiti da logo (BARBEARIA SÉCULO XXI), para reproduzir o aspecto nos botões CTA"
  region: "imagem inteira = o elemento"

# kind: code | hybrid — tokens reais extraídos da logo (extract_colors.py)
colors:
  outline: "#000000"        # contorno preto grosso — 47% da área, a assinatura
  highlight: "#F0EBE4"      # creme/branco do miolo (faixa de luz) — 14%
  blue: "#639BB4"           # azul real da logo (dessaturado) — 13%
  red-deep: "#6C080C"       # vermelho/vinho da base — 9%
typography:
  cta:
    fontFamily: '"Rubik Spray Paint", sans-serif'
    case: ALL-CAPS
    letterSpacing: 0.02em
spacing-used: []
rounded-used: { btn: 16px }

# kind: asset | hybrid — paleta que alimenta o prompt de imagem
palette:
  - "#000000"   # contorno dominante, ~47% área
  - "#F0EBE4"   # highlight creme miolo
  - "#639BB4"   # azul dessaturado
  - "#6C080C"   # vermelho profundo base
---

# Element — Lettering graffiti da logo Século XXI (CTAs)

> Gerado com a skill `anydesign` (element mode). Kind: hybrid · 2026-06-21

## Source & target

- **Source**: `public/img/logo.png` (logo tricolor "BARBEARIA SÉCULO XXI")
- **Targeting**: imagem inteira = elemento — visual ⚠️ + cores por extração ✅
- **Context**: os CTAs renderizam sobre fundo dark (`#050505`/parede do hero) e dentro de botões com gradiente.

## 1. What this element is

Lettering graffiti/pichação com **gradiente vertical** (azul no topo → creme no
miolo → vermelho na base), **contorno preto muito grosso** e **tinta escorrendo
(drips)** na base das letras. A assinatura visual é o **contorno preto** — sozinho
ele responde por ~47% da área e é o que dá o aspecto "logo de jogo/arcade". O
gradiente é secundário; sem o outline grosso, nenhuma fonte parece pichação.

## 2. Spec (kind: code)

**Cores reais (extraídas, não aproximadas):**

| Papel | Hex | Confiança | Nota |
|---|---|---|---|
| Contorno | `#000000` | ✅ | 47% da área — tem que ser GROSSO |
| Highlight miolo | `#F0EBE4` | ✅ | creme, não branco puro |
| Azul | `#639BB4` | ✅ | **dessaturado** — não usar `#2b4fb8` vivo |
| Vermelho base | `#6C080C` | ✅ | vinho profundo — não usar `#e23a2e` vivo |

**Diferença-chave vs. o que estava no código:** os CTAs usavam `brand-blue
#2b4fb8` e `brand-red #e23a2e` (vivos/saturados). A logo é **mais dessaturada e
escura**. E o stroke de 2.5px era fino: a logo tem contorno proporcionalmente
muito mais grosso.

**Receita CSS do aspecto (code):**
- Gradiente de **fundo do botão** vertical `#639BB4` (topo) → `#6C080C` (base) — espelha a logo.
- Texto Rubik Spray Paint, ALL-CAPS, `letter-spacing: 0.02em`.
- `-webkit-text-stroke: 4–5px #000` + `paint-order: stroke fill` (stroke atrás do fill).
- Fill do texto creme `#F0EBE4` (não branco puro) → casa com o miolo da logo.
- `text-shadow` dupla escura para profundidade + leve glow.
- Fonte **grande** (≥18px) — a textura de spray e o stroke só "lêem" em corpo grande.

**States:** hover → leve `scale` + `opacity`; o shimmer atual pode permanecer. ❓ active não-crítico.

## 3. Reconstruction prompt (code)

> Reconstrua SÓ os botões CTA com aspecto de lettering graffiti da logo:
> fundo gradiente vertical `#639BB4`→`#6C080C`; texto em "Rubik Spray Paint"
> ALL-CAPS, fill `#F0EBE4`, `-webkit-text-stroke: 4px #000` com
> `paint-order: stroke fill`, `text-shadow` escura dupla, fonte ≥18px,
> `letter-spacing: .02em`. Renderiza sobre fundo dark `#050505`. Não usar azul/
> vermelho vivos (`#2b4fb8`/`#e23a2e`) — usar os tons dessaturados da logo.

## 4. Generative image prompt (asset — só se o CSS não bastar)

### Canonical prompt (structured)

SUBJECT: the single word "AGENDAR" in aggressive graffiti throw-up lettering, bold
  bubble/wildstyle letters with paint drips running down from the base of each letter
STYLE / MEDIUM: street graffiti / spray paint on wall, thick hand-painted black outline,
  airbrushed vertical color fade inside the letters, glossy wet-paint finish
COMPOSITION & CAMERA: word centered, tight crop, letters filling the frame edge to edge,
  straight-on view
LIGHTING: flat even light, subtle top highlight on the letter faces
PALETTE: vertical gradient inside letters from desaturated blue `#639BB4` (top) through
  cream `#F0EBE4` (middle) to deep oxblood red `#6C080C` (bottom); thick outline pure
  black `#000000`
MOOD: urban, bold, game-logo, arcade, rebellious, premium-street
BACKGROUND / INTEGRATION: isolated asset on a fully transparent background (PNG with
  alpha) — only the word, nothing else, no wall, no scenery, generous margin, ready to
  place over a dark `#050505` button
AVOID: no extra text, no watermark, no wall texture, no background of any kind, no other
  characters, no realistic brick, keep it a clean cutout

### Natural-language version

An isolated asset on a fully transparent background: the single word "AGENDAR" painted
as a bold graffiti throw-up — fat bubble/wildstyle letters with a thick pure-black
`#000000` hand-painted outline and paint drips running down from the base of each letter.
Inside the letters, a smooth vertical airbrushed fade from desaturated blue `#639BB4` at
the top, through cream `#F0EBE4` in the middle, to deep oxblood red `#6C080C` at the
bottom, with a glossy wet-paint finish and a subtle top highlight. The word is centered
and fills the frame edge to edge, straight-on view, urban game-logo / arcade mood.
Nothing else in the frame — no wall, no scenery, no other text, no background of any kind.

### Model adaptation notes

- **gpt-image / DALL-E**: use a versão natural-language; setar `background: "transparent"` na API (prosa de transparência é pouco confiável).
- **Midjourney**: condensar em frases por vírgula, `--ar 5:2` (proporção da palavra), `--style raw`. MJ não tem alpha real → gerar sobre chroma `#00FF00` e recortar.
- **SD / Flux**: tags por vírgula; jogar o bloco AVOID no negative prompt.

## 5. Consistency notes

- O **contorno preto grosso** é o "ONE brand thing" — se cortar ele pra ganhar
  legibilidade, perde o aspecto. Prefira aumentar a fonte a afinar o stroke.
- Reusar os 4 hexes da logo, não os `brand-*` vivos, em qualquer peça que queira
  "casar com a logo".
- Em texto longo ("Serviços / Produtos") o efeito pesa — considerar deixar a fonte
  graffiti só no verbo curto ("Agendar") e o resto na fonte normal.

## 6. Confidence & open questions

| Aspecto | Confiança | Por quê |
|---|---|---|
| Cores (paleta) | ✅ | extraídas por `extract_colors.py` |
| Contorno é a assinatura | ✅ | preto = 47% da área |
| Reprodução CSS do gradiente/stroke | ✅ | primitivas de CSS |
| Drips/escorrido fiel em CSS | ⚠️ | CSS não reproduz o traço de tinta; precisa SVG complexo ou imagem |
| Fonte == traço da logo | ❌ | nenhuma fonte é idêntica ao desenho; Rubik Spray Paint dá a vibe, não o traço |

> **Prompt fidelity note**: o prompt de imagem é uma descrição de alta fidelidade,
> não garantia de reprodução. Esperar 2–4 gerações; PALETTE e AVOID são as alavancas
> mais fortes. Para os botões, o caminho `code` (Seção 3) é o recomendado — só ir pra
> imagem se você quiser os drips/escorrido idênticos.
