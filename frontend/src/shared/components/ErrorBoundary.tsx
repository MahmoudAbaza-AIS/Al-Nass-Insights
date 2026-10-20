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
