<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 📦 Simbiose – Protocolo Inteligente v9.9

Sistema de Gestão de Portaria com IA (Angular 21 + Gemini 2.0 Flash)

---

## 🚀 Como Visualizar o Aplicativo

### Opção A — Desenvolvimento Local (Recomendado para testar)

> ✅ Mais rápido. Sem necessidade de build. Hot-reload automático.

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse no navegador: **http://localhost:3000**

---

### Opção B — Build de Produção + Servidor Node

```bash
# 1. Instale as dependências
npm install

# 2. Gere o build de produção (pode levar alguns minutos)
npm run build

# 3. Inicie o servidor
npm start
```

Acesse no navegador: **http://localhost:8080**

---

### Opção C — Deploy no Firebase Hosting (Publicar Online)

```bash
# 1. Configure o projeto Firebase (apenas uma vez)
# Edite .firebaserc e substitua "your-project-id" pelo ID real do seu projeto Firebase

# 2. Faça login no Firebase
npx firebase login

# 3. Build + Deploy em um comando
npm run deploy
```

O app ficará disponível em: `https://<seu-projeto>.web.app`

> 💡 **Deploy automático via GitHub Actions:** o workflow `.github/workflows/firebase-hosting.yml`
> faz o deploy automaticamente a cada `push` na branch `main`/`master`.
> Configure os seguintes **GitHub Secrets** no repositório (Settings → Secrets and variables → Actions):
>
> | Secret | Obrigatório | Como obter |
> |---|---|---|
> | `FIREBASE_SERVICE_ACCOUNT` | ✅ | Firebase Console → Configurações do projeto → Contas de serviço → Gerar nova chave privada |
> | `FIREBASE_PROJECT_ID` | ✅ | ID do projeto Firebase (ex: `meu-app-12345`) |
> | `MERCADO_PAGO_TOKEN` | ⚠️ | Token de acesso MercadoPago (necessário para pagamentos) |
> | `GEMINI_API_KEY` | ⚠️ | Chave da API Google Gemini (necessária para funcionalidades de IA) |
>
> Pull Requests recebem um **preview channel** com URL temporária para revisão antes do merge.

---

### Opção D — Gerar ZIP para Download

```bash
npm install
npm run build:zip
```

Serão gerados dois arquivos ZIP na raiz do projeto:
- `Simbiose-Deploy-vX.X.X-TIMESTAMP.zip` — apenas os arquivos de produção (`dist/`)
- `Simbiose-Source-vX.X.X-TIMESTAMP.zip` — código-fonte completo (sem `node_modules` e sem arquivos sensíveis)

---

## ⚙️ Configuração da Chave de API (Gemini)

O arquivo `.env` na raiz do projeto já contém a `GEMINI_API_KEY`. Se precisar trocar:

1. Abra o arquivo `.env`
2. Substitua o valor de `GEMINI_API_KEY` pela sua chave obtida em: https://aistudio.google.com/apikey

```env
GEMINI_API_KEY=SUA_CHAVE_AQUI
```

---

## 📱 PWA / TWA (Android)

O app é uma PWA totalmente instalável. Para instalar no celular:
1. Abra o app no navegador do Android (Chrome)
2. Toque no menu (⋮) → **"Adicionar à tela inicial"**
3. Ou aguarde o banner de instalação automática

Para publicar na **Play Store como TWA**:
- Configure o `sha256_cert_fingerprints` em `src/assets/assetlinks.json`
- Use o **Bubblewrap CLI** ou o **PWABuilder** (https://www.pwabuilder.com)

---

## 🏗️ Estrutura do Projeto

```
📁 src/
  📁 components/
    📄 dashboard/        – Tela principal de encomendas
    📄 package-form/     – Formulário de entrada (scanner + OCR Gemini)
    📄 admin/            – Painel de controle administrativo
    📄 login/            – Autenticação de porteiros
  📁 services/
    📄 gemini.service.ts – OCR via Gemini 2.0 Flash
    📄 db.service.ts     – Banco de dados local (IndexedDB)
    📄 pdf.service.ts    – Geração de comprovantes PDF
    📁 core/
      📄 data-protection – Backup / Cofre Local
      📄 quantum-net     – Sincronização multi-dispositivo
📄 index.html           – HTML raiz do projeto (importmap Angular CDN + entrada ng serve)
📄 index.tsx            – Bootstrap Angular 21
📄 angular.json         – Config build Angular CLI
📄 firebase.json        – Config Firebase Hosting
📄 ngsw-config.json     – Service Worker (PWA offline)
📄 capacitor.config.ts  – Config TWA/Capacitor (Android/iOS)
```

---

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento (Angular CLI, porta 3000) |
| `npm run build` | Gera build de produção em `dist/` |
| `npm start` | Serve o build de produção (porta 8080) |
| `npm run deploy` | Build + deploy Firebase Hosting |
| `npm run build:zip` | Build + gera ZIPs para distribuição |

---

## 📋 Pré-requisitos

- **Node.js** v18+ (recomendado v20+)
- **npm** v9+
- Conexão à internet (Angular e dependências são carregadas via CDN no modo dev)

