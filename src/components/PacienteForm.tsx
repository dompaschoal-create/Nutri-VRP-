import React, { useState, useMemo } from 'react';
import { createPaciente, type PacienteCadastroInput } from '../lib/db';
import {
  User,
  Activity,
  Heart,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Scale,
  Ruler,
  Calculator,
  Droplets,
  Clock,
  Sparkles
} from 'lucide-react';

interface PacienteFormProps {
  user: any;
  onCancel: () => void;
  onSuccess: (newPatientId: string) => void;
}

export const PacienteForm: React.FC<PacienteFormProps> = ({
  user,
  onCancel,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'pessoal' | 'clinico' | 'habitos'>('pessoal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Aba 1: Pessoal ---
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // --- Aba 2: Clínico ---
  const [pesoAtual, setPesoAtual] = useState<string>('');
  const [alturaCm, setAlturaCm] = useState<string>('');
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [objetivoTexto, setObjetivoTexto] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');
  const [patologias, setPatologias] = useState<string[]>([]);
  const [patologiaLivre, setPatologiaLivre] = useState('');
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [restricaoLivre, setRestricaoLivre] = useState('');
  const [alergias, setAlergias] = useState<string[]>([]);
  const [alergiaLivre, setAlergiaLivre] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  // --- Aba 3: Hábitos ---
  const [refeicoesPorDia, setRefeicoesPorDia] = useState<string>('');
  const [horarioAcordaInput, setHorarioAcordaInput] = useState('');
  const [horarioDormeInput, setHorarioDormeInput] = useState('');
  const [litrosAgua, setLitrosAgua] = useState<string>('');
  const [praticaAtividade, setPraticaAtividade] = useState<boolean>(false);
  const [atividadeDescricao, setAtividadeDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Cálculos automáticos
  const idade = useMemo(() => {
    if (!dataNascimento) return null;
    const birth = new Date(dataNascimento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return isNaN(age) || age < 0 ? null : age;
  }, [dataNascimento]);

  const imcCalculado = useMemo(() => {
    const p = parseFloat(pesoAtual.replace(',', '.'));
    const a = parseFloat(alturaCm.replace(',', '.'));
    if (!p || !a || a <= 0) return null;
    const aMetros = a > 3 ? a / 100 : a; // se digitou em cm (ex: 175) converte para metros (1.75)
    const valor = p / (aMetros * aMetros);
    if (isNaN(valor) || valor <= 0) return null;

    let classificacao = '';
    if (valor < 18.5) classificacao = 'Abaixo do peso';
    else if (valor < 24.9) classificacao = 'Peso normal';
    else if (valor < 29.9) classificacao = 'Sobrepeso';
    else if (valor < 34.9) classificacao = 'Obesidade Grau I';
    else if (valor < 39.9) classificacao = 'Obesidade Grau II';
    else classificacao = 'Obesidade Grau III';

    return {
      valor: valor.toFixed(1),
      classificacao,
    };
  }, [pesoAtual, alturaCm]);

  // Formatador automático de horário inteligente (ex: 6 -> 06:00, 630 -> 06:30, 2230 -> 22:30)
  const formatTimeInput = (val: string): string => {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 2) {
      const h = parseInt(digits, 10);
      if (h >= 0 && h <= 23) {
        return `${digits.padStart(2, '0')}:00`;
      }
    } else if (digits.length === 3) {
      const h = digits.slice(0, 1).padStart(2, '0');
      const m = digits.slice(1, 3);
      return `${h}:${m}`;
    } else if (digits.length >= 4) {
      const h = digits.slice(0, 2);
      const m = digits.slice(2, 4);
      return `${h}:${m}`;
    }
    return val;
  };

  // Formatação de telefone
  const formatPhone = (val: string): string => {
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 10) {
      return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };

  // Manipuladores de múltipla escolha
  const toggleArrayItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (item === 'Nenhum') {
      if (list.includes('Nenhum')) {
        setList([]);
      } else {
        setList(['Nenhum']);
      }
      return;
    }

    const withoutNenhum = list.filter((i) => i !== 'Nenhum');
    if (withoutNenhum.includes(item)) {
      setList(withoutNenhum.filter((i) => i !== item));
    } else {
      setList([...withoutNenhum, item]);
    }
  };

  const addCustomItem = (
    list: string[],
    setList: (l: string[]) => void,
    itemValue: string,
    clearInput: () => void
  ) => {
    const trimmed = itemValue.trim();
    if (!trimmed) return;
    const withoutNenhum = list.filter((i) => i !== 'Nenhum');
    if (!withoutNenhum.includes(trimmed)) {
      setList([...withoutNenhum, trimmed]);
    }
    clearInput();
  };

  const removeItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    setList(list.filter((i) => i !== item));
  };

  // Submissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim()) {
      setActiveTab('pessoal');
      setError('O nome completo do paciente é obrigatório.');
      return;
    }

    setLoading(true);

    try {
      const pNum = pesoAtual ? parseFloat(pesoAtual.replace(',', '.')) : null;
      let aNum = alturaCm ? parseFloat(alturaCm.replace(',', '.')) : null;
      // Normaliza altura para cm no banco caso tenha sido digitada em metros (ex: 1.75 -> 175)
      if (aNum && aNum < 3) aNum = aNum * 100;

      const payload: PacienteCadastroInput = {
        nutricionista_id: user.id,
        nome: nome.trim(),
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        telefone: telefone || null,
        whatsapp: whatsapp || null,
        email: email.trim().toLowerCase() || null,

        peso_inicial: pNum,
        altura: aNum,
        objetivos,
        objetivo_texto: objetivoTexto.trim() || null,
        nivel_atividade: nivelAtividade || null,
        patologias: patologias.filter((p) => p !== 'Nenhum'),
        restricoes_alimentares: restricoes.filter((r) => r !== 'Nenhum'),
        alergias: alergias.filter((a) => a !== 'Nenhum'),
        medicamentos: medicamentos.trim() || null,
        suplementos: suplementos.trim() || null,

        refeicoes_por_dia: refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null,
        horario_acorda: horarioAcordaInput || null,
        horario_dorme: horarioDormeInput || null,
        litros_agua: litrosAgua ? parseFloat(litrosAgua.replace(',', '.')) : null,
        atividade_fisica: praticaAtividade,
        atividade_fisica_descricao: praticaAtividade ? atividadeDescricao.trim() || null : null,
        observacoes: observacoes.trim() || null,
      };

      const result = await createPaciente(payload);

      if (result?.id) {
        onSuccess(result.id);
      } else {
        throw new Error('Não foi possível obter o ID do paciente cadastrado.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erro ao salvar paciente no banco de dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Voltar para a listagem"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Novo Paciente</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Preencha os dados do prontuário do paciente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md shadow-blue-600/20 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Salvar Paciente</span>
          </button>
        </div>
      </header>

      {/* Container Principal */}
      <div className="p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Abas do Formulário */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pessoal')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'pessoal'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Pessoal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinico')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'clinico'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>2. Clínico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habitos')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'habitos'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>3. Hábitos</span>
          </button>
        </div>

        {/* Formulário por Abas */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          {/* ================= ABA 1: PESSOAL ================= */}
          {activeTab === 'pessoal' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-800">Dados Pessoais</h3>
                <p className="text-xs text-slate-500">
                  Identificação e meios de contato do paciente (apenas o nome completo é obrigatório).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nome completo */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João da Silva Santos"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Data de Nascimento com cálculo de idade */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Data de Nascimento
                    </label>
                    {idade !== null && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {idade} {idade === 1 ? 'ano' : 'anos'}
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sexo
                  </label>
                  <select
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  >
                    <option value="">Selecione...</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="paciente@exemplo.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('clinico')}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  Avançar para Clínico →
                </button>
              </div>
            </div>
          )}

          {/* ================= ABA 2: CLÍNICO ================= */}
          {activeTab === 'clinico' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-800">Avaliação Clínica e Objetivos</h3>
                <p className="text-xs text-slate-500">
                  Antropometria, metas nutricionais, condições de saúde e medicações.
                </p>
              </div>

              {/* Antropometria com IMC Automático */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                {/* Peso */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-blue-600" />
                    <span>Peso Atual</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pesoAtual}
                      onChange={(e) => setPesoAtual(e.target.value)}
                      placeholder="72.5"
                      className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      kg
                    </span>
                  </div>
                </div>

                {/* Altura */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-blue-600" />
                    <span>Altura</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={alturaCm}
                      onChange={(e) => setAlturaCm(e.target.value)}
                      placeholder="175"
                      className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      cm
                    </span>
                  </div>
                </div>

                {/* IMC Calculado */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-amber-500" />
                    <span>IMC (Automático)</span>
                  </label>
                  <div className="h-[42px] px-4 py-2 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
                    {imcCalculado ? (
                      <>
                        <span className="text-base font-extrabold text-amber-900">
                          {imcCalculado.valor}
                        </span>
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                          {imcCalculado.classificacao}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Preencha peso e altura</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Objetivos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Objetivos Principais (Múltipla escolha)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    'Emagrecer',
                    'Ganhar massa',
                    'Controlar diabetes',
                    'Saúde geral',
                    'Performance esportiva',
                    'Reeducação alimentar',
                  ].map((obj) => (
                    <button
                      type="button"
                      key={obj}
                      onClick={() => toggleArrayItem(objetivos, setObjetivos, obj)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        objetivos.includes(obj)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {obj}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={objetivoTexto}
                  onChange={(e) => setObjetivoTexto(e.target.value)}
                  placeholder="Objetivo detalhado adicional (opcional)..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              {/* Nível de Atividade Física */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Nível de Atividade Física
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    'Sedentário',
                    'Levemente ativo',
                    'Moderadamente ativo',
                    'Muito ativo',
                    'Extremamente ativo',
                  ].map((nivel) => (
                    <button
                      type="button"
                      key={nivel}
                      onClick={() => setNivelAtividade(nivel)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-center border transition cursor-pointer ${
                        nivelAtividade === nivel
                          ? 'bg-blue-50 text-blue-700 border-blue-500 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {nivel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patologias ou condições de saúde */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Patologias ou Condições de Saúde
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    'Nenhum',
                    'Diabetes',
                    'Hipertensão',
                    'Hipotireoidismo',
                    'Hipertireoidismo',
                    'Síndrome do ovário policístico',
                    'Doença celíaca',
                    'Colesterol alto',
                  ].map((pat) => (
                    <button
                      type="button"
                      key={pat}
                      onClick={() => toggleArrayItem(patologias, setPatologias, pat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        patologias.includes(pat)
                          ? pat === 'Nenhum'
                            ? 'bg-slate-700 text-white border-slate-700'
                            : 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pat}
                    </button>
                  ))}
                </div>

                {/* Tags customizadas já adicionadas */}
                {patologias.filter((p) => ![
                  'Nenhum',
                  'Diabetes',
                  'Hipertensão',
                  'Hipotireoidismo',
                  'Hipertireoidismo',
                  'Síndrome do ovário policístico',
                  'Doença celíaca',
                  'Colesterol alto',
                ].includes(p)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {patologias
                      .filter((p) => ![
                        'Nenhum',
                        'Diabetes',
                        'Hipertensão',
                        'Hipotireoidismo',
                        'Hipertireoidismo',
                        'Síndrome do ovário policístico',
                        'Doença celíaca',
                        'Colesterol alto',
                      ].includes(p))
                      .map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium"
                        >
                          {p}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-red-500"
                            onClick={() => removeItem(patologias, setPatologias, p)}
                          />
                        </span>
                      ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={patologiaLivre}
                    onChange={(e) => setPatologiaLivre(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem(patologias, setPatologias, patologiaLivre, () => setPatologiaLivre(''));
                      }
                    }}
                    placeholder="Adicionar outra patologia..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(patologias, setPatologias, patologiaLivre, () => setPatologiaLivre(''))}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Restrições Alimentares */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Restrições Alimentares
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['Nenhum', 'Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'].map((rest) => (
                    <button
                      type="button"
                      key={rest}
                      onClick={() => toggleArrayItem(restricoes, setRestricoes, rest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        restricoes.includes(rest)
                          ? rest === 'Nenhum'
                            ? 'bg-slate-700 text-white border-slate-700'
                            : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {rest}
                    </button>
                  ))}
                </div>

                {/* Custom items */}
                {restricoes.filter((r) => !['Nenhum', 'Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'].includes(r)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {restricoes
                      .filter((r) => !['Nenhum', 'Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'].includes(r))
                      .map((r) => (
                        <span
                          key={r}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-medium"
                        >
                          {r}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-red-500"
                            onClick={() => removeItem(restricoes, setRestricoes, r)}
                          />
                        </span>
                      ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={restricaoLivre}
                    onChange={(e) => setRestricaoLivre(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem(restricoes, setRestricoes, restricaoLivre, () => setRestricaoLivre(''));
                      }
                    }}
                    placeholder="Adicionar outra restrição alimentar..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(restricoes, setRestricoes, restricaoLivre, () => setRestricaoLivre(''))}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Alergias Alimentares */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Alergias Alimentares
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['Nenhum', 'Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'].map((alerg) => (
                    <button
                      type="button"
                      key={alerg}
                      onClick={() => toggleArrayItem(alergias, setAlergias, alerg)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        alergias.includes(alerg)
                          ? alerg === 'Nenhum'
                            ? 'bg-slate-700 text-white border-slate-700'
                            : 'bg-red-500 text-white border-red-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {alerg}
                    </button>
                  ))}
                </div>

                {alergias.filter((a) => !['Nenhum', 'Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'].includes(a)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {alergias
                      .filter((a) => !['Nenhum', 'Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'].includes(a))
                      .map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs font-medium"
                        >
                          {a}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-red-500"
                            onClick={() => removeItem(alergias, setAlergias, a)}
                          />
                        </span>
                      ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={alergiaLivre}
                    onChange={(e) => setAlergiaLivre(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem(alergias, setAlergias, alergiaLivre, () => setAlergiaLivre(''));
                      }
                    }}
                    placeholder="Adicionar outra alergia alimentar..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(alergias, setAlergias, alergiaLivre, () => setAlergiaLivre(''))}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Medicamentos e Suplementos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Medicamentos Contínuos
                  </label>
                  <textarea
                    rows={2}
                    value={medicamentos}
                    onChange={(e) => setMedicamentos(e.target.value)}
                    placeholder="Ex: Losartana 50mg, Levotiroxina 75mcg..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Suplementos em Uso
                  </label>
                  <textarea
                    rows={2}
                    value={suplementos}
                    onChange={(e) => setSuplementos(e.target.value)}
                    placeholder="Ex: Creatina 5g, Vitamina D3 2000UI..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('pessoal')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  ← Voltar para Pessoal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('habitos')}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  Avançar para Hábitos →
                </button>
              </div>
            </div>
          )}

          {/* ================= ABA 3: HÁBITOS ================= */}
          {activeTab === 'habitos' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-800">Rotina e Hábitos de Vida</h3>
                <p className="text-xs text-slate-500">
                  Horários, hidratação, sono, rotina de exercícios e observações gerais.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {/* Refeições por dia */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Refeições por dia
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={refeicoesPorDia}
                    onChange={(e) => setRefeicoesPorDia(e.target.value)}
                    placeholder="Ex: 4"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Horário que acorda */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Horário que acorda</span>
                  </label>
                  <input
                    type="text"
                    value={horarioAcordaInput}
                    onChange={(e) => setHorarioAcordaInput(e.target.value)}
                    onBlur={(e) => setHorarioAcordaInput(formatTimeInput(e.target.value))}
                    placeholder="Ex: 6 → 06:00"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Horário que dorme */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Horário que dorme</span>
                  </label>
                  <input
                    type="text"
                    value={horarioDormeInput}
                    onChange={(e) => setHorarioDormeInput(e.target.value)}
                    onBlur={(e) => setHorarioDormeInput(formatTimeInput(e.target.value))}
                    placeholder="Ex: 23 → 23:00"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Quantidade de água por dia */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>Água por dia</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={litrosAgua}
                      onChange={(e) => setLitrosAgua(e.target.value)}
                      placeholder="Ex: 2.5"
                      className="w-full pl-4 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      litros
                    </span>
                  </div>
                </div>
              </div>

              {/* Atividade física */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">
                      Pratica atividade física regularmente?
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Indique se o paciente possui rotina de exercícios esportivos ou musculação.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPraticaAtividade(true)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        praticaAtividade
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPraticaAtividade(false);
                        setAtividadeDescricao('');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        !praticaAtividade
                          ? 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                {praticaAtividade && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Qual atividade física e frequência semanal?
                    </label>
                    <input
                      type="text"
                      value={atividadeDescricao}
                      onChange={(e) => setAtividadeDescricao(e.target.value)}
                      placeholder="Ex: Musculação 4x na semana e corrida aos sábados"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    />
                  </div>
                )}
              </div>

              {/* Observações Gerais */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Observações Gerais
                </label>
                <textarea
                  rows={4}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Anotações clínicas livres, queixas principais, histórico familiar ou detalhes adicionais do paciente..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('clinico')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  ← Voltar para Clínico
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md shadow-blue-600/25 transition cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Concluir e Salvar Paciente</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

