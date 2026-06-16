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
