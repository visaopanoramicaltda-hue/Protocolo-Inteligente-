<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 📦 Simbiose – Protocolo Inteligente v9.9

---

## 🟢 PRÓXIMOS PASSOS — Publicar o App Online

> ✅ Passos 1 e 2 já concluídos (projeto Firebase criado e Hosting ativado).
> Siga os passos abaixo em ordem. Leva cerca de 15 minutos.

---

### 👉 Passo 2B — ⚠️ Mesclar este PR antes de tudo

> ⚠️ **IMPORTANTE — faça isso PRIMEIRO antes dos outros passos!**
>
> O pipeline de deploy ainda está neste PR e **ainda não chegou na branch `main`** do repositório.
> Enquanto este PR não for mesclado, o botão **"Run workflow"** não aparecerá na aba Actions.

1. Vá para a página deste PR no GitHub (você já está nela se estiver lendo isso no PR)
2. Se o PR estiver marcado como **Draft**, clique em **"Ready for review"** primeiro
3. Clique no botão verde **"Merge pull request"** → **"Confirm merge"**
4. Pronto! Agora continue com o Passo 3 abaixo ↓

---

### 👉 Passo 3 — Descobrir o ID do projeto Firebase

1. Abra **[console.firebase.google.com](https://console.firebase.google.com/)** no celular ou computador
2. Clique no seu projeto
3. Clique na **engrenagem ⚙️** no canto superior esquerdo → **"Configurações do projeto"**
4. Na aba **"Geral"**, procure **"ID do projeto"** (ex: `meu-app-a1b2c3`)
5. **Anote esse ID** — você vai usar nos próximos passos

---

### 👉 Passo 4 — Gerar a chave de deploy

1. Ainda em ⚙️ Configurações → clique na aba **"Contas de serviço"**
2. Clique em **"Gerar nova chave privada"** → **"Gerar chave"**
3. Um arquivo `.json` vai baixar no seu computador
4. Abra com **Bloco de Notas** (Windows) ou **TextEdit** (Mac), **selecione tudo** (Ctrl+A) e **copie** (Ctrl+C)

---

### 👉 Passo 5 — Obter chave da IA (Gemini)

1. Abra **[aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**
2. Clique em **"Create API key"** → escolha seu projeto → **"Create"**
3. Copie a chave (começa com `AIza...`)

---

### 👉 Passo 6 — Cadastrar as 4 chaves no GitHub (Secrets)

> ⚠️ **ATENÇÃO — duas telas erradas comuns:**
>
> ❌ **Tela 1 — "Regras de branch" (Rulesets):** Se você clicou em **"Protect this branch"**, você está na tela errada. Clique em **Voltar** no navegador.
>
> ❌ **Tela 2 — Configurações da sua conta pessoal:** Se você vê "Perfil público", "Conta", "Aparência", "Acessibilidade", "Notificações", "E-mails", "Senha e autenticação", "Sessões" — você está nas configurações do **seu perfil**, não do repositório. Isso é errado. Clique em **Voltar** no navegador.
>
> ✅ **O "Settings" certo fica DENTRO DO REPOSITÓRIO**, não no seu perfil pessoal.

**Para chegar na tela certa, siga exatamente:**

1. Acesse **diretamente** o repositório: `https://github.com/visaopanoramicaltda-hue/Protocolo-Inteligente-`
   _(você deve ver o código do projeto, com arquivos como `README.md`, `package.json`, etc.)_
2. Nessa mesma tela do repositório, role o menu horizontal e toque em **"Settings"** _(fica após "Insights")_
   _(Atenção: é o "Settings" que aparece no menu do repositório, não o do seu ícone de perfil)_
3. No menu **lateral esquerdo**, desça até **"Security"** e toque em **"Secrets and variables"**
4. No submenu que abrir, toque em **"Actions"**
5. Toque no botão verde **"New repository secret"**
   → Você verá uma tela com título **"Segredos de ações / Novo segredo"** e dois campos: **"Nome \*"** e **"Segredo \*"** — você está na tela certa! ✅

Crie um secret de cada vez com estes nomes e valores:

| Campo "Nome \*" (copie exato) | Campo "Segredo \*" (valor a colar) |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Conteúdo completo do arquivo `.json` do Passo 4 |
| `FIREBASE_PROJECT_ID` | O ID anotado no Passo 3 (ex: `meu-app-a1b2c3`) |
| `GEMINI_API_KEY` | A chave `AIza...` do Passo 5 |
| `MERCADO_PAGO_TOKEN` | Seu token em [mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel) → Credenciais de **teste** → Access token _(use credenciais de teste primeiro para não fazer cobranças reais)_ |

Após preencher cada linha, toque no botão verde **"Adicionar segredo"**.

---

### 👉 Passo 7 — Disparar o deploy

> ⚠️ Este passo só funciona **depois de mesclar o PR** (Passo 2B acima).

Após cadastrar os 4 secrets:
1. Vá na aba **"Actions"** do repositório
2. Clique em **"Deploy to Firebase Hosting"** no menu lateral
3. Clique no botão **"Run workflow"** → **"Run workflow"** (botão verde)
4. Aguarde o ✅ verde — o link aparecerá nos logs: `https://SEU-PROJETO-ID.web.app`
   _(substitua `SEU-PROJETO-ID` pelo ID do secret `FIREBASE_PROJECT_ID`)_

---

> 📖 **Guia completo e detalhado:** [DEPLOY.md](./DEPLOY.md)
>
> ❓ **Travou em algum passo?** Abra uma issue com um print da tela e eu te ajudo.

---

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

