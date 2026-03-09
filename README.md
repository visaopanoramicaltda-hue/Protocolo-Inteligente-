<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Protocolo Inteligente

## Executar Localmente

**Pré-requisitos:** Node.js 20+

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Execute o servidor de desenvolvimento:
   ```bash
   npx ng serve
   ```

---

## 🚀 Deploy

### Opção 1 — Google Cloud Shell (recomendado)

1. Abra o [Google Cloud Shell](https://shell.cloud.google.com)
2. Clone o repositório:
   ```bash
   git clone https://github.com/visaopanoramicaltda-hue/Protocolo-Inteligente-.git
   cd Protocolo-Inteligente-
   ```
3. Crie o arquivo `.env` com suas credenciais:
   ```bash
   cp .env.example .env
   nano .env          # preencha FIREBASE_PROJECT_ID, GEMINI_API_KEY, MERCADO_PAGO_TOKEN
   ```
4. Execute o deploy:
   ```bash
   bash deploy.sh
   ```
   O script instala as dependências, faz o build e envia para o Firebase Hosting automaticamente.

### Opção 2 — Google Cloud Build

1. No Console do Google Cloud, ative a API **Cloud Build** e **Secret Manager**
2. Crie os segredos no Secret Manager:
   ```bash
   echo -n "SUA_CHAVE" | gcloud secrets create GEMINI_API_KEY --data-file=-
   echo -n "SEU_TOKEN" | gcloud secrets create MERCADO_PAGO_TOKEN --data-file=-
   ```
3. Crie a imagem do Firebase para o Cloud Build:
   ```bash
   git clone https://github.com/nickstenning/docker-firebase.git /tmp/docker-firebase
   cd /tmp/docker-firebase && gcloud builds submit --tag gcr.io/$PROJECT_ID/firebase
   ```
4. Execute o build:
   ```bash
   gcloud builds submit --config=cloudbuild.yaml
   ```

### Opção 3 — GitHub Actions (automático)

O deploy acontece automaticamente via GitHub Actions quando há push na branch `main`.

Você precisa configurar **4 Secrets** no GitHub:

1. Vá em **Settings → Secrets and variables → Actions → New repository secret**
2. Crie os seguintes secrets:

| Secret | Descrição |
|--------|-----------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON da conta de serviço do Firebase (gere em Console Firebase → Configurações do projeto → Contas de serviço → Gerar nova chave privada) |
| `FIREBASE_PROJECT_ID` | ID do seu projeto Firebase (ex: `protocolo-digital-v2-8`) |
| `GEMINI_API_KEY` | Chave de API do Google Gemini |
| `MERCADO_PAGO_TOKEN` | Token de acesso do Mercado Pago |

Ou vá em **Actions → Deploy Firebase Hosting → Run workflow** para executar manualmente.

### URL do App

Após o deploy: `https://FIREBASE_PROJECT_ID.web.app`
