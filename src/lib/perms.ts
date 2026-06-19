import type { Permissions } from "@/lib/types";

/**
 * Rótulos amigáveis de cada permissão, na ordem de exibição. Fonte única usada
 * tanto no modal de acesso (por funcionário) quanto no "Avançado" das categorias.
 */
export const PERM_LABELS: { key: keyof Permissions; label: string; desc: string }[] = [
  { key: "verAgendaPropria", label: "Agenda própria", desc: "Ver os agendamentos dele" },
  { key: "verAgendaTodos", label: "Agenda de todos", desc: "Ver a agenda de todos os barbeiros" },
  { key: "verCaixa", label: "Caixa", desc: "Abrir, conferir e fechar o caixa" },
  { key: "verFinanceiroProprio", label: "Meu Financeiro", desc: "Ver as próprias comandas, atendimentos e comissão" },
  { key: "verFinanceiroGeral", label: "Financeiro geral", desc: "Faturamento da barbearia inteira" },
  { key: "fecharComandas", label: "Registrar pagamento", desc: "Pode fechar comandas e registrar forma de pagamento" },
  { key: "escolherBarbeiroComanda", label: "Comanda p/ qualquer barbeiro", desc: "Ao abrir comanda, escolher para qual barbeiro (atendimento presencial)" },
  { key: "gerenciarFuncionarios", label: "Gerenciar funcionários", desc: "Criar e editar acessos" },
  { key: "gerenciarCadastros", label: "Cadastros", desc: "Serviços, produtos, clientes, cupons" },
  { key: "gerenciarGrade", label: "Configurar grade", desc: "Editar horários e bloqueios da própria agenda" },
];
