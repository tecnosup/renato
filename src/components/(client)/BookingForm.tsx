"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES } from '@/lib/data';
import { BarberService, BarberSpecialist, Employee } from '@/lib/types';
import { subscribeToEmployees } from '@/lib/employees';
import { 
  Sparkles, 
  Check, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Sparkle, 
  Tag, 
  Scissors, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Info,
  CalendarDays
} from 'lucide-react';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// Special virtual barber representing "Any Available" as seen in Ortega Barber
const ANY_BARBER: BarberSpecialist = {
  id: 'qualquer',
  name: 'Qualquer Disponível',
  role: 'O próximo barbeiro disponível',
  avatar: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=400&h=400&fit=crop&auto=format',
  bio: 'Selecione esta opção para agendar com o profissional que tiver o horário disponível mais próximo.',
  specialties: ['Agilidade', 'Maestria', 'Precisão']
};

export default function BookingForm({ isOpen, onClose }: BookingFormProps) {
  // Navigation & step control (1: Service, 2: Barber, 3: Date & Time, 4: Personal Info/Details)
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1); // 1 = forward, -1 = backward
  
  // Selection states
  const [selectedService, setSelectedService] = useState<BarberService>(SERVICES[0]);
  const [selectedBarber, setSelectedBarber] = useState<BarberSpecialist>(ANY_BARBER);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Personal Info form states
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Coupon state
  const [coupon, setCoupon] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<string>('');
  const [showCouponInput, setShowCouponInput] = useState<boolean>(false);

  // Confirmation Success state
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [ticketNumber, setTicketNumber] = useState<string>('');

  // Submission / conflict state (persistencia no Firestore)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Slots disponíveis carregados do servidor (data + barbeiro selecionado)
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Barbeiros reais (Firestore, coleção `barbers`), apenas os ativos. Enquanto
  // nenhum estiver cadastrado, o seletor mostra só "Qualquer Disponível".
  const [barbers, setBarbers] = useState<BarberSpecialist[]>([]);

  useEffect(() => {
    const unsub = subscribeToEmployees((lista) => {
      setBarbers(lista.filter((e) => e.active).map(employeeToSpecialist));
    });
    return unsub;
  }, []);

  // Calendario abre no mes/ano reais de hoje.
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  // Busca slots disponíveis do servidor sempre que data ou barbeiro muda.
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots(null);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setAvailableSlots(null);
    fetch(`/api/appointments/slots?date=${selectedDate}&barberId=${selectedBarber.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setAvailableSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setAvailableSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => { cancelled = true; };
  }, [selectedDate, selectedBarber.id]);

  // Auto Scroll-to-Top on Step change inside the modal
  useEffect(() => {
    const modalContent = document.getElementById('modal-scrollable-viewport');
    if (modalContent) {
      modalContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  // Direct trigger listener from external layout clicks (Ver tratamentos -> Agendar)
  useEffect(() => {
    const handleSelectService = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const matched = SERVICES.find(s => s.id === customEvent.detail);
      if (matched) {
        setSelectedService(matched);
        setStep(2); // Automatically fast-forward to Passo 2 Choose Barber
        setDirection(1);
      }
    };
    window.addEventListener('select-service', handleSelectService);
    return () => window.removeEventListener('select-service', handleSelectService);
  }, []);

  if (!isOpen) return null;

  // Next / Prev step helper with directional animation triggers
  const goToStep = (targetStep: number) => {
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  };

  // Step 1 Click Handler (automatic advance)
  const handleSelectService = (service: BarberService) => {
    setSelectedService(service);
    goToStep(2);
  };

  // Step 2 Click Handler (automatic advance)
  const handleSelectBarber = (barber: BarberSpecialist) => {
    setSelectedBarber(barber);
    goToStep(3);
  };

  // Format phone inputs dynamically (11) 99999-9999
  const handlePhoneInput = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 0) {
      if (cleaned.length <= 2) {
        formatted = `(${cleaned}`;
      } else if (cleaned.length <= 7) {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
      } else {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
      }
    }
    setPhone(formatted);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  // Verify custom coupons
  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const cleaned = coupon.trim().toUpperCase();
    if (!cleaned) return;

    if (cleaned === 'ORTEGA10' || cleaned === 'BARBER10' || cleaned === 'VIP10') {
      setAppliedDiscount(0.10);
      setCouponSuccess('Cupom "10% OFF" aplicado com sucesso!');
    } else if (cleaned === 'SECULO20' || cleaned === 'MASTER20') {
      setAppliedDiscount(0.20);
      setCouponSuccess('Cupom "20% OFF" de alta-costura aplicado!');
    } else {
      setCouponError('Cupom inválido para esta assinatura.');
    }
  };

  // Calendar generators
  const weekdayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate calendar grid array
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysCount; d++) {
    calendarCells.push(d);
  }

  // Nao deixa navegar para antes do mes atual (nada a agendar no passado).
  const isAtCurrentMonth = (() => {
    const now = new Date();
    return currentYear === now.getFullYear() && currentMonth === now.getMonth();
  })();

  // Handle Calendar Nav
  const handlePrevMonth = () => {
    if (isAtCurrentMonth) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Bloqueia dias anteriores a hoje. Hoje continua agendavel (compara com as
  // horas zeradas, senao "hoje 00:00 < agora" bloquearia o proprio dia).
  const isDatePast = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(currentYear, currentMonth, day);
    return dateToCheck < today;
  };

  // Determine availability status based on day of week to look authentic
  const getSimulatedAvailability = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    const dayOfWeek = checkDate.getDay();

    if (dayOfWeek === 0) return 'lotado'; // Sunday is closed
    if (dayOfWeek === 6) return 'poucos'; // Saturday is busy
    return 'disponivel'; // Weekdays are good
  };

  // Slots disponíveis: vêm do servidor (já filtrados por grade, bloqueios e agendamentos).
  // Para hoje, remove também os horários que já passaram (30 min de folga mínima).
  const getTimeSlotsForDate = (): string[] => {
    if (!selectedDate || !availableSlots) return [];

    const now = new Date();
    const todayStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (selectedDate === todayStamp) {
      const limite = now.getHours() * 60 + now.getMinutes() + 30;
      return availableSlots.filter((s) => {
        const [h, m] = s.split(':').map(Number);
        return h * 60 + m >= limite;
      });
    }

    return availableSlots;
  };

  // Parse Date string into visual text: e.g. "Quinta-Feira, 11 De Junho"
  const getFormattedDateLong = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekdayName = [
      'Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'
    ][dateObj.getDay()];
    const monthName = monthNames[dateObj.getMonth()];
    return `${weekdayName}, ${day} de ${monthName}`;
  };

  // Validation + persistencia no Firestore (com anti-conflito de horario)
  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Por favor, digite seu nome completo.';
    }
    if (!phone.trim() || phone.length < 14) {
      newErrors.phone = 'WhatsApp inválido. Ex formato: (11) 99999-9999';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const finalPrice = Math.round(selectedService.price * (1 - appliedDiscount));

      // Anti-conflito + criacao acontecem NO SERVIDOR (a landing anonima nao le
      // a colecao appointments — dados de clientes ficam privados nas rules).
      const res = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          servicePrice: finalPrice,
          barberId: selectedBarber.id,
          barberName: selectedBarber.name,
          date: selectedDate,
          time: selectedTime,
          customerName: name.trim(),
          customerPhone: phone,
          origin: 'landing',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({
          slot: data.error ?? 'Não foi possível concluir o agendamento agora. Tente novamente em instantes.',
        });
        setIsSubmitting(false);
        return;
      }

      const randomTicket = 'BC-' + Math.floor(100000 + Math.random() * 900000);
      setTicketNumber(randomTicket);
      setIsSuccess(true);

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          title: 'RITUAL AGENDADO',
          message: `Olá ${name.trim()}, seu agendamento de "${selectedService.name}" foi concluído para hoje ou dia selecionado (${formatSelectedShortDate(selectedDate)}) às ${selectedTime}h com ${selectedBarber.name.split(' "')[0]}. Voucher: ${randomTicket}`,
          type: 'success'
        }
      }));
    } catch (err) {
      console.error('Failed to persist appointment:', err);
      setErrors({
        slot: 'Não foi possível concluir o agendamento agora. Tente novamente em instantes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndRestart = () => {
    setStep(1);
    setSelectedService(SERVICES[0]);
    setSelectedBarber(ANY_BARBER);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots(null);
    setName('');
    setPhone('');
    setCoupon('');
    setAppliedDiscount(0);
    setCouponSuccess('');
    setCouponError('');
    setIsSuccess(false);
  };

  // Transition animations
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.25, ease: 'easeOut' as any }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.2, ease: 'easeIn' as any }
    })
  };

  const discountedPrice = selectedService.price * (1 - appliedDiscount);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md" id="reservar-modal">
      
      <div 
        className="transform-gpu relative bg-white/3 backdrop-blur-2xl backdrop-saturate-100 border border-white/15 rounded-t-3xl md:rounded-2xl w-full md:max-w-xl h-[90vh] md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_6px_rgba(0,0,0,0.1),0_4px_20px_rgba(0,0,0,0.35)]"
        id="app-booking-frame"
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-2xl z-10 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 -ml-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-sans font-semibold text-sm tracking-wide text-slate-100 uppercase">
              {step === 4 ? 'Confirmar Ritual' : 'Agendar Ritual'}
            </h2>
          </div>
        </div>

        {/* Outer Scrollable body section */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6"
          style={{ scrollBehavior: 'smooth' }}
          id="modal-scrollable-viewport"
        >
          <div className="w-full max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <div className="space-y-4">
                
                {/* Step Indicators exactly aligned with Ortega Barber mockup */}
                <div className="flex flex-col items-center justify-center mb-4">
                  {/* Circle nodes indicators */}
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4].map((sIndex) => (
                      <React.Fragment key={sIndex}>
                        {sIndex > 1 && (
                          <div className={`h-[1px] w-5 rounded-full transition-colors duration-300 ${
                            step >= sIndex ? 'bg-gold' : 'bg-white/10'
                          }`} />
                        )}
                        <button
                          type="button"
                          disabled={sIndex > step}
                          onClick={() => goToStep(sIndex)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold transition-all duration-300 ${
                            step === sIndex 
                              ? 'bg-linear-to-br from-[#ece4cb] to-[#c2a35d] text-slate-950 scale-105 shadow-[0_0_10px_rgba(194,163,93,0.3)]' 
                              : step > sIndex 
                                ? 'bg-gold/15 text-gold border border-gold/30' 
                                : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                          }`}
                        >
                          {step > sIndex ? '✓' : sIndex}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 justify-center leading-none">
                    <span className="font-mono text-[8px] text-[#c2a35d]/80 tracking-widest font-bold uppercase">
                      Passo {step}/4 •
                    </span>
                    <h1 className="font-sans font-black text-sm text-white uppercase tracking-wider select-none">
                      {step === 1 && "Escolha o serviço"}
                      {step === 2 && "Escolha o barbeiro"}
                      {step === 3 && (selectedDate ? "Escolha o Horário" : "Escolha a Data")}
                      {step === 4 && "Preencha seus dados"}
                    </h1>
                  </div>
                </div>

                {/* Sliding Layout Content Wrapper */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full"
                  >
                    {/* STEP 1: SERVICES CATALOGUE GRID */}
                    {step === 1 && (
                      <div className="space-y-2" id="app-step-services">
                        {SERVICES.map((srv) => (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => handleSelectService(srv)}
                            className={`w-full p-3 text-left rounded-xl border transition-all duration-200 cursor-pointer relative flex items-center justify-between group overflow-hidden ${
                              selectedService?.id === srv.id
                                ? 'bg-gold/10 border-gold shadow-[inset_0_0_15px_rgba(194,163,93,0.15)]'
                                : 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-gold/30'
                            }`}
                          >
                            <div className="flex flex-col text-left pr-4">
                              <h3 className="font-sans font-semibold text-sm text-slate-100 group-hover:text-gold transition-colors">{srv.name}</h3>
                              <span className="font-sans text-[10px] text-zinc-500 font-normal leading-tight mt-0.5 line-clamp-1">
                                {srv.description}
                              </span>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end justify-center min-w-[65px]">
                              <span className="font-sans font-extrabold text-xs text-gold">R$ {srv.price}</span>
                              <span className="font-mono text-[8px] text-zinc-500">{srv.duration} min</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* STEP 2: BARBERS CATALOGUE */}
                    {step === 2 && (
                      <div className="space-y-3" id="app-step-barbers">
                        <div className="grid grid-cols-2 gap-2">
                          {/* ANY_BARBER Card */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSelectBarber(ANY_BARBER); }}
                            className={`p-3 text-left rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-[95px] group relative overflow-hidden ${
                              selectedBarber?.id === 'qualquer'
                                ? 'bg-gold/10 border-gold shadow-[inset_0_0_15px_rgba(194,163,93,0.15)]'
                                : 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-gold/30'
                            }`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center text-gold">
                                <Scissors className="w-3.5 h-3.5 rotate-45" />
                              </div>
                              {selectedBarber?.id === 'qualquer' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block animate-pulse" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-sans font-bold text-[10px] uppercase tracking-wider text-zinc-100 group-hover:text-gold leading-tight">
                                Qualquer Disponível
                              </h4>
                              <p className="font-sans text-[8.5px] text-zinc-500 font-normal leading-none mt-0.5">
                                Próximo horário
                              </p>
                            </div>
                          </button>

                          {/* BARBERS Cards (vindos do Firestore) */}
                          {barbers.map((barb) => (
                            <button
                              key={barb.id}
                              type="button"
                              onClick={() => handleSelectBarber(barb)}
                              className={`p-3 text-left rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-[95px] group relative overflow-hidden ${
                                selectedBarber?.id === barb.id
                                  ? 'bg-gold/10 border-gold shadow-[inset_0_0_15px_rgba(194,163,93,0.15)]'
                                  : 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-gold/30'
                              }`}
                            >
                              <div className="flex justify-between items-start w-full">
                                <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center text-gold text-[9px] font-bold uppercase">
                                  {barb.name.trim().split(' ').slice(0, 2).map((n) => n[0] ?? '').join('')}
                                </div>
                                {selectedBarber?.id === barb.id && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block animate-pulse" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-sans font-bold text-[10px] uppercase tracking-wider text-zinc-150 group-hover:text-gold leading-tight truncate">
                                  {barb.name}
                                </h4>
                                <p className="font-sans text-[8px] text-[#c2a35d] font-bold uppercase mt-0.5">
                                  {barb.role}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Back control */}
                        <div className="pt-2 flex justify-center">
                          <button
                            type="button"
                            onClick={() => goToStep(1)}
                            className="font-mono text-[9px] uppercase text-[#c2a35d] hover:text-white transition-colors py-1 flex items-center gap-1 cursor-pointer"
                          >
                            ← Voltar para Serviços
                          </button>
                        </div>
                      </div>
                    )}                       {/* STEP 3: CALENDAR & HOURS */}
                    {step === 3 && (
                      <div className="space-y-4" id="app-step-date-time">
                        {/* Dynamic selected service summary header with "Trocar" trigger */}
                        <div className="bg-white/5 backdrop-blur-md p-3 border border-white/10 rounded-xl flex justify-between items-center text-xs select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                          <div className="flex flex-col text-left leading-tight">
                            <span className="font-mono text-[8px] text-gold uppercase block leading-none mb-1 font-bold">SERVIÇO ESCOLHIDO</span>
                            <span className="font-sans font-semibold text-slate-100 uppercase text-[11px]">
                              {selectedService.name} <span className="text-emerald-400 font-bold ml-1.5">R$ {selectedService.price}</span>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => goToStep(1)}
                            className="text-gold hover:text-white font-mono text-[9px] tracking-widest uppercase py-1 px-2.5 rounded border border-white/10 hover:border-gold bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                          >
                            Trocar
                          </button>
                        </div>

                        {!selectedDate ? (
                          /* Render compact calendar */
                          <div className="bg-white/5 backdrop-blur-md p-3 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl relative" id="app-calendar-box">
                            {/* Navigation */}
                            <div className="flex justify-between items-center mb-2.5 select-none">
                              <button
                                type="button"
                                onClick={handlePrevMonth}
                                disabled={isAtCurrentMonth}
                                className="w-7 h-7 rounded-full border border-zinc-805 hover:border-gold hover:text-gold flex items-center justify-center transition-all cursor-pointer text-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-805 disabled:hover:text-zinc-500"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              
                              <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-zinc-200">
                                {monthNames[currentMonth]} {currentYear}
                              </span>

                              <button
                                type="button"
                                onClick={handleNextMonth}
                                className="w-7 h-7 rounded-full border border-zinc-855 hover:border-gold hover:text-gold flex items-center justify-center transition-all cursor-pointer text-zinc-500"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Weekday names */}
                            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[8px] text-[#c2a35d]/70 font-bold uppercase select-none border-b border-zinc-900 pb-1.5 mb-1.5">
                              {weekdayNames.map((w, wi) => (
                                <span key={wi}>{w}</span>
                              ))}
                            </div>

                            {/* Cells */}
                            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
                              {calendarCells.map((dayNum, cIdx) => {
                                if (dayNum === null) {
                                  return <span key={cIdx} className="block" />;
                                }

                                const dateStamp = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                const isPast = isDatePast(dayNum);
                                const status = getSimulatedAvailability(dayNum);
                                const isSelected = selectedDate === dateStamp;

                                return (
                                  <button
                                    key={cIdx}
                                    type="button"
                                    disabled={isPast || status === 'lotado'}
                                    onClick={() => {
                                      setSelectedDate(dateStamp);
                                      setSelectedTime(''); // Reset selected time on date change
                                    }}
                                    className={`aspect-square w-full rounded-lg flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer text-[10px] ${
                                      isSelected 
                                        ? 'bg-gold text-black font-extrabold shadow-md shadow-gold/10' 
                                        : isPast || status === 'lotado' 
                                          ? 'text-zinc-750 cursor-not-allowed opacity-20 bg-[#16181a]/10' 
                                          : 'hover:border-gold/35 hover:bg-zinc-900 border border-transparent bg-[#14161a]'
                                    }`}
                                  >
                                    <span>{dayNum}</span>
                                    {!isPast && (
                                      <div className="absolute bottom-0.5 w-3 h-[1.5px] flex justify-center">
                                        <div className={`w-full h-full rounded ${
                                          isSelected 
                                            ? 'bg-black/60' 
                                            : status === 'disponivel' 
                                              ? 'bg-emerald-500' 
                                              : 'bg-amber-500'
                                        }`} />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Legend */}
                            <div className="flex gap-3 justify-center items-center font-mono text-[7px] text-zinc-500 mt-3 select-none pt-1.5 border-t border-zinc-900">
                              <span className="flex items-center gap-0.5">
                                <span className="w-1.5 h-[1.5px] bg-emerald-500 rounded-full" />
                                Disponível
                              </span>
                              <span className="flex items-center gap-0.5">
                                <span className="w-1.5 h-[1.5px] bg-amber-500 rounded-full" />
                                Poucos
                              </span>
                              <span className="flex items-center gap-0.5">
                                <span className="w-1.5 h-[1.5px] bg-zinc-600 rounded-full" />
                                Lotado
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* Interactive Hours list once date is selected - collapses calendar to prevent scroll! */
                          <div className="space-y-3 animation-fade-in" id="app-hours-pane">
                            <div className="bg-[#121315] p-3 border border-zinc-900 rounded-xl flex justify-between items-center text-xs select-none">
                              <div className="flex flex-col text-left leading-tight">
                                <span className="font-mono text-[8px] text-[#c2a35d] uppercase block leading-none mb-1 font-bold">DATA SELECIONADA</span>
                                <span className="font-sans text-[11px] text-zinc-200 font-semibold">{getFormattedDateLong(selectedDate)}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDate('');
                                  setSelectedTime('');
                                }}
                                className="text-zinc-500 hover:text-gold font-mono text-[8px] uppercase py-1 px-2.5 rounded border border-zinc-800 hover:border-gold/30 bg-[#0c0d0e] transition-all cursor-pointer"
                              >
                                Alterar
                              </button>
                            </div>

                            <div className="bg-[#121315] p-3 border border-zinc-900 rounded-xl">
                              <span className="font-mono text-[8px] text-[#c2a35d] uppercase block font-bold text-left mb-2.5">HORÁRIOS DISPONÍVEIS:</span>
                              {loadingSlots ? (
                                <div className="grid grid-cols-4 gap-2">
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="py-2 rounded-lg bg-white/5 animate-pulse h-8" />
                                  ))}
                                </div>
                              ) : getTimeSlotsForDate().length === 0 ? (
                                <p className="font-sans text-[10.5px] text-zinc-400 text-center py-4 leading-snug">
                                  Não há mais horários disponíveis hoje.<br />
                                  <span className="text-zinc-500">Selecione outra data.</span>
                                </p>
                              ) : (
                              <div className="grid grid-cols-4 gap-2" id="available-slots-grid">
                                {getTimeSlotsForDate().map((sh) => (
                                  <button
                                    key={sh}
                                    type="button"
                                    onClick={() => {
                                      setSelectedTime(sh);
                                      goToStep(4); // Advance to Passo 4
                                    }}
                                    className={`py-2 text-center rounded-lg font-mono text-xs border transition-all duration-150 cursor-pointer ${
                                      selectedTime === sh
                                        ? 'bg-gold text-black border-gold font-bold shadow-md shadow-gold/15'
                                        : 'bg-[#14161a] border-zinc-930 hover:border-gold/30 text-[#e2e2e2]'
                                    }`}
                                  >
                                    {sh}
                                  </button>
                                ))}
                              </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Controls back button spacer */}
                        <div className="pt-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => goToStep(2)}
                            className="font-mono text-[9px] uppercase text-[#c2a35d] hover:text-white transition-colors py-1 flex items-center gap-1 cursor-pointer"
                          >
                            ← Voltar para Barbeiros
                          </button>
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <form onSubmit={validateAndSubmit} className="space-y-4" id="app-step-personal-form">
                        
                        {/* Compact Visual Summary Header */}
                        <div className="bg-white/5 backdrop-blur-md p-3 border border-white/10 rounded-xl text-left text-xs flex justify-between items-center relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" id="booking-summary-receipt">
                          <div className="flex flex-col">
                            <span className="font-mono text-[8px] text-gold uppercase block mb-0.5 font-bold">RESUMO DO RITUAL</span>
                            <span className="font-sans font-black text-xs text-slate-100 uppercase leading-none">
                              {selectedService.name}
                            </span>
                            <span className="font-sans text-[10.5px] text-slate-400 mt-1">
                              Com {selectedBarber.name.split(' "')[0]} • {selectedTime}hs no dia {selectedDate ? formatSelectedShortDate(selectedDate) : ''}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-[8px] text-slate-500 uppercase block mb-0.5">TOTAL</span>
                            <span className="font-sans font-bold text-xs text-gold">
                              {appliedDiscount > 0 ? (
                                <div className="flex flex-col items-end leading-none">
                                  <span className="text-slate-500 line-through text-[9px] font-normal">R$ {selectedService.price}</span>
                                  <span className="text-gold mt-0.5">R$ {discountedPrice.toFixed(0)},00</span>
                                </div>
                              ) : (
                                <span>R$ {selectedService.price},00</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Customer Information Inputs Form side by side/compact */}
                        <div className="space-y-3">
                          <div className="space-y-1 text-left">
                            <label className="font-mono text-[8.5px] text-gold/85 font-bold tracking-wider block uppercase select-none">Seu Nome completo</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold/50" />
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                  setName(e.target.value);
                                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                }}
                                placeholder="Seu nome"
                                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg py-2 pl-8.5 pr-3 text-xs font-sans text-slate-100 focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all placeholder:text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                              />
                            </div>
                            {errors.name && <p className="text-rose-400 font-mono text-[9px] mt-0.5 leading-none">{errors.name}</p>}
                          </div>

                          <div className="space-y-1 text-left">
                            <label className="font-mono text-[8.5px] text-gold/85 font-bold tracking-wider block uppercase select-none">WhatsApp para Confirmação</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold/50" />
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => handlePhoneInput(e.target.value)}
                                placeholder="(11) 99999-9999"
                                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg py-2 pl-8.5 pr-3 text-xs font-sans text-slate-100 focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all placeholder:text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                              />
                            </div>
                            {errors.phone && <p className="text-rose-400 font-mono text-[9px] mt-0.5 leading-none">{errors.phone}</p>}
                          </div>
                        </div>

                        {/* Elegant Collapsible Coupon Code Button/Field */}
                        <div className="text-left py-0.5">
                          {!showCouponInput && !couponSuccess ? (
                            <button
                              type="button"
                              onClick={() => setShowCouponInput(true)}
                              className="font-mono text-[8px] text-zinc-500 hover:text-gold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              Possui cupom de desconto?
                            </button>
                          ) : (
                            <div className="space-y-1.5 animation-fade-in">
                              <label className="font-mono text-[8px] text-gold/70 font-bold block uppercase">Cupom de Desconto</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={coupon}
                                  onChange={(e) => setCoupon(e.target.value)}
                                  placeholder="ex: ORTEGA10"
                                  className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg py-1.5 px-3 text-[10px] font-sans text-slate-100 uppercase focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                                />
                                <button
                                  type="button"
                                  onClick={handleApplyCoupon}
                                  className="bg-white/5 hover:bg-gold hover:text-black border border-white/10 hover:border-gold py-1.5 px-3 font-mono text-[9px] uppercase font-bold rounded-lg transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                                >
                                  Aplicar
                                </button>
                              </div>
                              {couponError && <p className="text-rose-400 font-mono text-[8px]">{couponError}</p>}
                              {couponSuccess && <p className="text-emerald-400 font-mono text-[8px]">{couponSuccess}</p>}
                            </div>
                          )}
                        </div>

                        {/* Submit Action Block */}
                        <div className="pt-2 space-y-2">
                          {errors.slot && (
                            <p className="text-rose-400 font-sans text-[10px] text-center leading-snug px-2">
                              {errors.slot}
                            </p>
                          )}
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-linear-to-r from-[#ece4cb] to-[#c2a35d] text-slate-950 hover:opacity-90 font-sans text-xs font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(194,163,93,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                            id="submit-booking-action"
                          >
                            {isSubmitting ? (
                              <>
                                <span className="gold-spinner w-4 h-4" />
                                Confirmando...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Confirmar Ritual
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => goToStep(3)}
                            className="w-full py-2 bg-transparent border border-white/10 rounded-lg font-mono text-[9px] text-slate-400 uppercase tracking-widest hover:text-white hover:border-white/30 transition-colors cursor-pointer animate-fade-in"
                          >
                            ← Voltar
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                </AnimatePresence>
                
              </div>
            ) : (
              /* LUXURY DIGITAL TICKET COMPLETED SUCCESS VIEW */
              <motion.div
                key="booking-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-4 text-center space-y-6"
                id="booking-success-view"
              >
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-black text-xl text-emerald-400 uppercase tracking-tight">
                    Agendado com sucesso!
                  </h3>
                  <p className="font-serif italic text-zinc-400 text-xs max-w-sm">
                    Sua assinatura de visual de alta-costura foi inserida na fila estrita com segurança militar.
                  </p>
                </div>

                {/* Exquisite Physical Receipt Styled Coupon Card */}
                <div className="relative w-full max-w-sm bg-[#fafaf9] text-zinc-900 p-5 rounded-2xl border-2 border-zinc-950 shadow-2xl flex flex-col justify-between overflow-hidden text-left" id="visual-luxury-final-ticket">
                  
                  {/* Stylized punch holes on edge */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0c0d0e] rounded-full border border-gold/15" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0c0d0e] rounded-full border border-gold/15" />
                  
                  {/* Upper notch line */}
                  <div className="border-b border-dashed border-zinc-300 pb-3 mb-3 text-center">
                    <div className="flex items-center gap-1.5 justify-center mb-0.5">
                      <Scissors className="w-3.5 h-3.5 text-zinc-900" />
                      <span className="font-display font-extrabold text-[12px] tracking-widest text-[#151515]">BARBER<span className="text-gold">CODE</span></span>
                    </div>
                    <span className="font-mono text-[7px] text-zinc-450 uppercase tracking-widest font-semibold block col-span-12">FARIA LIMA 4500 • SÃO PAULO</span>
                  </div>

                  {/* Body data info blocks */}
                  <div className="space-y-2.5 font-mono text-[10px] text-zinc-800">
                    <div className="flex flex-col border-b border-zinc-100 pb-1.5">
                      <span className="text-[7.5px] text-zinc-400 uppercase">[VOUCHER_SINALIZACAO]</span>
                      <span className="text-xs font-display font-bold text-zinc-950 uppercase">{selectedService.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[7.5px] text-zinc-400 uppercase">[PROFISSIONAL]</span>
                        <span className="font-semibold text-zinc-900">{selectedBarber.name.split(' "')[0]}</span>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[7.5px] text-zinc-400 uppercase">[INVESTIMENTO]</span>
                        <span className="font-bold text-zinc-900 text-xs">
                          R$ {appliedDiscount > 0 ? discountedPrice.toFixed(0) : selectedService.price},00
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[7.5px] text-zinc-400 uppercase">[DATA]</span>
                        <span className="font-semibold text-zinc-900">
                          {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
                        </span>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[7.5px] text-zinc-400 uppercase">[DIZ_ESTIPULADO]</span>
                        <span className="font-semibold text-zinc-900">{selectedTime}hs</span>
                      </div>
                    </div>

                    <div className="flex flex-col border-t border-zinc-100 pt-2">
                      <span className="text-[7.5px] text-zinc-400 uppercase">[TITULAR_E_CONTATO]</span>
                      <span className="font-semibold text-zinc-900 uppercase truncate">{name || 'Cliente Secreto'}</span>
                      <span className="text-zinc-500 font-normal mt-0.5 text-[8.5px]">{phone}</span>
                    </div>
                  </div>

                  {/* Decorative barcode representational stripes closer */}
                  <div className="flex flex-col items-center mt-4 pt-3 border-t border-dashed border-zinc-200 select-none">
                    <div className="flex h-8 w-full items-end justify-center space-x-[1.5px] opacity-85 px-4">
                      {Array.from({ length: 32 }).map((_, rIdx) => {
                        const hClass = rIdx % 3 === 0 ? 'h-6' : rIdx % 5 === 0 ? 'h-8' : 'h-7';
                        const wClass = rIdx % 4 === 0 ? 'w-[2.5px]' : 'w-[1px]';
                        return <div key={rIdx} className={`${hClass} ${wClass} bg-zinc-900`} />;
                      })}
                    </div>
                    
                    <span className="font-mono text-[8.5px] text-zinc-500 font-bold tracking-widest uppercase mt-2.5">
                      {ticketNumber || 'BC-PREMIUM-AGENDAMENTO'}
                    </span>
                  </div>
                </div>

                {/* Confirm details notice list */}
                <div className="bg-[#121315] p-3.5 border border-zinc-850 rounded-xl text-left select-none max-w-sm">
                  <div className="flex gap-2.5 items-start">
                    <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <p className="font-sans text-[10.5px] text-zinc-400 leading-normal font-normal">
                      <strong>Confirmação via WhatsApp:</strong> Enviamos uma mensagem com as diretrizes do seu agendamento. Pague diretamente ao finalizar no salão.
                    </p>
                  </div>
                </div>

                {/* Success Actions */}
                <div className="w-full pt-4 space-y-2">
                  <button
                    onClick={onClose}
                    className="w-full py-3.5 bg-gold hover:bg-white text-black font-display text-xs font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                  >
                    Fechar aplicativo
                  </button>
                  <button
                    onClick={handleResetAndRestart}
                    className="w-full py-3 bg-transparent border border-zinc-850 hover:border-gold text-zinc-400 hover:text-gold font-mono text-[9px] uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Realizar Outro Agendamento
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

                {/* Modal persistent luxury brand footnote */}
        <div className="bg-black/40 p-3 text-center border-t border-white/5 text-sans text-[7.5px] select-none uppercase tracking-wider text-slate-500 shrink-0 font-sans">
          SÉCULO XXI • SISTEMA DE RESERVA DIGITAL EXCLUSIVO LTDA.
        </div>
      </div>
    </div>
  );
}

// Converte o funcionário (Firestore) no shape que os cards de barbeiro já
// consomem. Avatar fica vazio (placeholder com iniciais é tratado no card).
function employeeToSpecialist(e: Employee): BarberSpecialist {
  return {
    id: e.id,
    name: e.name,
    role: e.role === 'barbeiro' ? 'Barbeiro' : e.role === 'gerente' ? 'Gerente' : 'Recepcionista',
    avatar: '',
    bio: '',
    specialties: [],
  };
}

// Utility to format Selected Date stamp as Short standard, e.g. "Sex, 12 de Jun"
function formatSelectedShortDate(dateStr: string) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const wk = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dateObj.getDay()];
  const mth = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ][dateObj.getMonth()];
  return `${wk}, ${day} de ${mth}`;
}
