export type ServiceCategory = 'cabelo' | 'barba' | 'tratamento';

export interface BarberService {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  category: ServiceCategory;
  /**
   * Serviço visível na landing/agendamento. Inativo = soft delete.
   * Opcional para compatibilidade com o catálogo legado de data.ts; serviços
   * vindos do Firestore sempre preenchem (ver lib/services.ts).
   */
  active?: boolean;
  /** Ordem de exibição (menor primeiro). Opcional pelo mesmo motivo. */
  order?: number;
}

/** Dados que o formulário envia ao criar/editar um serviço. */
export interface ServiceInput {
  name: string;
  price: number;
  duration: number;
  description: string;
  category: ServiceCategory;
  active: boolean;
  order: number;
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
  },
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
}

/** Documento de agendamento como persistido no Firestore (coleção `appointments`). */
export interface Appointment extends AppointmentInput {
  id: string;
  status: AppointmentStatus;
  createdAt: number; // epoch ms (serverTimestamp resolvido no cliente)
}
