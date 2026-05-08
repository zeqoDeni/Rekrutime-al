import React, { ReactNode } from 'react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary Component
 * Catches React component errors and displays them gracefully
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    toast.error('Ndodhi një gabim në aplikacion. Provoni të rilloadoni faqen.');
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="max-w-md space-y-4 rounded-lg border bg-card p-6 text-center shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">Diçka shkoi keq</h2>
            <p className="text-sm text-muted-foreground">
              Aplikacioni hasur një gabim të papritur. Ju lutem rilloadoni faqen ose provoni më vonë.
            </p>
            <details className="text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Detajet e gabimit
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs text-foreground">
                {this.state.error?.message}
              </pre>
            </details>
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Provo përsëri
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 rounded border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Rilload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
