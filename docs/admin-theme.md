# Tema do Painel Admin (Diurno / Noturno / Liquid Glass)

O painel admin tem 3 temas que o usuário escolhe em **Configurações > Tema**:

- **Liquid Glass** (padrão): cards translúcidos com blur, texto branco. Visual "vidro" sobre a imagem de fundo.
- **Noturno**: cards sólidos escuros, texto claro, sem blur.
- **Diurno**: cards sólidos claros, texto escuro, sem blur.

O tema muda **só a "casca" da UI** (cards, modais, inputs, navbar). A **imagem de fundo é fixa** nos 3 modos (overlay escuro sutil `bg-slate-950/40` que NÃO muda com o tema).

## Como funciona

- A preferência é salva em Firestore (`userPreferences/{uid}.theme`) via `src/lib/user-theme.ts`.
- O hook `src/hooks/useAdminTheme.ts` lê/observa a preferência (live update via evento custom).
- `src/components/layout/AdminThemeProvider.tsx` aplica `data-theme="liquid-glass|noturno|diurno"` no `<html>`.
- Os tokens por tema vivem em `src/app/globals.css`, em blocos `[data-theme="..."]`.
- As utility classes (`admin-*`) consomem esses tokens — então **você não usa cores fixas, usa as classes**.

## Regra de ouro: dentro de card vs sobre o fundo

| Onde o elemento está | Cor de texto |
|---|---|
| **Dentro** de card/modal/navbar/input | `admin-text-primary` / `admin-text-secondary` (segue o tema) |
| **Direto sobre o fundo** (headers de página, texto de "Carregando", legendas soltas) | `text-slate-100` / `text-slate-300` **fixo branco** (o fundo é sempre escuro) |

Errar isso é o bug mais comum: no Diurno, um header que use `admin-text-primary` fica **preto sobre a foto** e some.

O mesmo vale pra **superfícies decorativas** (chip/círculo de ícone): se está **dentro** de card use `admin-surface-subtle`; se está **sobre o fundo** (ex: ícone ao lado do título da página) use `bg-white/10` fixo — senão no Diurno vira um quadrado claro com ícone sumindo.

## Classes utilitárias disponíveis

| Classe | Pra quê |
|---|---|
| `admin-glass-card` | Card / painel / input / botão-superfície. Substitui o bloco `bg-white/2 backdrop-blur-md ... border border-white/10 shadow-[...]`. |
| `admin-glass-card-hover` | Hover do card/item (`:hover`). |
| `admin-glass-card-active` | Estado `:active` (toque). |
| `admin-glass-modal` | Painel de modal. É o default do `Modal.tsx` (não precisa passar `panelClassName`). |
| `admin-text-primary` | Texto principal **dentro** de card. |
| `admin-text-secondary` | Texto secundário/label **dentro** de card. |
| `admin-surface-subtle` | Superfície decorativa interna (círculo de ícone, chip neutro). Substitui `bg-white/8`. |
| `admin-toggle-active` | Botão ativo de um segmented control / toggle. O track usa `admin-surface-subtle`. |
| `admin-divide` | No `<ul>`/container: divisor entre filhos. Substitui `divide-y divide-white/5`. |
| `admin-input` | No `<input>`/`<select>`: texto + placeholder seguindo o tema. Combine com `admin-glass-card`. |
| `admin-nav-pill` / `admin-nav-text` / `admin-nav-center` | Específicas da bottom nav. |

## O que NÃO muda por tema (manter fixo nos 3)

- **Dourado da marca**: `from-[#ece4cb] to-[#c2a35d]` (botões primários, item ativo, FAB).
- **Cores semânticas**: verde (`emerald`) pra positivo/faturado, vermelho (`red`) pra cancelar/erro, amber pra alerta/pontos, ícones coloridos por categoria, badges.

## Template de tela nova

```tsx
export default function MinhaTelaPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header — sobre o fundo, SEMPRE branco */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold text-slate-100">Título</h1>
      </div>

      {/* Card — segue o tema */}
      <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden admin-glass-card p-1">
        <button className="admin-glass-card-hover admin-glass-card-active flex items-center gap-4 w-full rounded-xl px-3 py-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
            {/* ícone colorido — fixo */}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold admin-text-primary">Label</p>
            <p className="text-xs admin-text-secondary mt-0.5">Descrição</p>
          </div>
        </button>
      </div>
    </div>
  );
}
```

## ⚠️ Turbopack: classe nova exige restart

Ao **adicionar uma classe `admin-*` nova** no `globals.css`, o Turbopack (dev) não recompila o CSS base via HMR — a classe sai sem estilo. **Reinicie o `npm run dev`** depois de criar classe nova. (Usar classe já existente não precisa de restart.)
