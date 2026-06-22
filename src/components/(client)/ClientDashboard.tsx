"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Calendar, 
  Clock, 
  User, 
  LogOut, 
  CheckCircle, 
  CalendarDays, 
  QrCode, 
  CreditCard, 
  Scissors, 
  TrendingUp, 
  Beer, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Receipt
} from 'lucide-react';

interface ClientDashboardProps {
  member: {
    id: string;
    name: string;
    planName: string;
    tier: 'Silver' | 'Gold' | 'Black';
    price: number;
    since: string;
    phone: string;
    totalCuts: number | 'Ilimitado';
    cutsUsed: number;
    specialCredits: number;
    specialUsed: number;
    beerLimit: number;
    beerUsed: number;
  };
  onClose: () => void;
  onLogout: () => void;
}

interface SavedAppointment {
  id: string;
  serviceName: string;
  servicePrice: number;
  barberName: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  status: string;
}

export default function ClientDashboard({ member, onClose, onLogout }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'benefits' | 'appointments' | 'card' | 'billing'>('benefits');
  const [appointments, setAppointments] = useState<SavedAppointment[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState<string | null>(null);

  // Load appointments from localStorage
  useEffect(() => {
    const loadAppointments = () => {
      try {
        const stored = localStorage.getItem('seculo-xxi-appointments');
        const list: SavedAppointment[] = stored ? JSON.parse(stored) : [];
        
        // Filter appointments relevant to this client name (fuzzy matching of first name or exact match)
        const relevant = list.filter(appt => {
          const apptNameClean = appt.customerName?.toLowerCase().trim() || '';
          const memberNameClean = member.name?.toLowerCase().trim() || '';
          return apptNameClean.includes(memberNameClean) || memberNameClean.includes(apptNameClean);
        });

        // Add some premium mock historic appointments to look established if none exists
        const mockHistoric: SavedAppointment[] = [
          {
            id: 'BC-582910',
            serviceName: 'Corte Pivot Point + Ritual de Toalhas Quentes',
            servicePrice: 150,
            barberName: 'Alexandre Ortega',
            date: '2026-05-15',
            time: '14:00',
            customerName: member.name,
            customerPhone: member.phone,
            status: 'concluido'
          },
          {
            id: 'BC-204918',
            serviceName: 'Tratamento de Argiloterapia Facial',
            servicePrice: 90,
            barberName: 'Gabriel Enzo',
            date: '2026-04-10',
            time: '18:00',
            customerName: member.name,
            customerPhone: member.phone,
            status: 'concluido'
          }
        ];

        // Combine upcoming relevant with mock historic ones
        setAppointments([...relevant, ...mockHistoric]);
      } catch (err) {
        console.error('Error loading appointments:', err);
      }
    };

    loadAppointments();
    
    // Listen to local storage changes or standard updates
    window.addEventListener('storage', loadAppointments);
    return () => window.removeEventListener('storage', loadAppointments);
  }, [member.name, member.phone]);

  // Cancel an appointment in real-time
  const handleCancelAppointment = (apptId: string) => {
    try {
      const stored = localStorage.getItem('seculo-xxi-appointments');
      const list: SavedAppointment[] = stored ? JSON.parse(stored) : [];
      
      // Remove from central database list
      const updated = list.filter(appt => appt.id !== apptId);
      localStorage.setItem('seculo-xxi-appointments', JSON.stringify(updated));
      
      // Update local state list
      setAppointments(prev => prev.filter(appt => appt.id !== apptId));
      setShowCancelPrompt(null);

      // Trigger global toast dispatch
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          title: 'HORÁRIO CANCELADO',
          message: 'O cancelamento foi realizado com sucesso. Seus créditos de assinatura foram estornados automaticamente.',
          type: 'success'
        }
      }));
    } catch (err) {
      console.error('Error canceling appointment:', err);
    }
  };

  // Helper to trigger main booking form
  const handleQuickBook = () => {
    // Closes customer dashboard, and opens regular schedule form pre-selected
    onClose();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('select-service', { detail: '' }));
    }, 150);
  };

  const copyMemberCode = () => {
    navigator.clipboard.writeText(member.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full text-left" id="client-dashboard-root">
      
      {/* Top Banner with Member ID & Quick logout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-900 z-10 select-none">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-display ${
            member.tier === 'Black' 
              ? 'bg-zinc-950 border-[#c8ccd4]/40 text-[#c8ccd4] shadow-md shadow-[#c8ccd4]/5' 
              : member.tier === 'Gold' 
                ? 'bg-[#181510] border-amber-600/35 text-amber-500' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}>
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-medium text-lg text-white leading-tight uppercase flex items-center gap-2">
              Olá, {member.name.split(' ')[0]} 
              <span className={`text-[7px] font-mono tracking-widest uppercase border px-1.5 py-0.5 rounded-full font-black ${
                member.tier === 'Black' 
                  ? 'border-[#c8ccd4] text-[#c8ccd4] bg-[#c8ccd4]/5 animate-pulse' 
                  : member.tier === 'Gold' 
                    ? 'border-amber-600/30 text-amber-500 bg-amber-600/5' 
                    : 'border-zinc-850 text-zinc-400 bg-zinc-900'
              }`}>
                TIER {member.tier}
              </span>
            </h3>
            <p className="font-sans text-[10px] text-zinc-500 mt-1 leading-none">
              Membro Assinante desde {member.since} • Pleno Ativo
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 items-center w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={copyMemberCode}
            className="font-mono text-[9px] text-[#c8ccd4] hover:text-white bg-zinc-950 border border-zinc-900 hover:border-[#c8ccd4]/40 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-w-0 flex-1 sm:flex-initial truncate"
          >
            <span className="shrink-0">ID:</span> <strong className="tracking-widest truncate">{member.id}</strong>
            <span className="text-[7.5px] text-zinc-650 font-normal shrink-0">({isCopied ? 'Copiado!' : 'Copiar'})</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 bg-zinc-900/40 hover:bg-rose-950/20 border border-zinc-850 hover:border-rose-900/30 text-zinc-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            aria-label="Sair da Conta"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="font-mono text-[8px] uppercase tracking-wider hidden sm:inline-block">Sair</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation row (Swiss Minimal Bauhaus look) */}
      <div className="flex bg-black/30 backdrop-blur-2xl border border-white/10 p-1.5 rounded-xl my-5 gap-1 select-none shrink-0" id="dashboard-navbar">
        {[
          { icon: TrendingUp, id: 'benefits', label: 'Benefícios' },
          { icon: Calendar, id: 'appointments', label: 'Agenda Estética' },
          { icon: QrCode, id: 'card', label: 'Carteira Virtual' },
          { icon: CreditCard, id: 'billing', label: 'Cobrança' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-1.5 px-1 sm:px-2 flex items-center justify-center gap-1.5 font-sans text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#c8ccd4] text-zinc-950 shadow-md shadow-[#c8ccd4]/5 font-extrabold'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            <tab.icon className="w-3 h-3 shrink-0" />
            <span className="hidden xs:inline-block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content panes nested viewport container.
          No mobile o conteúdo flui livre (o card-pai rola); no desktop trava a
          altura para o cockpit não esticar demais. */}
      <div className="flex-1 sm:overflow-y-auto sm:pr-0.5 sm:min-h-[260px] sm:max-h-[420px]" id="dashboard-tab-viewport">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CONSUMPTION BENEFITS TRACKER */}
          {activeTab === 'benefits' && (
            <motion.div
              key="benefits-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Dynamic Welcome card showing subscription value details */}
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-4 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" id="benefits-masthead">
                <div className="absolute top-0 right-0 p-3 select-none">
                  <span className="font-mono text-[16px] text-[#c8ccd4]/10 font-black tracking-widest uppercase">SECULO XXI</span>
                </div>
                <div className="space-y-1 z-10">
                  <span className="text-[#c8ccd4] font-mono text-[8px] uppercase tracking-widest font-bold">PLANO DE ASSINATURA</span>
                  <div className="flex items-baseline gap-2">
                    <h4 className="font-display font-bold text-xl text-white uppercase tracking-wider">{member.planName}</h4>
                    <span className="font-mono text-zinc-550 text-[10px]">R$ {member.price}/mês</span>
                  </div>
                  <p className="font-sans text-[10.5px] text-zinc-400 max-w-sm leading-normal font-normal">
                    Seu plano está devidamente verificado. Seus créditos de serviço são renovados automaticamente no dia 1º de cada mês. Descontos de membro são válidos em todo o catálogo.
                  </p>
                </div>
              </div>

              {/* Progress grid of actual consumable points */}
              <h5 className="font-mono text-[8px] text-[#c8ccd4]/85 font-black uppercase tracking-widest pr-1 flex items-center gap-1">[CONSUMO_E_COCKPIT_MENSAL]</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                {/* Visual tracker card 1: Cuts */}
                <div className="bg-white/5 backdrop-blur-md p-3 border border-white/10 rounded-xl relative flex flex-col justify-between min-h-[90px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[7px] text-zinc-500 uppercase">Cortes Mensais</span>
                    <Scissors className="w-3 h-3 text-[#c8ccd4]/80" />
                  </div>
                  <div className="pt-2">
                    <div className="text-lg font-display font-light text-white uppercase tracking-wide">
                      {member.totalCuts === 'Ilimitado' ? (
                        <span>ILIMITADO</span>
                      ) : (
                        <span>{member.totalCuts - member.cutsUsed} <span className="text-zinc-550 text-[10px] lowercase">restantes</span></span>
                      )}
                    </div>
                    {member.totalCuts !== 'Ilimitado' && (
                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="h-full bg-[#c8ccd4] rounded-full" 
                          style={{ width: `${((member.totalCuts - member.cutsUsed) / member.totalCuts) * 100}%` }} 
                        />
                      </div>
                    )}
                    <p className="font-mono text-[7.5px] text-zinc-550 mt-1 uppercase">
                      Consumidos: {member.cutsUsed} {member.totalCuts !== 'Ilimitado' && `de ${member.totalCuts}`}
                    </p>
                  </div>
                </div>

                {/* Visual tracker card 2: Premium Treatments or Facials */}
                <div className="bg-white/5 backdrop-blur-md p-3 border border-white/10 rounded-xl relative flex flex-col justify-between min-h-[90px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[7px] text-zinc-500 uppercase">Serviços Especiais</span>
                    <Sparkles className="w-3 h-3 text-[#c8ccd4]/80 animate-pulse" />
                  </div>
                  <div className="pt-2">
                    <div className="text-lg font-display font-light text-white uppercase tracking-wide">
                      {member.specialCredits === 100 ? (
                        <span>ILIMITADO</span>
                      ) : (
                        <span>{member.specialCredits - member.specialUsed} <span className="text-zinc-550 text-[10px] lowercase">soberanos</span></span>
                      )}
                    </div>
                    {member.specialCredits !== 100 && (
                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="h-full bg-[#c8ccd4] rounded-full" 
                          style={{ width: `${((member.specialCredits - member.specialUsed) / member.specialCredits) * 100}%` }} 
                        />
                      </div>
                    )}
                    <p className="font-mono text-[7.5px] text-zinc-550 mt-1 uppercase">
                      Usados: {member.specialUsed} de {member.specialCredits}
                    </p>
                  </div>
                </div>

                {/* Visual tracker card 3: Beverages / Beer */}
                <div className="bg-white/5 backdrop-blur-md p-3 border border-white/10 rounded-xl relative flex flex-col justify-between min-h-[90px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[7px] text-zinc-500 uppercase">Artisanal Drinks</span>
                    <Beer className="w-3 h-3 text-[#c8ccd4]/80" />
                  </div>
                  <div className="pt-2">
                    <div className="text-lg font-display font-light text-white uppercase tracking-wide font-medium">
                      {member.beerLimit === 0 ? (
                        <span className="text-zinc-600 block text-[10px] font-mono select-none">NÃO INCLUSO</span>
                      ) : (
                        <span>{member.beerLimit - member.beerUsed} <span className="text-zinc-550 text-[10px] lowercase">créditos</span></span>
                      )}
                    </div>
                    {member.beerLimit > 0 && (
                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="h-full bg-[#c8ccd4]" 
                          style={{ width: `${((member.beerLimit - member.beerUsed) / member.beerLimit) * 100}%` }} 
                        />
                      </div>
                    )}
                    <p className="font-mono text-[7.5px] text-zinc-550 mt-1 uppercase">
                      {member.beerLimit > 0 ? `Barris: ${member.beerUsed} de ${member.beerLimit}` : `Liberado na compra`}
                    </p>
                  </div>
                </div>

              </div>

              {/* Extra Perks checklist */}
              <div className="bg-black/20 backdrop-blur-lg p-3.5 border border-white/5 rounded-xl space-y-1.5">
                <span className="font-mono text-[7.5px] text-[#c8ccd4] uppercase block font-bold">[BENEFÍCIOS_ATIVOS_ADICIONAIS]</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-400 font-sans text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Prioridade Fila de Espera Exclusiva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Estacionamento Grátis no Salão</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Café Nespresso & Malt Whisky liberados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>10% OFF em Ceras e Óleos Botânicos</span>
                  </div>
                </div>
              </div>

              {/* Quick Book Button */}
              <button
                onClick={handleQuickBook}
                className="w-full bg-[#c8ccd4]/10 hover:bg-[#c8ccd4] text-[#c8ccd4] hover:text-black border border-[#c8ccd4]/30 hover:border-[#c8ccd4] py-3.5 rounded-xl transition-all font-sans text-[10px] font-bold tracking-[0.16em] uppercase flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Scissors className="w-3.5 h-3.5" />
                Agendar Próximo Ritual com Crédito
              </button>
            </motion.div>
          )}

          {/* TAB 2: PERSONAL APPOINTMENTS AND RESERVATIONS */}
          {activeTab === 'appointments' && (
            <motion.div
              key="appointments-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center pr-1">
                <h5 className="font-mono text-[8px] text-[#c8ccd4]/85 font-black uppercase tracking-widest">[CRONOGRAMA_DE_AGENDAMENTOS]</h5>
                <button 
                  onClick={handleQuickBook}
                  className="font-mono text-[8px] text-[#c8ccd4] hover:text-white uppercase font-bold tracking-wider hover:underline flex items-center gap-1"
                >
                  + Agendar Novo
                </button>
              </div>

              {appointments.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl p-8 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl text-center flex flex-col items-center justify-center space-y-3">
                  <CalendarDays className="w-8 h-8 text-zinc-700 animate-pulse" />
                  <div className="space-y-1">
                    <span className="font-display font-bold text-xs text-white uppercase tracking-wider block">Nenhum agendamento futuro</span>
                    <p className="font-sans text-[11px] text-zinc-500 leading-normal max-w-xs">
                      Não encontramos nenhuma reserva ativa de horário de corte ou barba no seu CPF para as próximas semanas.
                    </p>
                  </div>
                  <button
                    onClick={handleQuickBook}
                    className="bg-[#c8ccd4] text-[#090a0a] font-sans text-[9px] font-bold tracking-[0.2em] px-5 py-2.5 rounded-lg uppercase hover:bg-white cursor-pointer transition-all border border-[#c8ccd4]"
                  >
                    Agendar agora
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  
                  {/* Dynamic cancellation validation prompt overlay if active */}
                  {showCancelPrompt && (
                    <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl space-y-3 animation-fade-in text-left">
                      <div className="flex gap-2 items-start text-rose-400">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-mono text-[9px] block uppercase tracking-wide">CANCELAMENTO REQUISITADO</strong>
                          <p className="font-sans text-[11px] text-zinc-400 leading-normal">
                            Deseja mesmo cancelar essa assinatura de horário de forma definitiva? Seus créditos de benefícios serão liberados para uso imediato.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 justify-end pt-1">
                        <button
                          onClick={() => setShowCancelPrompt(null)}
                          className="px-3 py-1.5 border border-zinc-805 bg-zinc-900 text-zinc-400 font-mono text-[8.5px] uppercase rounded-md font-bold hover:text-white transition-colors cursor-pointer"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(showCancelPrompt)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[8.5px] uppercase rounded-md font-bold transition-all cursor-pointer shadow-lg shadow-rose-950/20"
                        >
                          Confirmar Cancelamento
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {appointments.map((appt) => {
                      const isUpcoming = appt.status !== 'concluido';
                      return (
                        <div 
                          key={appt.id}
                          className={`p-3.5 border rounded-xl flex justify-between items-center gap-4 transition-all ${
                            isUpcoming 
                              ? 'bg-white/5 backdrop-blur-md border-[#c8ccd4]/30 shadow-[0_0_15px_rgba(200, 204, 212,0.1)]' 
                              : 'bg-black/20 backdrop-blur-sm border-white/5 opacity-60'
                          }`}
                        >
                          <div className="flex flex-col text-left space-y-1">
                            {/* Badges */}
                            <div className="flex items-center gap-1.5">
                              <span className={`font-mono text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                isUpcoming 
                                  ? 'bg-[#c8ccd4]/15 text-[#c8ccd4] border border-[#c8ccd4]/20' 
                                  : 'bg-zinc-900 text-zinc-500 border border-zinc-850'
                              }`}>
                                {isUpcoming ? 'upcoming' : 'concluido'}
                              </span>
                              <span className="font-mono text-[7px] text-zinc-550">Código: {appt.id}</span>
                            </div>

                            {/* Service title */}
                            <h4 className="font-display font-bold text-xs text-white uppercase truncate max-w-xs">{appt.serviceName}</h4>
                            
                            {/* Schedule data label */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[10.5px] text-zinc-400 font-light pt-0.5 select-none">
                              <span className="flex items-center gap-1 text-[#c8ccd4]/85">
                                <CalendarDays className="w-3.5 h-3.5 text-[#c8ccd4]/75" />
                                {formatSelectedDatePt(appt.date)}
                              </span>
                              <span className="flex items-center gap-1 text-zinc-500">
                                <Clock className="w-3 h-3 text-zinc-500" />
                                {appt.time}hs
                              </span>
                              <span className="hidden sm:inline text-zinc-700">•</span>
                              <span className="text-zinc-500 font-normal">Profissional: {appt.barberName.split(' "')[0]}</span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
                            {isUpcoming && !showCancelPrompt && (
                              <button
                                type="button"
                                onClick={() => setShowCancelPrompt(appt.id)}
                                className="w-8 h-8 rounded-lg bg-zinc-950 hover:bg-rose-950/20 text-zinc-650 hover:text-rose-400 border border-zinc-900 hover:border-rose-900/30 flex items-center justify-center transition-all cursor-pointer"
                                title="Cancelar Agendamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <span className="font-mono text-[9px] font-bold text-zinc-500 block">R$ {appt.servicePrice}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: DIGITAL MEMBERSHIP PASSPORT & MEMBERSHIP CARD */}
          {activeTab === 'card' && (
            <motion.div
              key="card-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <h5 className="font-mono text-[8px] text-[#c8ccd4]/85 font-black uppercase tracking-widest">[PASSAPORTE_MEMBRO_VIP]</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                
                {/* Visual Rotating Hologram Interactive Member Pass */}
                <div className="md:col-span-6 flex justify-center py-2 relative group select-none">
                  {/* Digital Card casing */}
                  <div className={`relative w-full max-w-[280px] h-[170px] rounded-2xl p-5 border shadow-2xl overflow-hidden flex flex-col justify-between transition-transform duration-500 transform hover:rotate-1 hover:scale-102 ${
                    member.tier === 'Black' 
                      ? 'bg-gradient-to-br from-zinc-950 via-[#101011] to-[#0a0a0b] border-[#c8ccd4]/45 shadow-[#c8ccd4]/5' 
                      : member.tier === 'Gold' 
                        ? 'bg-gradient-to-br from-[#1b1912] via-[#100f0c] to-zinc-950 border-amber-600/30' 
                        : 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800'
                  }`} id="luxury-membro-wallet-card">
                    {/* Security microtext holographic texture */}
                    <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none opacity-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#c8ccd4] via-transparent to-transparent" />
                    <div className="absolute bottom-2 right-2 opacity-10">
                      <QrCode className="w-20 h-20 text-[#c8ccd4]" />
                    </div>

                    {/* Top Row: Brand & Tier indicators */}
                    <div className="flex justify-between items-start z-10 w-full">
                      <div className="flex flex-col">
                        <span className="font-display font-light text-[11px] text-white tracking-[0.15em] leading-none uppercase">SÉCULO XXI</span>
                        <span className="font-sans text-[6px] tracking-[0.25em] text-[#c8ccd4] font-bold mt-1 uppercase">ESTÉTICA DO CUIDADO</span>
                      </div>
                      <div className={`text-[6.5px] font-mono font-bold tracking-[0.2em] border rounded px-1.5 py-0.5 uppercase flex items-center gap-1 leading-none shrink-0 ${
                        member.tier === 'Black' 
                          ? 'border-[#c8ccd4] text-[#c8ccd4] bg-[#c8ccd4]/5' 
                          : member.tier === 'Gold' 
                            ? 'border-amber-600/30 text-amber-500' 
                            : 'border-zinc-800 text-zinc-500'
                      }`}>
                        <span className="w-1 h-1 bg-current rounded-full" />
                        {member.tier === 'Black' ? 'LEGEND' : member.tier === 'Gold' ? 'ROYAL' : 'EXECUTIVE'}
                      </div>
                    </div>

                    {/* Center details of Card Holder */}
                    <div className="z-10 text-left">
                      <span className="font-mono text-[6px] text-zinc-500 uppercase block leading-none mb-1">[TITULAR_ASSOCIADO]</span>
                      <h4 className="font-display font-bold text-sm text-zinc-100 uppercase tracking-widest leading-none truncate max-w-[210px]">{member.name}</h4>
                      <p className="font-mono text-[10px] text-[#c8ccd4] font-semibold mt-1.5 tracking-widest leading-none">{member.id}</p>
                    </div>

                    {/* Footer micro guidelines */}
                    <div className="flex justify-between items-end z-10 font-mono text-[5.5px] text-zinc-550 select-none">
                      <div>
                        <span>EXP EXCLUSIVO ATÉ CANCELAMENTO</span>
                      </div>
                      <span>CRUZEIRO/SP • BRASIL</span>
                    </div>
                  </div>
                </div>

                {/* Micro instructions regarding priority queueing */}
                <div className="md:col-span-6 space-y-3 font-sans text-left">
                  <span className="font-mono text-[7.5px] text-[#c8ccd4]/75 uppercase block font-bold">[COMO_ATIVAR_FILA_EXPRESSA]</span>
                  <p className="text-xs text-zinc-405 leading-relaxed font-light">
                    Como membro estético ativo, você é prioridade estrita em nosso salão físico em Cruzeiro. Ao chegar, basta abrir seu celular nesta carteira e apresentar para as recepcionistas.
                  </p>
                  
                  <div className="space-y-2 font-mono text-[11px] text-zinc-500 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Qr-Code auto-atualizável de 60s seguro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Descontos integrados no checkout interno</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: {
                          title: 'CARTEIRA ATIVADA',
                          message: 'Seu passaporte virtual de membro foi sincronizado com seu dispositivo. Boa sessão estético!',
                          type: 'success'
                        }
                      }));
                    }}
                    className="bg-zinc-950 border border-zinc-850 hover:border-[#c8ccd4] hover:text-[#c8ccd4] px-4 py-2 rounded-lg font-sans font-bold uppercase text-[9px] tracking-widest transition-all cursor-pointer block"
                  >
                    Ativar no Apple Wallet / Google Pay
                  </button>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 4: BILLING HISTORY AND CARD MANAGEMENT */}
          {activeTab === 'billing' && (
            <motion.div
              key="billing-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <h5 className="font-mono text-[8px] text-[#c8ccd4]/85 font-black uppercase tracking-widest">[GESTOR_DE_COBRANÇA_E_ASSINATURA]</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                
                {/* Current card stored */}
                <div className="bg-white/5 backdrop-blur-md p-3.5 border border-white/10 rounded-xl space-y-2.5 text-left relative overflow-hidden flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[7.5px] text-zinc-550 uppercase">MÉTODO DE PAGAMENTO</span>
                    <CreditCard className="w-4 h-4 text-[#c8ccd4]/80" />
                  </div>
                  <div>
                    <span className="font-mono text-[10.5px] text-zinc-300 block tracking-widest">••••  ••••  ••••  8829</span>
                    <span className="font-sans text-[10px] text-zinc-500 mt-1 block uppercase">VALIDADE: 12/29 • MASTERCARD BLACK</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: {
                          title: 'CARTÃO EXPEDIDO',
                          message: 'Formulário de troca de cartão ativado. Esta funcionalidade operará 100% sob conexão bancária real.',
                          type: 'success'
                        }
                      }));
                    }}
                    className="font-mono text-[8.5px] text-[#c8ccd4] uppercase tracking-wider hover:underline text-left cursor-pointer font-bold select-none pt-1 inline-block"
                  >
                    Alterar Cartão
                  </button>
                </div>

                {/* Next Payment Detail */}
                <div className="bg-white/5 backdrop-blur-md p-3.5 border border-white/10 rounded-xl space-y-2 text-left relative overflow-hidden flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[7.5px] text-zinc-550 uppercase">PRÓXIMO RECORRÊNCIA</span>
                    <Receipt className="w-4 h-4 text-[#c8ccd4]/80" />
                  </div>
                  <div>
                    <div className="text-sm font-sans font-bold text-white uppercase tracking-wider leading-none">
                      R$ {member.price},00 <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded ml-1 font-bold">AGENDADO</span>
                    </div>
                    <span className="font-sans text-[10px] text-zinc-500 mt-1 block">Renoação automática dia 01 de Julho de 2026.</span>
                  </div>
                  <span className="font-mono text-[7.5px] text-zinc-700 uppercase block mt-1">SÉCULO XXI INTEGRADO VIA GATEWAY SECURE</span>
                </div>

              </div>

              {/* Invoices List */}
              <div className="space-y-2">
                <span className="font-mono text-[7.5px] text-zinc-550 uppercase block pl-1 font-bold">[HISTÓRICO_INANCIADOR_DE_FATURAS]</span>
                <div className="space-y-1.5 bg-black/20 backdrop-blur-lg p-2 border border-white/5 rounded-xl">
                  {[
                    { date: '01/06/2026', desc: 'Renovação Mensal Assinante - Clube', val: member.price, status: 'PAGO', method: 'MasterCard •••• 8829' },
                    { date: '01/05/2026', desc: 'Renovação Mensal Assinante - Clube', val: member.price, status: 'PAGO', method: 'MasterCard •••• 8829' },
                    { date: '01/04/2026', desc: 'Renovação Mensal Assinante - Clube', val: member.price, status: 'PAGO', method: 'MasterCard •••• 8829' }
                  ].map((invoice, iIdx) => (
                    <div key={iIdx} className="flex justify-between items-center py-2 px-2.5 border-b border-white/5 last:border-0 font-mono text-[10px] hover:bg-white/5 rounded-lg transition-colors">
                      <div className="flex flex-col text-left">
                        <span className="text-zinc-650 text-[8.5px]">{invoice.date}</span>
                        <span className="font-sans font-medium text-zinc-300 uppercase text-[10px] mt-0.5">{invoice.desc}</span>
                        <span className="text-zinc-500 text-[8.5px] font-normal leading-tight mt-0.5">{invoice.method}</span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[#c8ccd4] font-semibold">R$ {invoice.val},00</span>
                        <span className="text-[7.5px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded mt-1 font-bold">PAGO</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper to format Date standard strings, e.g. "2026-06-11" to Pt Pt-Br text "Qui, 11 de Jun"
function formatSelectedDatePt(dateStr: string) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const wk = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dateObj.getDay()];
  const mth = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ][dateObj.getMonth()];
  return `${wk}, ${day} de ${mth}`;
}
