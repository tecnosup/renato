import { BarberService, BarberSpecialist, Testimonial } from './types';

export const SERVICES: BarberService[] = [
  {
    id: 'corte-assinatura',
    name: 'Corte de Assinatura',
    price: 90,
    duration: 45,
    description: 'Corte artesanal sob medida com consultoria de visagismo, lavagem premium com massagem capilar e finalização com pomada orgânica.',
    category: 'cabelo'
  },
  {
    id: 'fade-undercut',
    name: 'Skin Fade / Undercut',
    price: 110,
    duration: 50,
    description: 'Transição milimétrica impecável em degradê na máquina e navalha, ideal para visuais modernos e limpos.',
    category: 'cabelo'
  },
  {
    id: 'barba-toalha-quente',
    name: 'Barba com Toalha Quente',
    price: 80,
    duration: 40,
    description: 'Serviço tradicional com toalhas aquecidas em óleos essenciais de eucalipto, espuma quente batida na hora e massagem pós-barba.',
    category: 'barba'
  },
  {
    id: 'design-barba',
    name: 'Alinhamento & Design de Barba',
    price: 70,
    duration: 30,
    description: 'Alinhamento fino da estrutura da barba com navalha e hidratação profunda com balm protetor de fios.',
    category: 'barba'
  },
  {
    id: 'detox-capilar',
    name: 'Tratamento Capilar Detox',
    price: 120,
    duration: 60,
    description: 'Esfoliação para remoção de impurezas do couro cabeludo, hidratação capilar vaporizada e tônico estimulador de crescimento.',
    category: 'tratamento'
  },
  {
    id: 'combo-nobre',
    name: 'Corte & Barba Premium',
    price: 160,
    duration: 80,
    description: 'A experiência completa: Corte de Assinatura combinado ao tradicional serviço de barba com toalha quente e argila regeneradora.',
    category: 'tratamento'
  }
];

export const BARBERS: BarberSpecialist[] = [
  {
    id: 'enzo-rossi',
    name: 'Enzo "O Artista" Rossi',
    role: 'Barbeiro Especialista',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&h=400&fit=crop&auto=format',
    bio: 'Treinado em Milão, Enzo funde técnicas clássicas do século passado com o visagismo moderno florentino.',
    specialties: ['Corte Clássico', 'Barba Tradicional', 'Visagismo']
  },
  {
    id: 'vito-moretti',
    name: 'Vito "The Fade" Moretti',
    role: 'Especialista em Degradê',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&fit=crop&auto=format',
    bio: 'Focado em precisão geométrica e as últimas tendências mundiais de fade, texturizações e estilos urbanos.',
    specialties: ['Nappy Fade', 'Razer Part', 'Esculpir Barba']
  },
  {
    id: 'helena-silva',
    name: 'Helena "Visagista" Silva',
    role: 'Diretora Criativa',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&fit=crop&auto=format',
    bio: 'Especializada em estética facial e terapia capilar, garantindo cortes que harmonizam perfeitamente com cada fisionomia.',
    specialties: ['Terapia do Couro Cabeludo', 'Acabamento Navalhado', 'Modelagem']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Marcus Vinícius',
    role: 'CEO & Cliente VIP',
    text: 'A experiência da toalha quente é um portal no tempo. Relaxamento total e navalhar impecável.',
    rating: 5
  },
  {
    id: 't2',
    name: 'Eduardo Gamarra',
    role: 'Designer',
    text: 'O design visual brutalista do local de traduz na tela e no atendimento. Helen é extraordinária com visagismo.',
    rating: 5
  },
  {
    id: 't3',
    name: 'Thiago Mendes',
    role: 'Atleta',
    text: 'O corte fade do Vito Moretti dura muito mais do que qualquer outro lugar. A precisão milimétrica é assustadora.',
    rating: 5
  }
];
