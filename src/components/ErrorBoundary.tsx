import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Global error boundary. Catches render-time errors anywhere in the app tree
 * and shows a friendly bilingual fallback instead of a blank white screen.
 * Errors are logged to the console so they are never swallowed silently.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5] p-6">
          <div className="w-full max-w-md rounded-2xl border border-[#E7E7E4] bg-white p-8 text-center shadow-sm">
            <h1 className="mb-2 text-lg font-semibold text-black">
              Something went wrong
            </h1>
            <p className="font-devanagari mb-4 text-base font-medium text-black">
              काहीतरी चूक झाली
            </p>
            <p className="mb-1 text-sm text-[#6B6B6B]">
              An unexpected error occurred. Please reload the page to continue.
            </p>
            <p className="font-devanagari mb-6 text-sm text-[#6B6B6B]">
              अनपेक्षित त्रुटी आली. कृपया पुढे जाण्यासाठी पृष्ठ पुन्हा लोड करा.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-medium text-white transition-all hover:bg-[#1a1a1a]"
            >
              Reload / पुन्हा लोड करा
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
