import React, { useState } from 'react';
import { authClient } from '../lib/auth-client';
import { syncNutricionista } from '../lib/db';
import { EkgHeartbeatLine } from './EkgHeartbeatLine';
import { Activity, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onSuccess: (user: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Por favor, informe um email válido.');
      return;
    }

    if (password.length < 9) {
      setError('A senha deve conter no mínimo 9 caracteres.');
      return;
    }

    if (!isLogin) {
      if (!nome.trim()) {
        setError('Por favor, informe seu nome completo.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas digitadas não coincidem.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: authError } = await authClient.signIn.email({
          email: cleanEmail,
          password: password,
        });

        if (authError) {
          setError(authError.message || 'Credenciais inválidas. Verifique seu email e senha.');
          setLoading(false);
          return;
        }

        if (data?.user) {
          onSuccess(data.user);
        }
      } else {
        const { data, error: authError } = await authClient.signUp.email({
          email: cleanEmail,
          password: password,
          name: nome.trim(),
        });

        if (authError) {
          setError(authError.message || 'Erro ao criar conta. Tente novamente.');
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Garantir registro imediato do nutricionista no banco
          await syncNutricionista(data.user.id, nome.trim(), cleanEmail);
          onSuccess(data.user);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Ocorreu um erro inesperado ao conectar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-amber-50/40 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Topo / Logo Nutri VRP@ */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-3">
            {/* Efeito de brilho pulsante de fundo */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-400 blur-lg opacity-40 animate-pulse pointer-events-none" />
            
            {/* Ícone com animação de flutuação e batimento cardíaco */}
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 text-white shadow-xl shadow-blue-600/25 border border-white/40 animate-float-icon">
              <Activity className="w-8 h-8 text-white animate-heartbeat" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-1 animate-logo-wave">
            <span className="hover:text-blue-600 transition-colors">Nutri</span>
            <span className="text-blue-600">VRP</span>
            <span className="text-amber-500 font-black animate-at-shimmer">@</span>
          </h1>

          {/* Linha simulando o batimento cardíaco (EKG) */}
          <div className="w-44 mx-auto my-1.5 flex justify-center">
            <EkgHeartbeatLine width={180} height={24} />
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-semibold uppercase tracking-wider">
            Gestão Nutricional Integrada
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200/80 p-8 relative overflow-hidden">
          {/* Barra decorativa com gradiente azul e amarelo */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-amber-400" />

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {isLogin ? 'Acessar sua conta' : 'Criar nova conta'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isLogin
                ? 'Insira suas credenciais para gerenciar seus pacientes'
                : 'Cadastre-se para iniciar a gestão clínica nutricional'}
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Dra. Maria Silva"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-mail Profissional
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nutri@exemplo.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Senha (mínimo 9 caracteres)
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="•••••••••"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:to-blue-900 disabled:opacity-70 text-white font-semibold rounded-xl shadow-md shadow-blue-600/25 transition cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Entrar' : 'Criar conta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle de Modo */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            {isLogin ? (
              <p className="text-xs text-slate-600">
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError(null);
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Faça login
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Rodapé Seguro */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Ambiente Seguro e Criptografado</span>
        </div>
      </div>
    </div>
  );
};
