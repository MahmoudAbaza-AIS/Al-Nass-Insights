import { Component, type ErrorInfo, type ReactNode } from "react";
import { WidgetErrorState } from "./WidgetErrorState";

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Widget failure", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <WidgetErrorState
          title={this.props.title ?? "Widget failed"}
          message="This section encountered an error and was isolated from the rest of the dashboard."
          onRetry={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}

/** Root-level boundary so an uncaught render error does not blank the entire SPA. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep diagnostics local and non-sensitive (no tokens / response bodies).
    console.error("Application failure", {
      name: error.name,
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      const detail = this.state.error.message?.trim();
      return (
        <div className="dash-app-bg flex min-h-screen items-center justify-center px-4">
          <WidgetErrorState
            title={this.props.title ?? "Something went wrong"}
            message={
              detail
                ? `The application hit an unexpected error (${detail}). You can try again or reload the page.`
                : "The application hit an unexpected error. You can try again or reload the page."
            }
            onRetry={() => this.setState({ error: null })}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
