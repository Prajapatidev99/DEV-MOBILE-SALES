import * as React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Replaced constructor with a public class field for state initialization. This resolves a series of TypeScript errors where 'state' and 'props' were not being recognized on the component instance. This modern syntax is cleaner and ensures the component state is correctly typed and initialized.
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service or the console
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render a custom fallback UI
      return (
        <div style={{
          padding: '2rem',
          backgroundColor: '#111827',
          color: 'white',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '1rem' }}>Oops! Something went wrong.</h1>
          <p style={{ color: '#d1d5db', fontSize: '1.1rem' }}>We're sorry for the inconvenience. Please try refreshing the page to continue.</p>
          {this.state.error && (
            <details style={{ marginTop: '2.5rem', backgroundColor: '#1f2937', padding: '1.5rem', borderRadius: '8px', width: '90%', maxWidth: '800px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
              <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#e5e7eb', background: '#374151', padding: '1rem', borderRadius: '4px' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;