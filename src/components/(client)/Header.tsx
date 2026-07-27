"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import ClientDashboard from './ClientDashboard';
import Lockup from '@/components/brand/Lockup';
import Monogram from '@/components/brand/Monogram';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

/**
 * Cabeçalho da landing.
 *
 * Transparente sobre o hero e sólido depois que a página rola — a troca é só de
 * background/borda, sem reflow. O CTA de agendar fica alcançável de qualquer
 * ponto da página, que é o objetivo primário da landing.
 *
 * A abertura do agendamento é feita por evento (`select-service`), que a página
 * escuta: assim o cabeçalho não precisa receber estado por prop.
 */

// Assinantes de demonstração do portal. Enquanto a autenticação real do clube
// não entra, o login confere o código digitado contra esta lista.
const DEFAULT_MEMBERS = [
  {
    id: 'LG-2026',
    name: 'Lincon Cardoso',
    planName: 'Club Legend',
    tier: 'Black' as const,
    price: 360,
    since: '01/03/2026',
    phone: '(11) 98522-2235',
    totalCuts: 'Ilimitado' as const,
    cutsUsed: 4,
    specialCredits: 2,
    specialUsed: 1,
    beerLimit: 10,
    beerUsed: 4,
  },
  {
    id: 'EX-1102',
    name: 'Carlos Alberto',
    planName: 'Club Executive',
    tier: 'Silver' as const,
    price: 140,
    since: '15/01/2026',
    phone: '(11) 98765-4321',
    totalCuts: 2 as const,
    cutsUsed: 1,
    specialCredits: 0,
    specialUsed: 0,
    beerLimit: 0,
    beerUsed: 0,
  },
  {
    id: 'RY-2849',
    name: 'Dr. Roberto Marinho',
    planName: 'Club Royal',
    tier: 'Gold' as const,
    price: 240,
    since: '02/02/2026',
    phone: '(11) 99122-3344',
    totalCuts: 'Ilimitado' as const,
    cutsUsed: 3,
    specialCredits: 1,
    specialUsed: 0,
    beerLimit: 0,
    beerUsed: 0,
  },
];

type Member = (typeof DEFAULT_MEMBERS)[number];

const NAV_ITEMS = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Cortes', href: '#cortes' },
  { label: 'Clube', href: '#assinaturas' },
  { label: 'Onde estamos', href: '#localizacao' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showClientArea, setShowClientArea] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [assinante, setAssinante] = useState<Member | null>(null);

  useLockBodyScroll(showClientArea || isMenuOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha o que estiver aberto com Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setIsMenuOpen(false);
      setShowClientArea(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const abrirAgendamento = () => {
    setIsMenuOpen(false);
    window.dispatchEvent(new CustomEvent('select-service'));
  };

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    const encontrado = DEFAULT_MEMBERS.find(
      (m) => m.id.toLowerCase() === codigo.trim().toLowerCase(),
    );
    if (!encontrado) {
      setErroLogin('Não encontramos esse código. Confira no seu cartão de assinante.');
      return;
    }
    setErroLogin('');
    setAssinante(encontrado);
  };

  const fecharPortal = () => {
    setShowClientArea(false);
    setErroLogin('');
    setCodigo('');
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
          scrolled ? 'border-b border-xxi-line bg-xxi-ink' : 'border-b border-transparent'
        }`}
        id="site-header"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <a href="#hero" aria-label="Barbearia Século 21 — início" className="shrink-0">
            {/* Abaixo de 400px o lockup inteiro fica ilegível; ali entra só o símbolo. */}
            <Lockup className="hidden h-6 w-auto xs:block sm:h-7" textColor="#f2f2f2" />
            <Monogram className="h-7 w-7 text-xxi-yellow xs:hidden" title="Barbearia Século 21" />
          </a>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-xxi-mute transition-colors hover:text-xxi-yellow"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowClientArea(true)}
              className="hidden h-11 items-center gap-2 px-3 text-sm text-xxi-mute transition-colors hover:text-xxi-yellow sm:inline-flex"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              Área do assinante
            </button>

            <button
              type="button"
              onClick={abrirAgendamento}
              className="xxi-btn xxi-btn-primary hidden !min-h-11 !px-4 !text-[15px] sm:inline-flex"
            >
              Agendar
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center border border-xxi-line text-xxi-white md:hidden"
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMenuOpen}
              aria-controls="menu-mobile"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div
            id="menu-mobile"
            className="border-t border-xxi-line bg-xxi-ink px-5 pb-6 pt-2 md:hidden"
          >
            <nav className="flex flex-col" aria-label="Navegação">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="border-b border-xxi-line py-4 text-base text-xxi-white"
                >
                  {item.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowClientArea(true);
                }}
                className="flex items-center gap-2 border-b border-xxi-line py-4 text-left text-base text-xxi-white"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                Área do assinante
              </button>
            </nav>
            <button
              type="button"
              onClick={abrirAgendamento}
              className="xxi-btn xxi-btn-primary mt-5 w-full"
            >
              Agendar agora
            </button>
          </div>
        )}
      </header>

      {/* Portal do assinante */}
      {showClientArea && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
            onClick={fecharPortal}
            aria-hidden="true"
          />

          <div
            className="relative max-h-[92vh] w-full overflow-y-auto border border-xxi-line bg-xxi-graphite sm:max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-portal"
          >
            {assinante ? (
              <ClientDashboard
                member={assinante}
                onClose={fecharPortal}
                onLogout={() => setAssinante(null)}
              />
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="xxi-eyebrow">Clube Século 21</p>
                    <h2 id="titulo-portal" className="xxi-title xxi-title-lg mt-2">
                      Área do assinante
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={fecharPortal}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-xxi-line text-xxi-mute hover:text-xxi-white"
                    aria-label="Fechar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={entrar} className="mt-6">
                  <label htmlFor="codigo-assinante" className="block text-sm text-xxi-mute">
                    Código de assinante
                  </label>
                  <input
                    id="codigo-assinante"
                    value={codigo}
                    onChange={(e) => {
                      setCodigo(e.target.value);
                      if (erroLogin) setErroLogin('');
                    }}
                    placeholder="Ex.: LG-2026"
                    autoComplete="off"
                    aria-invalid={Boolean(erroLogin)}
                    aria-describedby={erroLogin ? 'erro-codigo' : undefined}
                    className="mt-2 h-12 w-full border border-xxi-line bg-xxi-ink px-3 text-xxi-white placeholder:text-[#6b6b6b]"
                  />

                  {erroLogin && (
                    <p id="erro-codigo" role="alert" className="mt-2 text-sm text-red-400">
                      {erroLogin}
                    </p>
                  )}

                  <button type="submit" className="xxi-btn xxi-btn-primary mt-5 w-full">
                    Entrar
                  </button>
                </form>

                <p className="mt-5 text-sm text-xxi-mute">
                  Ainda não assina?{' '}
                  <a
                    href="#assinaturas"
                    onClick={fecharPortal}
                    className="text-xxi-yellow underline underline-offset-4"
                  >
                    Conheça os planos
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
