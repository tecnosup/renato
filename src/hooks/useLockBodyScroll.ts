import { useEffect } from "react";

/**
 * Trava o scroll do <body> enquanto `active` for true (modal/overlay aberto).
 *
 * - Compensa a largura da scrollbar com `padding-right` no body, para o conteúdo
 *   não "pular" lateralmente no instante em que a barra de rolagem some.
 * - Restaura os valores originais ao desativar ou desmontar.
 * - Empilha com segurança: cada modal guarda o estado anterior e o restaura, então
 *   abrir um modal sobre outro não "destrava" o de baixo ao fechar o de cima.
 *
 * Usado por todos os modais da landing para que o fundo não role enquanto abertos
 * (o usuário só sai pelo X). Centraliza o que antes era duplicado inline.
 */
export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement } = document;

    const prevHtmlOverflow = documentElement.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    // Largura da scrollbar = diferença entre a janela e a área de conteúdo.
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    // O globals.css define `html { overflow-x: hidden }`, o que torna o <html>
    // (documentElement) o contêiner de rolagem vertical da landing — travar só o
    // <body> não segura a página. Por isso travamos os dois.
    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      documentElement.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [active]);
}
