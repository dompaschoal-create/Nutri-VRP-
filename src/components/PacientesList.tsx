import React, { useEffect, useState } from 'react';
import { getPacientesList, type PacienteListItem } from '../lib/db';
import {
  Search,
  UserPlus,
  Users,
  ChevronRight,
  Calendar,
  Target,
  RefreshCw
} from 'lucide-react';

interface PacientesListProps {
  user: any;
  onNavigateToNewPatient: () => void;
  onNavigateToPatientDetail: (patientId: string) => void;
}

export const PacientesList: React.FC<PacientesListProps> = ({
  user,
  onNavigateToNewPatient,
  onNavigateToPatientDetail,
}) => {
  const [pacientes, setPacientes] = useState<PacienteListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPacientes = async (showRefreshing = false) => {
    if (!user?.id) return;
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getPacientesList(user.id, search);
      setPacientes(data);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPacientes();
    }, 250);
    return () => clearTimeout(timer);
  }, [user?.id, search]);

  const countText = `${pacientes.length} ${pacientes.length === 1 ? 'paciente encontrado' : 'pacientes encontrados'}`;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      {/* Cabeçalho da Listagem */}
      <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pacientes</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gerenciamento e prontuários dos seus pacientes cadastrados
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadPacientes(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToNewPatient}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Paciente</span>
          </button>
        </div>
      </header>

      {/* Conteúdo da Listagem */}
      <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar paciente por nome..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        {/* Card da Tabela / Lista */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {countText}
            </span>
          </div>

          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-amber-400 rounded-full animate-spin" />
              <span className="text-sm font-medium">Carregando pacientes do Neon...</span>
            </div>
          )}

          {!loading && pacientes.length === 0 && (
            <div className="py-16 text-center flex flex-col items-center justify-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {search.trim() ? 'Nenhum paciente encontrado com essa busca' : 'Nenhum paciente cadastrado ainda'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1 mb-6">
                {search.trim()
                  ? 'Verifique a digitação ou limpe o campo de busca para ver todos os pacientes.'
                  : 'Comece adicionando o seu primeiro paciente para gerenciar consultas e planos alimentares.'}
              </p>
              {!search.trim() && (
                <button
                  type="button"
                  onClick={onNavigateToNewPatient}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Primeiro Paciente</span>
                </button>
              )}
            </div>
          )}

          {!loading && pacientes.length > 0 && (
            <div className="divide-y divide-slate-100">
              {pacientes.map((paciente) => (
                <div
                  key={paciente.id}
                  onClick={() => onNavigateToPatientDetail(paciente.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-blue-50/40 transition text-left group cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onNavigateToPatientDetail(paciente.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      {paciente.nome ? paciente.nome.charAt(0).toUpperCase() : 'P'}
                    </div>

                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition block truncate">
                        {paciente.nome}
                      </span>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        {/* Objetivo */}
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <Target className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-xs font-medium">
                            {paciente.objetivos && paciente.objetivos.length > 0
                              ? paciente.objetivos.join(', ')
                              : paciente.objetivo_texto || 'Sem objetivo informado'}
                          </span>
                        </span>

                        <span className="text-slate-300">•</span>

                        {/* Data da última consulta */}
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>
                            {paciente.data_ultima_consulta
                              ? `Última consulta: ${paciente.data_ultima_consulta}`
                              : 'Nenhuma consulta realizada'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-4 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform shrink-0">
                    <span className="hidden md:inline">Ver prontuário</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
