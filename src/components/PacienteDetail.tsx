import React, { useEffect, useState } from 'react';
import { getPacienteById } from '../lib/db';
import {
  User,
  ChevronLeft,
  Calendar,
  Phone,
  Mail,
  Scale,
  Ruler,
  Calculator,
  Activity,
  Heart,
  Droplets,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck
} from 'lucide-react';

interface PacienteDetailProps {
  patientId: string;
  user: any;
  onBack: () => void;
  justCreated?: boolean;
}

export const PacienteDetail: React.FC<PacienteDetailProps> = ({
  patientId,
  user,
  onBack,
  justCreated = false,
}) => {
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getPacienteById(patientId, user.id);
        setPaciente(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (patientId && user?.id) load();
  }, [patientId, user?.id]);

  const imc = React.useMemo(() => {
    if (!paciente?.peso_inicial || !paciente?.altura) return null;
    const p = parseFloat(paciente.peso_inicial);
    let a = parseFloat(paciente.altura);
    if (a > 3) a = a / 100;
    const valor = p / (a * a);
    return isNaN(valor) ? null : valor.toFixed(1);
  }, [paciente]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Voltar para lista de pacientes"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {loading ? 'Carregando paciente...' : paciente?.nome || 'Perfil do Paciente'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Prontuário completo e histórico clínico do paciente
            </p>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
        {justCreated && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">
              Paciente cadastrado com sucesso e salvo com segurança no Neon!
            </span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-amber-400 rounded-full animate-spin" />
            <span className="text-sm font-medium">Buscando dados no banco Neon...</span>
          </div>
        ) : !paciente ? (
          <div className="py-16 text-center text-slate-500">
            Paciente não encontrado ou você não possui permissão para visualizá-lo.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cartão de Resumo do Paciente */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-600/20">
                  {paciente.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {paciente.nome}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    {paciente.sexo && <span>{paciente.sexo}</span>}
                    {paciente.data_nascimento && (
                      <span>
                        Nascimento: {new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {paciente.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        {paciente.email}
                      </span>
                    )}
                    {(paciente.whatsapp || paciente.telefone) && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        {paciente.whatsapp || paciente.telefone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges antropométricas */}
              <div className="flex items-center gap-3 self-start md:self-auto">
                {paciente.peso_inicial && (
                  <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Peso</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {paciente.peso_inicial} kg
                    </span>
                  </div>
                )}
                {paciente.altura && (
                  <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Altura</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {paciente.altura} cm
                    </span>
                  </div>
                )}
                {imc && (
                  <div className="px-3 py-2 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">IMC</span>
                    <span className="text-sm font-extrabold text-amber-900">{imc}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Grid com Clínico e Hábitos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Clínico */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    Dados Clínicos
                  </h3>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    Objetivos
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {paciente.objetivos && paciente.objetivos.length > 0 ? (
                      paciente.objetivos.map((obj: string) => (
                        <span
                          key={obj}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold"
                        >
                          {obj}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Nenhum selecionado</span>
                    )}
                  </div>
                  {paciente.objetivo_texto && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {paciente.objetivo_texto}
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    Patologias
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {paciente.patologias && paciente.patologias.length > 0 ? (
                      paciente.patologias.map((p: string) => (
                        <span
                          key={p}
                          className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Nenhuma relatada</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    Restrições e Alergias
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {paciente.restricoes_alimentares && paciente.restricoes_alimentares.length > 0 ? (
                      paciente.restricoes_alimentares.map((r: string) => (
                        <span
                          key={r}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold"
                        >
                          Restrição: {r}
                        </span>
                      ))
                    ) : null}
                    {paciente.alergias && paciente.alergias.length > 0 ? (
                      paciente.alergias.map((a: string) => (
                        <span
                          key={a}
                          className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold"
                        >
                          Alergia: {a}
                        </span>
                      ))
                    ) : null}
                    {(!paciente.restricoes_alimentares || paciente.restricoes_alimentares.length === 0) &&
                      (!paciente.alergias || paciente.alergias.length === 0) && (
                        <span className="text-xs text-slate-500">Nenhuma</span>
                      )}
                  </div>
                </div>

                {(paciente.medicamentos || paciente.suplementos) && (
                  <div className="pt-2 border-t border-slate-100 text-xs space-y-2">
                    {paciente.medicamentos && (
                      <p>
                        <strong className="text-slate-700">Medicamentos:</strong>{' '}
                        <span className="text-slate-600">{paciente.medicamentos}</span>
                      </p>
                    )}
                    {paciente.suplementos && (
                      <p>
                        <strong className="text-slate-700">Suplementos:</strong>{' '}
                        <span className="text-slate-600">{paciente.suplementos}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Hábitos */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Heart className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    Rotina e Hábitos
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Refeições / dia
                    </span>
                    <span className="text-base font-bold text-slate-800">
                      {paciente.refeicoes_por_dia || 'Não inf.'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Água / dia
                    </span>
                    <span className="text-base font-bold text-slate-800">
                      {paciente.litros_agua ? `${paciente.litros_agua} L` : 'Não inf.'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Acorda às
                    </span>
                    <span className="text-base font-bold text-slate-800">
                      {paciente.horario_acorda || 'Não inf.'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Dorme às
                    </span>
                    <span className="text-base font-bold text-slate-800">
                      {paciente.horario_dorme || 'Não inf.'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    Atividade Física
                  </span>
                  <p className="text-xs font-semibold text-slate-700">
                    {paciente.atividade_fisica ? 'Pratica atividade regular' : 'Não pratica atividade regular'}
                  </p>
                  {paciente.atividade_fisica_descricao && (
                    <p className="text-xs text-slate-500 mt-1">
                      {paciente.atividade_fisica_descricao}
                    </p>
                  )}
                </div>

                {paciente.observacoes && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                      Observações Gerais
                    </span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                      {paciente.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

