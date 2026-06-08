export default function Home() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Agenda</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie os agendamentos e horários dos profissionais.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            + Novo Agendamento
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            + Encaixe
          </button>
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-800 rounded-xl h-[600px] flex items-center justify-center bg-slate-900/50">
        <p className="text-slate-500">A grade vertical de agenda será implementada aqui.</p>
      </div>
    </div>
  );
}
