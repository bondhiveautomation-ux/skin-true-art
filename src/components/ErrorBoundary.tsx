import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
  info?: React.ErrorInfo;
  unhandled?: string;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("App crashed:", error, info);
    this.setState({ info });
  }

  componentDidMount() {
    window.addEventListener("unhandledrejection", this.onUnhandledRejection);
    window.addEventListener("error", this.onWindowError);
  }

  componentWillUnmount() {
    window.removeEventListener("unhandledrejection", this.onUnhandledRejection);
    window.removeEventListener("error", this.onWindowError);
  }

  private onUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
    // eslint-disable-next-line no-console
    console.error("Unhandled promise rejection:", event.reason);
    this.setState({ hasError: true, unhandled: reason });
  };

  private onWindowError = (event: ErrorEvent) => {
    // eslint-disable-next-line no-console
    console.error("Window error:", event.error || event.message);
    const msg = event.error instanceof Error ? event.error.message : event.message;
    this.setState({ hasError: true, unhandled: msg });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const title = "The app crashed";
    const message = this.state.error?.message || this.state.unhandled || "Unknown error";
    const stack = this.state.error?.stack || this.state.info?.componentStack;

    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <section className="max-w-2xl w-full rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong while rendering this page. The details below will help us fix it.
          </p>

          <div className="mt-4 rounded-lg border border-border bg-background p-4">
            <div className="text-sm font-medium">Error</div>
            <div className="mt-1 text-sm text-destructive break-words">{message}</div>
          </div>

          {stack ? (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Technical details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-4 text-xs text-muted-foreground">
                {stack}
              </pre>
            </details>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={this.handleReload} variant="default">
              Reload
            </Button>
          </div>
        </section>
      </main>
    );
  }
}
