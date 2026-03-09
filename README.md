<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Protocolo Inteligente

## Executar Localmente

**Pré-requisitos:** Node.js 20+

1. Instale as dependências:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Execute o servidor de desenvolvimento:
   ```bash
   npx ng serve
   ```

---

## 🚀 Deploy no Firebase

O deploy acontece automaticamente via GitHub Actions quando há push na branch `main`.

### Pré-requisitos para o Deploy

Você precisa configurar **4 Secrets** no GitHub:

1. Vá em **Settings → Secrets and variables → Actions → New repository secret**
2. Crie os seguintes secrets:

| Secret | Descrição |
|--------|-----------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON da conta de serviço do Firebase (gere em Console Firebase → Configurações do projeto → Contas de serviço → Gerar nova chave privada) |
| `FIREBASE_PROJECT_ID` | ID do seu projeto Firebase (ex: `protocolo-digital-v2-8`) |
| `GEMINI_API_KEY` | Chave de API do Google Gemini |
| `MERCADO_PAGO_TOKEN` | Token de acesso do Mercado Pago |

### Como fazer o Deploy

1. **Merge este PR na branch `main`** — o deploy será executado automaticamente
2. Ou vá em **Actions → Deploy Firebase Hosting → Run workflow** para executar manualmente

### URL do App

Após o deploy: `https://FIREBASE_PROJECT_ID.web.app`
