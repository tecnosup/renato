import { Search, Star, ChevronRight, UserPlus } from "lucide-react";

const clientes = [
  { id: 1, nome: "Abel Silva", celular: "(72) 9994-1998", pontos: 0 },
  { id: 2, nome: "Abilio Ferreira Gomes", celular: "(72) 9983-9163", pontos: 0 },
  { id: 3, nome: "Abner Lucas", celular: "(72) 9948-8594", pontos: 0 },
  { id: 4, nome: "Ademar Pereira da Silva", celular: "(72) 9974-5271", pontos: 0 },
  { id: 5, nome: "Alendes Ricardo", celular: "(72) 9830-1214", pontos: 120 },
  { id: 6, nome: "Alex Ricardo", celular: "(72) 9931-4511", pontos: 0 },
  { id: 7, nome: "Alexsander", celular: "(72) 9971-2712", pontos: 45 },
  { id: 8, nome: "Almir Luiz", celular: "(72) 9984-8956", pontos: 0 },
];

function getInitials(nome: string) {
  return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const colors = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

export default function ClientesPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Clientes</h1>
          <p className="text-slate-300 text-sm mt-1">{clientes.length} clientes cadastrados</p>
        </div>
        <button className="bg-linear-to-br from-[#ece4cb] to-[#c2a35d] hover:brightness-110 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Cliente</span>
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          className="transform-gpu w-full bg-white/2 backdrop-blur-md backdrop-saturate-150 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.25)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all"
        />
      </div>

      {/* Lista */}
      <div className="transform-gpu rounded-2xl overflow-hidden bg-white/2 backdrop-blur-md backdrop-saturate-150 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.25)]">
        <ul className="divide-y divide-white/5">
          {clientes.map((c, i) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/8 transition-colors cursor-pointer">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${colors[i % colors.length]}`}>
                {getInitials(c.nome)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{c.nome}</p>
                <p className="text-xs text-slate-300 truncate mt-0.5">{c.celular}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {c.pontos > 0 && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs font-semibold">{c.pontos}</span>
                  </div>
                )}
                <ChevronRight className="w-4 h-4 text-slate-200" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
