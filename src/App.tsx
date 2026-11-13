import { useEffect, useState } from 'react';
import { authClient } from './lib/auth-client';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { Activity } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await authClient.getSession();
        if (error || !data?.user) {
          setUser(null);
        } else {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Erro na verificação de sessão:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Visual de carregamento alinhado ao design Nutri VRP@ (Azul & Amarelo)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4 animate-bounce">
          <Activity className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-amber-400 rounded-full animate-spin" />
          <span>Carregando Nutri VRP@...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={(loggedUser) => setUser(loggedUser)} />;
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}
