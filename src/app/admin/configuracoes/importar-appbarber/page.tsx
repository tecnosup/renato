"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Download } from "lucide-react";

export default function ImportarAppBarberPage() {
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button
          onClick={() => router.back()}
          className="text-slate-100 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-100">Importar do AppBarber</h1>
      </div>

      <div className="transform-gpu mx-4 mb-12 rounded-2xl overflow-hidden admin-glass-card p-8 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center">
          <Download className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-semibold admin-text-primary">Em construção</p>
        <p className="text-xs admin-text-secondary">
          Em breve você poderá importar clientes, serviços e histórico exportados do AppBarber.
        </p>
      </div>
    </div>
  );
}
