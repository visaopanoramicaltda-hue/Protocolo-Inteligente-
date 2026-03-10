<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Protocolo Inteligente

Aplicativo de Gestão de Portaria com IA — Angular 21, Firebase, Gemini e Mercado Pago.

> **📋 Quer copiar e usar em outro ambiente?** Veja o **[Guia Completo (SETUP.md)](SETUP.md)**

---

## Início Rápido

**Pré-requisitos:** Node.js 20+ ([instalar](https://nodejs.org))

```bash
# 1. Clonar
git clone https://github.com/visaopanoramicaltda-hue/Protocolo-Inteligente-.git
cd Protocolo-Inteligente-

# 2. Instalar dependências
npm install --legacy-peer-deps

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves (Gemini, Mercado Pago)

# 4. Rodar
npx ng serve
# → http://localhost:3000
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

---

## 📖 Documentação

- **[SETUP.md](SETUP.md)** — Guia completo para copiar e rodar em outro ambiente (clone, Docker, Firebase, CI/CD)
- **[BENCHMARKS.md](BENCHMARKS.md)** — Benchmarks de desempenho
