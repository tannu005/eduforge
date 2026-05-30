import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class BlockErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BlockErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="flex flex-col gap-3 p-4 border border-rose-500/20 bg-rose-950/20 text-rose-200 rounded-xl shadow-inner max-w-full"
          role="alert"
          aria-label="Content component error"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
            <h4 className="font-semibold text-sm">Block Rendering Failed</h4>
          </div>
          <p className="text-xs text-rose-300/80 leading-relaxed font-mono overflow-auto max-h-20 bg-slate-950/40 p-2 rounded">
            {this.state.error?.message || this.props.fallbackMessage || 'An unexpected rendering error occurred inside this block.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center justify-center gap-2 self-start px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/30 text-rose-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer focus:ring-2 focus:ring-rose-500 focus:outline-none"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry Rendering
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
