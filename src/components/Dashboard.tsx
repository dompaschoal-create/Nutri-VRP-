import React, { useEffect, useState } from 'react';
import { authClient } from '../lib/auth-client';
import { getDashboardMetrics, type DashboardMetrics, syncNutricionista } from '../lib/db';
import { EkgHeartbeatLine } from './EkgHeartbeatLine';
import { PacientesList } from './PacientesList';
import { PacienteForm } from './PacienteForm';
import { PacienteDetail } from './PacienteDetail';
import { ErrorBoundary } from './ErrorBoundary';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  LogOut,
  ChevronRight,
  RefreshCw,
  Clock,
  UserCheck,
  CalendarDays,
  Activity,
  User
} from 'lucide-react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type ViewState = 'dashboard' | 'pacientes_list' | 'paciente_new' | 'paciente_detail';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async (showRefresh = false) => {
    if (!user?.id) return;
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      if (user?.name && user?.email) {
        await syncNutricionista(user.id, user.name, user.email);
      }
      const data = await getDashboardMetrics(user.id);
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    }
    onLogout();
  };

  const handlePatientClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    setJustCreated(false);
    setCurrentView('paciente_detail');
  };

  const handleCreateSuccess = (newPatientId: string) => {
    setSelectedPatientId(newPatientId);
    setJustCreated(true);
    setCurrentView('paciente_detail');
    fetchMetrics();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Menu Lateral Fixo com Logotipo Nutri VRP@ */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 z-20 shadow-sm">
        <div>
          {/* Logo Nutri VRP@ com movimento */}
          <div className="h-20 flex items-center px-6 border-b border-slate-100 gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-amber-400 blur-sm opacity-30 animate-pulse pointer-events-none" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-blue-600/20 animate-float-icon">
                <Activity className="w-5 h-5 text-white animate-heartbeat" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight block flex items-center gap-0.5 animate-logo-wave leading-none">
                <span>Nutri</span>
                <span className="text-blue-600">VRP</span>
                <span className="text-amber-500 font-black animate-at-shimmer">@</span>
              </span>
              <div className="w-24 -my-0.5 opacity-90">
                <EkgHeartbeatLine width={100} height={14} />
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase block -mt-0.5">
                Gestão Nutricional
              </span>
            </div>
          </div>

          {/* Navegação */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => {
                setCurrentView('dashboard');
                fetchMetrics();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard
                className={`w-5 h-5 ${currentView === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
              />
              Dashboard
            </button>

            <button
              onClick={() => setCurrentView('pacientes_list')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
                currentView === 'pacientes_list' || currentView === 'paciente_new' || currentView === 'paciente_detail'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Users
                className={`w-5 h-5 ${
                  currentView === 'pacientes_list' || currentView === 'paciente_new' || currentView === 'paciente_detail'
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}
              />
              Pacientes
            </button>
          </nav>
        </div>

        {/* Rodapé do Menu Lateral / Usuário & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                {user?.name || 'Nutricionista'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do sistema</span>
          </button>
        </div>
      </aside>

      {/* Renderização Condicional da Área Principal */}
      <ErrorBoundary>
        {currentView === 'pacientes_list' && (
          <PacientesList
            user={user}
            onNavigateToNewPatient={() => setCurrentView('paciente_new')}
            onNavigateToPatientDetail={(id) => handlePatientClick(id)}
          />
        )}

        {currentView === 'paciente_new' && (
          <PacienteForm
            user={user}
            onCancel={() => setCurrentView('pacientes_list')}
            onSuccess={handleCreateSuccess}
          />
        )}

        {currentView === 'paciente_detail' && selectedPatientId && (
          <PacienteDetail
            patientId={selectedPatientId}
            user={user}
            justCreated={justCreated}
            onBack={() => setCurrentView('pacientes_list')}
          />
        )}

        {currentView === 'dashboard' && (
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Cabeçalho da área principal */}
            <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Visão geral do atendimento clínico em tempo real
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchMetrics(true)}
                  disabled={loading || refreshing}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 cursor-pointer"
                  title="Atualizar dados do Neon em tempo real"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
                  <span className="hidden sm:inline">Atualizar</span>
                </button>
              </div>
            </header>

            {/* Área dos Cards de Informação */}
            <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
              {/* Banner de Saudação nas cores Azul e Amarelo */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 p-6 sm:p-7 text-white shadow-lg shadow-blue-900/10 border-b-4 border-amber-400">
                <div className="absolute right-0 top-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/60 border border-blue-400/30 text-amber-300 text-xs font-semibold mb-3 backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Conectado ao Neon
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    Olá, {user?.name ? user.name.split(' ')[0] : 'Nutricionista'}! 👋
                  </h2>
                  <p className="text-blue-100/90 text-sm mt-1 leading-relaxed">
                    Acompanhe os pacientes ativos, consultas programadas para a semana e retornos pendentes.
                  </p>
                </div>
              </div>

              {/* Cards de Métricas Principais (Cores em Azul e Amarelo) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1 — Total de pacientes ativos */}
                <div
                  onClick={() => setCurrentView('pacientes_list')}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 group-hover:h-1.5 transition-all" />
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                      Ativos
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Total de Pacientes Ativos
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                        {loading ? (
                          <span className="inline-block w-8 h-8 bg-slate-200 animate-pulse rounded" />
                        ) : (
                          metrics.totalPacientes
                        )}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">cadastrados</span>
                    </div>
                  </div>
                </div>

                {/* Card 2 — Consultas da semana */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500 group-hover:h-1.5 transition-all" />
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                      <CalendarDays className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                      Esta Semana
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Consultas da Semana
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                        {loading ? (
                          <span className="inline-block w-8 h-8 bg-slate-200 animate-pulse rounded" />
                        ) : (
                          metrics.consultasSemana
                        )}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">atendimentos</span>
                    </div>
                  </div>
                </div>

                {/* Card de Resumo — Pacientes sem retorno */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between relative overflow-hidden group md:col-span-2 lg:col-span-1">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 group-hover:h-1.5 transition-all" />
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 group-hover:bg-amber-400 group-hover:text-amber-950 transition-colors">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200">
                      Atenção
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Pacientes sem Retorno
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                        {loading ? (
                          <span className="inline-block w-8 h-8 bg-slate-200 animate-pulse rounded" />
                        ) : (
                          metrics.pacientesSemRetorno.length
                        )}
                      </span>
                      <span className="text-xs text-amber-600 font-medium">+30 dias sem retorno</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 — Pacientes sem retorno (Lista Detalhada) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/60 via-white to-blue-50/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200/70 shadow-xs">
                      <Clock className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Pacientes sem retorno</h3>
                      <p className="text-xs text-slate-500">
                        Última consulta realizada há mais de 30 dias sem próximo agendamento cadastrado
                      </p>
                    </div>
                  </div>

                  {metrics.pacientesSemRetorno.length > 0 && (
                    <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full">
                      {metrics.pacientesSemRetorno.length} pendente{metrics.pacientesSemRetorno.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Buscando dados no Neon...</span>
                    </div>
                  ) : metrics.pacientesSemRetorno.length === 0 ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100">
                        <UserCheck className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800">
                        Nenhum paciente sem retorno no momento
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1">
                        Todos os seus pacientes consultados possuem agendamentos em dia ou foram atendidos recentemente.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {metrics.pacientesSemRetorno.map((paciente) => (
                        <button
                          key={paciente.id}
                          onClick={() => handlePatientClick(paciente.id)}
                          className="w-full flex items-center justify-between py-4 px-3 rounded-xl hover:bg-slate-50 transition text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm group-hover:bg-amber-100 group-hover:text-amber-800 transition border border-blue-100 group-hover:border-amber-200">
                              {paciente.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition block">
                                {paciente.nome}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>Última consulta: {paciente.data_ultima_consulta || 'Não informada'}</span>
                                <span>•</span>
                                <span className="text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                                  há {paciente.dias_sem_consulta} dias
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                            <span className="hidden sm:inline">Ver perfil</span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        )}
      </ErrorBoundary>
    </div>
  );
};
