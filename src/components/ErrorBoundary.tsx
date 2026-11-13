import React, { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Ops! Ocorreu um erro ao carregar esta tela</h2>
          <p className="text-sm text-slate-500 max-w-md mb-4 bg-white p-4 rounded-xl border border-slate-200 font-mono text-left text-xs overflow-auto max-h-40">
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recarregar página</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

