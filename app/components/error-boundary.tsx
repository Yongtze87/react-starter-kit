import React from 'react';
import { Button } from './ui/button';
import { NeoCard, NeoCardContent, NeoCardHeader, NeoCardTitle } from './ui/neo-card';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree and displays
 * a fallback UI instead of crashing the entire app.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('Error Boundary caught an error:', error, errorInfo);

    // TODO: Send to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <NeoCard className="max-w-md w-full bg-[#ffe5e5]">
            <NeoCardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#ff6b6b] p-2 rounded-lg border-2 border-black">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <NeoCardTitle className="text-base font-bold">
                  Oops! Something went wrong
                </NeoCardTitle>
              </div>
            </NeoCardHeader>
            <NeoCardContent className="p-4 pt-0">
              <p className="text-sm font-semibold text-[#666] mb-4">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>

              {this.state.error && (
                <details className="mb-4">
                  <summary className="text-xs font-bold text-[#666] cursor-pointer hover:text-black">
                    Error details
                  </summary>
                  <pre className="mt-2 p-3 bg-white border-2 border-black rounded-lg text-xs overflow-auto max-h-32">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 neo-btn bg-black text-white hover:bg-black/90 font-bold"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1 neo-btn bg-white hover:bg-[#f9f9f9] font-bold"
                >
                  Reload Page
                </Button>
              </div>
            </NeoCardContent>
          </NeoCard>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based alternative for functional components (wraps class-based ErrorBoundary)
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
