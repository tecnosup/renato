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

export interface Appointment {
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
}
