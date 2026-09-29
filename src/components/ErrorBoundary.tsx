import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PackPramana ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="container"
          style={{
            padding: 'var(--space-12) var(--space-4)',
            maxWidth: '640px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-danger-subtle)',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4) auto',
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ marginBottom: 'var(--space-2)' }}>Something unexpected happened</h2>
            <p
              style={{
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-6)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              The application encountered an error while rendering this view. Your scenario inputs
              remain saved in memory and browser storage.
            </p>

            {this.state.error && (
              <pre
                style={{
                  backgroundColor: 'var(--color-surface-sunken)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-xs)',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: 'var(--space-6)',
                  color: 'var(--color-danger)',
                }}
              >
                {this.state.error.message}
              </pre>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <button type="button" onClick={this.handleReset} className="btn-primary">
                <RefreshCw size={16} />
                <span>Retry View</span>
              </button>
              <button type="button" onClick={this.handleGoHome} className="btn-secondary">
                <Home size={16} />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
