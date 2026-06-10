import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <h1 style={{ fontSize: "48px" }}>500</h1>
          <p>Etwas ist schiefgelaufen. Bitte lade die Seite neu.</p>
          <button onClick={() => window.location.reload()}>Neu laden</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
