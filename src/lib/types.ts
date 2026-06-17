export interface BarberService {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  category: 'cabelo' | 'barba' | 'tratamento';
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
