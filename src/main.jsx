import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";

class RenderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Erro ao renderizar a LP:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="runtime-error-screen">
          <div>
            <h1>Erro ao carregar a página</h1>
            <p>Abra o console do navegador e confira a mensagem. Normalmente é arquivo antigo em cache ou cópia parcial do projeto.</p>
            <pre>{String(this.state.error?.message || this.state.error || "Erro desconhecido")}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

try {
  createRoot(rootElement).render(
    <React.StrictMode>
      <RenderErrorBoundary>
        <App />
      </RenderErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error("Falha crítica ao iniciar React:", error);
  rootElement.innerHTML = `
    <div class="runtime-error-screen">
      <div>
        <h1>Falha crítica ao iniciar React</h1>
        <p>Rode pelo servidor do Vite: npm run dev. Não abra o index.html direto pelo Windows.</p>
        <pre>${String(error?.message || error)}</pre>
      </div>
    </div>
  `;
}
