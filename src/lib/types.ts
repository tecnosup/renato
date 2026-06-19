export type ServiceCategory = 'cabelo' | 'barba' | 'tratamento';

/**
 * Categoria dinâmica (coleção Firestore `categories`), gerenciável pelo Renato.
 * `type` separa as de serviço das de produto. Os enums legados de serviço
 * (`cabelo`/`barba`/`tratamento`) viram seed com ids previsíveis (ver
 * lib/categories.ts), permitindo a migração suave do campo antigo.
 */
export type CategoryType = 'servico' | 'produto';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  active: boolean;
  order: number;
}

/** Dados que o formulário envia ao criar/editar uma categoria. */
export interface CategoryInput {
  name: string;
  type: CategoryType;
  active: boolean;
  order: number;
}

export interface BarberService {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  /**
   * Categoria legada (enum fixo). Mantida para compatibilidade; o código novo
   * prefere `categoryId` quando presente. Serviços antigos só têm este campo.
   */
  category: ServiceCategory;
  /** Categoria dinâmica (id em `categories`). Preenchido após a migração. */
  categoryId?: string;
  /**
   * Serviço visível na landing/agendamento. Inativo = soft delete.
   * Opcional para compatibilidade com o catálogo legado de data.ts; serviços
   * vindos do Firestore sempre preenchem (ver lib/services.ts).
   */
  active?: boolean;
  /** Ordem de exibição (menor primeiro). Opcional pelo mesmo motivo. */
  order?: number;
  /** Foto do serviço (Cloudflare R2). Opcional — nem todo serviço tem foto. */
  imageUrl?: string;
}

/** Dados que o formulário envia ao criar/editar um serviço. */
export interface ServiceInput {
  name: string;
  price: number;
  duration: number;
  description: string;
  category: ServiceCategory;
  categoryId?: string;
  active: boolean;
  order: number;
  imageUrl?: string;
}

/**
 * Produto (cosmético) da barbearia — coleção Firestore `products`.
 *
 * Hoje a landing usa só para VITRINE (catálogo visual). O cadastro já carrega
 * `stock` e `cost` para a INTEGRAÇÃO FUTURA COM COMANDAS (a cargo do Vitor):
 * ao vender na comanda, debita-se `stock` e usa-se `price`/`cost` para
 * faturamento e margem. Schema documentado em docs/produtos.md.
 */
export interface Product {
  id: string;
  name: string;
  /** Preço de venda ao cliente (R$). */
  price: number;
  /** Custo de aquisição (R$) — base do cálculo de margem. */
  cost: number;
  /** Quantidade atual em estoque (unidades). */
  stock: number;
  /** Volume/medida exibido (ex: "100g", "250ml"). */
  volume: string;
  description: string;
  /** Produto visível na vitrine da landing. Inativo = soft delete. */
  active: boolean;
  /** Ordem de exibição (menor primeiro). */
  order: number;
  /** Categoria dinâmica (id em `categories`, type "produto"). Opcional. */
  categoryId?: string;
  /** Foto do produto (Cloudflare R2). Opcional até o upload entrar em uso. */
  imageUrl?: string;
}

/** Dados que o formulário envia ao criar/editar um produto. */
export interface ProductInput {
  name: string;
  price: number;
  cost: number;
  stock: number;
  volume: string;
  description: string;
  active: boolean;
  order: number;
  categoryId?: string;
  imageUrl?: string;
}

export interface BarberSpecialist {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  specialties: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

/** Cargo do funcionário. Tambem usado como preset de permissoes (ver perms). */
export type EmployeeRole = "barbeiro" | "recepcionista" | "gerente";

/**
 * Permissoes granulares por funcionario. O papel define um preset (ver
 * ROLE_PRESETS), mas cada toggle pode ser ajustado individualmente.
 * Verificadas em 3 camadas: UI, rotas e Firestore Rules (ver docs/rbac-acessos.md).
 */
export interface Permissions {
  verAgendaPropria: boolean;
  verAgendaTodos: boolean;
  verCaixa: boolean;
  verFinanceiroProprio: boolean;
  verFinanceiroGeral: boolean;
  gerenciarFuncionarios: boolean;
  gerenciarCadastros: boolean;
  gerenciarGrade: boolean;
  fecharComandas: boolean;
  /** Ao abrir comanda, escolher PARA QUAL barbeiro (atendimento presencial). */
  escolherBarbeiroComanda: boolean;
}

/** Configuração de um dia da semana na grade do barbeiro. */
export interface DaySchedule {
  open: boolean;
  start: string;   // "HH:mm"
  end: string;     // "HH:mm"
  breakStart?: string; // "HH:mm" — início da pausa
  breakEnd?: string;   // "HH:mm" — fim da pausa
}

/**
 * Grade semanal de um barbeiro (documento `schedules/{barberId}`).
 * Chave: 0=Dom, 1=Seg, ..., 6=Sáb.
 */
export type WeeklySchedule = Record<number, DaySchedule>;

/** Bloqueio pontual de slot (coleção `blockedSlots`). */
export interface BlockedSlot {
  id: string;
  barberId: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
}

/** Preset de permissoes aplicado ao escolher um cargo (editavel depois). */
export const ROLE_PRESETS: Record<EmployeeRole, Permissions> = {
  gerente: {
    verAgendaPropria: true,
    verAgendaTodos: true,
    verCaixa: true,
    verFinanceiroProprio: true,
    verFinanceiroGeral: true,
    gerenciarFuncionarios: true,
    gerenciarCadastros: true,
    gerenciarGrade: true,
    fecharComandas: true,
    escolherBarbeiroComanda: true,
  },
  recepcionista: {
    verAgendaPropria: true,
    verAgendaTodos: true,
    verCaixa: true,
    verFinanceiroProprio: false,
    verFinanceiroGeral: false,
    gerenciarFuncionarios: false,
    gerenciarCadastros: true,
    gerenciarGrade: true,
    fecharComandas: true,
    escolherBarbeiroComanda: true,
  },
  barbeiro: {
    verAgendaPropria: true,
    verAgendaTodos: false,
    verCaixa: false,
    verFinanceiroProprio: true,
    verFinanceiroGeral: false,
    gerenciarFuncionarios: false,
    gerenciarCadastros: false,
    gerenciarGrade: true,
    fecharComandas: false,
    escolherBarbeiroComanda: false,
  },
};

/** Acesso total — todas as permissões ligadas. Usado pelo botão "Acesso total". */
export const FULL_PERMS: Permissions = {
  verAgendaPropria: true,
  verAgendaTodos: true,
  verCaixa: true,
  verFinanceiroProprio: true,
  verFinanceiroGeral: true,
  gerenciarFuncionarios: true,
  gerenciarCadastros: true,
  gerenciarGrade: true,
  fecharComandas: true,
  escolherBarbeiroComanda: true,
};

/** Dados que o formulário envia ao criar/editar um funcionário. */
export interface EmployeeInput {
  name: string;
  role: EmployeeRole;
  phone: string;
  active: boolean;
}

/** Documento de funcionário no Firestore (coleção `barbers`). */
export interface Employee extends EmployeeInput {
  id: string;
  createdAt: number; // epoch ms
  /** uid do Firebase Auth quando o funcionario TEM acesso. null = sem login. */
  authUid?: string | null;
  /** email do login, quando ha acesso. */
  email?: string | null;
  /** permissoes efetivas (so relevante quando ha acesso). */
  perms?: Permissions;
}

export type AppointmentStatus =
  | "pendente"
  | "agendado"
  | "concluido"
  | "cancelado";

export type AppointmentOrigin = "landing" | "admin";

/** Dados que o formulário envia ao criar um agendamento. */
export interface AppointmentInput {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  barberId: string;
  barberName: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  customerName: string;
  customerPhone: string;
  origin: AppointmentOrigin;
  /**
   * Itens do agendamento (serviços + produtos do catálogo). Opcional para
   * compatibilidade com a landing, que envia só o serviço principal nos campos
   * `service*`. No admin, alimenta a comanda que o agendamento gera. Quando
   * presente, `serviceName`/`servicePrice` derivam dele (1º serviço + total).
   */
  items?: ComandaItem[];
}

/** Documento de agendamento como persistido no Firestore (coleção `appointments`). */
export interface Appointment extends AppointmentInput {
  id: string;
  status: AppointmentStatus;
  createdAt: number; // epoch ms (serverTimestamp resolvido no cliente)
}

// ─── Comandas ─────────────────────────────────────────────────────────────────

export type ComandaStatus = "aberta" | "pagamento_pendente" | "paga" | "cancelada";
export type ComandaItemTipo = "servico" | "produto";
/** De onde a comanda nasceu: junto de um agendamento, ou avulsa (walk-in). */
export type ComandaOrigem = "agendamento" | "avulsa";

/** Item de uma comanda (serviço ou produto). Preço congelado no momento da adição. */
export interface ComandaItem {
  id: string; // id local do item (para remover/editar dentro da comanda)
  tipo: ComandaItemTipo;
  refId: string; // id do serviço/produto no catálogo
  nome: string;
  preco: number; // preço unitário
  qtd: number;
}

/** Dados que o formulário/automação envia ao criar uma comanda. */
export interface ComandaInput {
  customerName: string;
  customerPhone?: string;
  barberId: string;
  barberName: string;
  origem: ComandaOrigem;
  appointmentId?: string; // vínculo com o agendamento que a gerou
  items: ComandaItem[];
}

/** Documento de comanda no Firestore (coleção `comandas`). */
export interface Comanda extends ComandaInput {
  id: string;
  status: ComandaStatus;
  total: number;
  createdAt: number; // epoch ms
  closedAt?: number; // epoch ms (quando paga/cancelada)
  formaPagamento?: string;
}
