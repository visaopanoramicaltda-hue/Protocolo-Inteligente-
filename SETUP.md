# 📋 Guia Completo — Copiar e Usar em Outro Ambiente

Este guia explica, passo a passo, como copiar o **Protocolo Inteligente** e
colocá-lo para rodar em qualquer máquina ou servidor.

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Clonar / Copiar o Código](#2-clonar--copiar-o-código)
3. [Instalar Dependências](#3-instalar-dependências)
4. [Configurar Variáveis de Ambiente](#4-configurar-variáveis-de-ambiente)
5. [Executar Localmente](#5-executar-localmente)
6. [Build de Produção](#6-build-de-produção)
7. [Deploy com Docker](#7-deploy-com-docker)
8. [Deploy no Firebase Hosting](#8-deploy-no-firebase-hosting)
9. [CI/CD com GitHub Actions](#9-cicd-com-github-actions)
10. [Estrutura do Projeto](#10-estrutura-do-projeto)
11. [Solução de Problemas](#11-solução-de-problemas)

---

## 1. Pré-requisitos

| Ferramenta   | Versão mínima | Como instalar |
|-------------|---------------|---------------|
| **Node.js** | 20+           | [nodejs.org](https://nodejs.org) ou `nvm install 20` |
| **npm**     | 10+           | Vem com o Node.js |
| **Git**     | 2.x           | [git-scm.com](https://git-scm.com) |

### Opcionais (conforme o tipo de deploy)

| Ferramenta       | Para quê                     | Como instalar |
|-----------------|------------------------------|---------------|
| **Firebase CLI** | Deploy no Firebase Hosting   | `npm install -g firebase-tools` |
| **Docker**       | Deploy com container         | [docker.com](https://www.docker.com) |

---

## 2. Clonar / Copiar o Código

### Opção A — Clonar via Git

```bash
git clone https://github.com/visaopanoramicaltda-hue/Protocolo-Inteligente-.git
cd Protocolo-Inteligente-
```

### Opção B — Baixar ZIP

1. Acesse o repositório no GitHub
2. Clique em **Code → Download ZIP**
3. Extraia o ZIP e entre na pasta:
   ```bash
   cd Protocolo-Inteligente--main
   ```

### Opção C — Fork para sua conta

1. Clique em **Fork** no GitHub
2. Clone o seu fork:
   ```bash
   git clone https://github.com/SEU_USUARIO/Protocolo-Inteligente-.git
   cd Protocolo-Inteligente-
   ```

---

## 3. Instalar Dependências

```bash
npm install --legacy-peer-deps
```

> **Nota:** O arquivo `.npmrc` já contém `legacy-peer-deps=true`, então
> `npm install` (sem flag) também funciona.

---

## 4. Configurar Variáveis de Ambiente

### 4.1 Arquivo `.env` (desenvolvimento local)

Copie o template e preencha com suas chaves:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
GEMINI_API_KEY=sua_chave_gemini_aqui
MERCADO_PAGO_TOKEN=seu_token_mercado_pago_aqui
```

### 4.2 Ambiente de desenvolvimento (`src/environments/environment.ts`)

Para desenvolvimento local, você pode inserir as chaves diretamente:

```typescript
export const environment = {
  production: false,
  geminiApiKey: 'SUA_CHAVE_GEMINI',
  mercadoPagoAccessToken: 'SEU_TOKEN_MERCADO_PAGO',
  enableImmutabilityChecks: true
};
```

> **⚠️ Segurança:** Nunca comite chaves reais. O `.env` já está no
> `.gitignore`.

### 4.3 Onde obter as chaves

| Chave | Onde obter |
|-------|-----------|
| **Gemini API Key** | [Google AI Studio](https://aistudio.google.com/apikey) — Criar chave de API |
| **Mercado Pago Token** | [Mercado Pago Developers](https://www.mercadopago.com.br/developers) → Suas integrações → Credenciais → Access Token |

---

## 5. Executar Localmente

### Servidor de desenvolvimento Angular

```bash
npx ng serve
```

O app estará disponível em **http://localhost:3000** (porta configurada no
`angular.json`).

### Servidor Express (após build)

```bash
npm run build
npm start
```

O app estará disponível em **http://localhost:8080** (porta do `server.js`,
usada em produção/Docker).

---

## 6. Build de Produção

```bash
npm run build
```

Os arquivos de produção são gerados na pasta `dist/`.

Para servir localmente e testar:

```bash
npm start
```

---

## 7. Deploy com Docker

### Construir a imagem

```bash
docker build -t protocolo-inteligente .
```

### Executar o container

```bash
docker run -p 8080:8080 protocolo-inteligente
```

O app estará disponível em **http://localhost:8080**

### Deploy em serviços de container

A imagem Docker funciona em qualquer serviço que suporte containers:

- **Google Cloud Run**
- **AWS ECS / Fargate**
- **Azure Container Instances**
- **Railway, Render, Fly.io**

Exemplo com Google Cloud Run:

```bash
# Autenticar
gcloud auth login

# Construir e enviar
gcloud builds submit --tag gcr.io/SEU_PROJETO/protocolo-inteligente

# Deploy
gcloud run deploy protocolo-inteligente \
  --image gcr.io/SEU_PROJETO/protocolo-inteligente \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 8. Deploy no Firebase Hosting

### 8.1 Criar projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **Adicionar projeto**
3. Anote o **Project ID**

### 8.2 Configurar o projeto

Edite o `.firebaserc` com seu Project ID:

```json
{
  "projects": {
    "default": "SEU_PROJECT_ID"
  }
}
```

### 8.3 Deploy manual

```bash
# Instalar Firebase CLI (se ainda não instalou)
npm install -g firebase-tools

# Autenticar
firebase login

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

### 8.4 URL do app

Após o deploy: `https://SEU_PROJECT_ID.web.app`

---

## 9. CI/CD com GitHub Actions

O repositório já tem um workflow pronto em
`.github/workflows/firebase-hosting.yml`.

### Configurar os Secrets no GitHub

1. Vá em **Settings → Secrets and variables → Actions → New repository secret**
2. Crie os 4 secrets:

| Secret | Descrição |
|--------|-----------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON da conta de serviço do Firebase (Console Firebase → Configurações → Contas de serviço → Gerar chave privada) |
| `FIREBASE_PROJECT_ID` | ID do seu projeto Firebase |
| `GEMINI_API_KEY` | Chave de API do Google Gemini |
| `MERCADO_PAGO_TOKEN` | Token de acesso do Mercado Pago |

### Como funciona

- **Push na branch `main`** → deploy automático
- **Manualmente** → Actions → Deploy Firebase Hosting → Run workflow

---

## 10. Estrutura do Projeto

```
Protocolo-Inteligente-/
├── .env.example              # Template de variáveis de ambiente
├── .firebaserc               # Configuração do projeto Firebase
├── .github/workflows/        # CI/CD (GitHub Actions)
├── .gitignore                # Arquivos ignorados pelo Git
├── .npmrc                    # Configuração do npm (legacy-peer-deps)
├── .nvmrc                    # Versão do Node.js (20)
├── Dockerfile                # Container Docker
├── README.md                 # Documentação principal
├── SETUP.md                  # ← Este guia
├── angular.json              # Configuração do Angular CLI
├── capacitor.config.ts       # Configuração para app mobile (Capacitor)
├── firebase.json             # Configuração do Firebase Hosting
├── index.html                # Página HTML principal
├── index.tsx                 # Ponto de entrada Angular
├── ngsw-config.json          # Service Worker (PWA)
├── package.json              # Dependências e scripts
├── server.js                 # Servidor Express para produção
├── tsconfig.json             # Configuração TypeScript
├── vite.config.ts            # Configuração do Vite
└── src/
    ├── environments/         # Configurações de ambiente (dev/prod)
    ├── manifest.webmanifest  # Manifesto PWA
    ├── assets/               # Ícones e recursos estáticos
    └── app/
        ├── components/       # Componentes da UI
        │   ├── admin/        #   Painel administrativo
        │   ├── dashboard/    #   Dashboard principal
        │   ├── login/        #   Tela de login
        │   ├── manual/       #   Manual do usuário
        │   ├── novo-protocolo/ # Criação de protocolos
        │   ├── package-form/ #   Formulário de pacotes
        │   ├── quantum-net/  #   Rede Quantum
        │   └── secure-download/ # Download seguro
        ├── core/             # Serviços fundamentais (Simbiose)
        │   ├── simbiose-audit.service.ts
        │   ├── simbiose-hash.service.ts
        │   ├── simbiose-kill-switch.service.ts
        │   ├── simbiose-offline-queue.service.ts
        │   ├── simbiose-orquestrador.service.ts
        │   ├── simbiose-pdf.service.ts
        │   ├── simbiose-policy.service.ts
        │   ├── simbiose-storage.service.ts
        │   ├── simbiose-sync.service.ts
        │   └── simbiose-whatsapp.service.ts
        ├── models/           # Modelos de dados
        ├── services/         # Serviços da aplicação
        │   ├── auth.service.ts
        │   ├── firebase.service.ts
        │   ├── gemini.service.ts
        │   ├── payment.service.ts
        │   ├── scan.service.ts
        │   └── ...
        └── state/            # Gerenciamento de estado (NgRx)
            ├── greeting.actions.ts
            ├── greeting.reducer.ts
            ├── greeting.effects.ts
            └── ...
```

---

## 11. Solução de Problemas

### Erro: `npm install` falha com conflitos de peer dependencies

```bash
npm install --legacy-peer-deps
```

### Erro: `ng: command not found`

Use `npx` antes do comando:

```bash
npx ng serve
npx ng build
```

### Erro: Build falha com erro de fonte (font inlining)

Verifique que `angular.json` tem a otimização de fontes desabilitada na
configuração de produção, se necessário:

```json
"optimization": {
  "scripts": true,
  "styles": true,
  "fonts": false
}
```

### Erro: Service Worker inválido

No Angular 21, o campo `serviceWorker` no `angular.json` deve ser uma string
com o caminho do arquivo de configuração (não um booleano `true` como em
versões anteriores). O projeto já está configurado corretamente:

```json
"serviceWorker": "ngsw-config.json"
```

### Porta 3000 já em uso

Mude a porta no `angular.json`:

```json
"serve": {
  "options": {
    "port": 4200
  }
}
```

### Docker: imagem não inicia

Certifique-se de que o build completou com sucesso antes de criar a imagem:

```bash
npm run build
ls dist/   # deve conter index.html e demais arquivos
docker build -t protocolo-inteligente .
```

---

## Resumo Rápido

```bash
# 1. Clonar
git clone https://github.com/visaopanoramicaltda-hue/Protocolo-Inteligente-.git
cd Protocolo-Inteligente-

# 2. Instalar
npm install --legacy-peer-deps

# 3. Configurar (edite o .env com suas chaves)
cp .env.example .env

# 4. Rodar
npx ng serve
# → http://localhost:3000
```
