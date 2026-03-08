<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/db36df68-5f05-43fb-8e35-647354abae6f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## 🚀 PRÓXIMOS PASSOS — Deploy no Firebase Hosting

> Para publicar o app na internet, siga o **[DEPLOY.md](DEPLOY.md)** — guia completo passo a passo em português.

**Passos resumidos:**

- **Passo 1** — Criar o projeto no Firebase
- **Passo 2** — Ativar o Firebase Hosting
- **Passo 3** — Gerar a conta de serviço do Firebase
- **Passo 4** — Acessar as configurações de Secrets do repositório
- **Passo 5** — Adicionar os 4 Secrets obrigatórios (`FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`, `GEMINI_API_KEY`, `MERCADO_PAGO_TOKEN`)
- **Passo 6** — Disparar o deploy manualmente via GitHub Actions
- **Passo 7** — Deploy automático a cada push para `main`
- **Passo 8** — Acessar o app em `https://SEU_PROJECT_ID.web.app`

👉 **[Ver guia completo →](DEPLOY.md)**
