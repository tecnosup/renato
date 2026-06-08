"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Users, 
  FileText, 
  DollarSign, 
  Settings, 
  Video, 
  GraduationCap, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Package,
  TrendingUp,
  Wallet,
  Inbox,
  LogOut
} from "lucide-react";

export function Sidebar() {
  const [financeiroOpen, setFinanceiroOpen] = useState(false);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="w-8 h-8 bg-slate-700 rounded-md mr-3"></div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Século XXI</h1>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          
          <li>
            <Link href="/" className="flex items-center px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
              <Calendar className="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-400" />
              <span className="text-sm font-medium">Agenda</span>
            </Link>
          </li>
          
          <li>
            <Link href="/cadastros" className="flex items-center px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
              <Users className="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-400" />
              <span className="text-sm font-medium">Cadastros</span>
            </Link>
          </li>

          <li>
            <Link href="/comandas" className="flex items-center px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
              <FileText className="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-400" />
              <span className="text-sm font-medium">Comandas</span>
            </Link>
          </li>

          {/* Financeiro Expansível */}
          <li>
            <button 
              onClick={() => setFinanceiroOpen(!financeiroOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group"
            >
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-3 text-slate-400 group-hover:text-emerald-400" />
                <span className="text-sm font-medium">Financeiro</span>
              </div>
              {financeiroOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>
            
            {financeiroOpen && (
              <ul className="mt-1 mb-2 ml-11 space-y-1 border-l border-slate-700 pl-3">
                <li>
                  <Link href="/financeiro/caixa" className="block py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors">Caixa</Link>
                </li>
                <li>
                  <Link href="/financeiro/historico" className="block py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors">Histórico de Caixas</Link>
                </li>
                <li>
                  <Link href="/financeiro/fluxo" className="block py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors">Fluxo de Caixa</Link>
                </li>
                <li>
                  <Link href="/financeiro/comissoes" className="block py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors">Comissões</Link>
                </li>
                <li>
                  <Link href="/financeiro/estoque" className="block py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors">Estoque</Link>
                </li>
                <li>
                  <Link href="/financeiro/conta-cliente" className="block py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors">Conta do Cliente</Link>
                </li>
                <li>
                  <Link href="/financeiro/conta-profissional" className="block py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors">Conta Profissional</Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link href="/configuracoes" className="flex items-center px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group mt-4">
              <Settings className="w-5 h-5 mr-3 text-slate-400 group-hover:text-slate-200" />
              <span className="text-sm font-medium">Configurações</span>
            </Link>
          </li>

          <li>
            <Link href="/tutoriais" className="flex items-center px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
              <Video className="w-5 h-5 mr-3 text-slate-400 group-hover:text-slate-200" />
              <span className="text-sm font-medium">Vídeos Tutoriais</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center w-full px-3 py-2 bg-slate-800/50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold mr-3">
            RV
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">Renato Vilhagra</p>
            <p className="text-xs text-slate-500 truncate">Admin</p>
          </div>
          <button className="text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
