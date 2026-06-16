import type { Permissions } from "@/lib/types";

/**
 * Autorizacao central (rotas e itens de menu). Fonte unica de verdade para
 * "quem pode ver o que". Usado pelo proxy (servidor) e pela Sidebar (client).
 *
 * O proprietario "raiz" (primeiro login, SEM custom claims) ve tudo: quando
 * `perms` e undefined, `can()` retorna sempre true.
 */

export type PermKey = keyof Permissions;

/** Pode acessar dada permissao? Owner raiz (perms undefined) pode tudo. */
export function can(perms: Permissions | undefined, key: PermKey): boolean {
  if (!perms) return true; // owner raiz
  return perms[key] === true;
}

/**
 * Mapa rota -> permissao exigida. A primeira entrada que casar (por prefixo)
 * define a regra. Ordem importa: rotas mais especificas antes das genericas.
 * Rotas nao listadas (ex: /admin = agenda) sao liberadas para qualquer logado.
 */
const ROUTE_RULES: { prefix: string; perm: PermKey }[] = [
  { prefix: "/admin/cadastros/funcionarios", perm: "gerenciarFuncionarios" },
  { prefix: "/admin/financeiro/caixa", perm: "verCaixa" },
  { prefix: "/admin/financeiro/comissoes", perm: "verFinanceiroProprio" },
  { prefix: "/admin/financeiro", perm: "verFinanceiroGeral" },
  { prefix: "/admin/cadastros", perm: "gerenciarCadastros" },
];

/** Permissao exigida por uma rota, ou null se for livre para qualquer logado. */
export function requiredPermForPath(pathname: string): PermKey | null {
  const rule = ROUTE_RULES.find((r) => pathname.startsWith(r.prefix));
  return rule ? rule.perm : null;
}

/** O usuario (perms) pode navegar para essa rota? */
export function canAccessPath(perms: Permissions | undefined, pathname: string): boolean {
  const needed = requiredPermForPath(pathname);
  if (!needed) return true;
  return can(perms, needed);
}

/** Rota "segura" para redirecionar quem caiu numa pagina sem permissao. */
export const FALLBACK_PATH = "/admin";
