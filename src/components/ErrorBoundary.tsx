import { Component, type ReactNode } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

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

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#1c1c1e] rounded-3xl p-8 max-w-md w-full border border-white/10 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-bold">Moon Calendar</h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Ocorreu um pequeno erro de inicialização. Clique abaixo para restaurar o aplicativo com segurança.
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Restaurar & Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
