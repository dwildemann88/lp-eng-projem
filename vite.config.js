import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function devLeadEndpoint(mode) {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    name: "projem-dev-lead-endpoint",
    configureServer(server) {
      server.middlewares.use("/api/lead", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", async () => {
          let payload = {};
          try {
            payload = JSON.parse(body || "{}");
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "invalid_json" }));
            return;
          }

          const webhookUrl = env.MAKE_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL || "";

          // No npm run dev, permite testar o fluxo visual mesmo sem Make configurado.
          // Em produção, a função Netlify exige MAKE_WEBHOOK_URL e não simula sucesso.
          if (!webhookUrl) {
            console.info("[dev] Lead recebido em modo simulado:", payload.lead_id || payload.nome || payload.telefone);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, dev_mock: true }));
            return;
          }

          try {
            const response = await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
              res.statusCode = 502;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, error: "make_webhook_error" }));
              return;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (error) {
            console.error("[dev] Erro ao enviar lead:", error);
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "lead_dev_endpoint_error" }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: "/",
  plugins: [react(), devLeadEndpoint(mode)],
  server: {
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
}));
