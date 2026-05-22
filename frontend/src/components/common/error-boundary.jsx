import { Component } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("Application error:", error);
      console.error("Error info:", errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-svh items-center justify-center bg-background p-4 text-foreground">
        <section className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>

          <h1 className="mt-5 text-xl font-semibold tracking-tight">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The application ran into an unexpected error. You can try again or
            reload the page.
          </p>

          {import.meta.env.DEV && this.state.error?.message ? (
            <pre className="scrollbar-soft mt-4 max-h-32 overflow-auto rounded-lg border bg-muted p-3 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" variant="outline" onClick={this.handleReset}>
              Try again
            </Button>

            <Button type="button" onClick={this.handleReload}>
              <RefreshCcw className="size-4" />
              Reload page
            </Button>
          </div>
        </section>
      </main>
    );
  }
}