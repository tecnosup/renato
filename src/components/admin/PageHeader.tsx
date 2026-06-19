import type { ComponentType, ReactNode } from "react";

/**
 * Cabeçalho padrão das telas do admin: box de ícone (dourado) + título +
 * subtítulo, com uma ação opcional à direita. Mesmo padrão em todas as páginas.
 * Texto fica sobre o fundo → branco fixo (slate-100/300), seguindo a regra do
 * tema. Aceita ícone lucide ou react-icons.
 *
 * `className` controla o espaçamento externo, porque cada página pad de um jeito:
 * - tela sem padding no root (ex: Caixa): use o default "px-4 pt-5 pb-4".
 * - tela com root já padded (ex: cadastros com p-4): passe "mb-5".
 */
export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
  className = "px-4 pt-5 pb-4",
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="admin-glass-card transform-gpu w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-slate-100 leading-none truncate">{title}</p>
        {subtitle && (
          <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
