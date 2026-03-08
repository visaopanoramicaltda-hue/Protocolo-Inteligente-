# 🚀 Guia de Deploy — Firebase Hosting

Este guia explica como configurar o deploy automático do **Protocolo Inteligente** no Firebase Hosting usando GitHub Actions.

---

## Pré-requisitos

- Conta no [Google Firebase](https://console.firebase.google.com/)
- Conta no [GitHub](https://github.com/)
- Chave de API do [Google Gemini](https://aistudio.google.com/app/apikey)
- Token de acesso do [Mercado Pago](https://www.mercadopago.com.br/developers/panel)

---

## Passo a Passo

### Passo 1 — Criar o projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"**
3. Digite um nome para o projeto (ex.: `protocolo-inteligente`)
4. Siga as etapas e clique em **"Criar projeto"**
5. Anote o **ID do projeto** (aparece abaixo do nome, ex.: `protocolo-inteligente-abc12`)

---

### Passo 2 — Ativar o Firebase Hosting

1. No console do Firebase, selecione seu projeto
2. No menu lateral, clique em **"Hosting"**
3. Clique em **"Primeiros passos"** e siga o assistente
4. Clique em **"Continuar para o console"** ao final

---

### Passo 3 — Gerar a conta de serviço do Firebase

1. No console do Firebase, clique na engrenagem ⚙️ → **"Configurações do projeto"**
2. Clique na aba **"Contas de serviço"**
3. Clique em **"Gerar nova chave privada"**
4. Confirme e salve o arquivo `.json` baixado — você precisará do conteúdo completo desse arquivo

---

### Passo 4 — Acessar as configurações de Secrets do repositório

1. Acesse o repositório no GitHub
2. Clique em **"Settings"** (Configurações) na barra superior do repositório
   - ⚠️ Certifique-se de estar nas configurações do **repositório** (não das suas configurações pessoais de conta)
3. No menu lateral, clique em **"Secrets and variables"** → **"Actions"**
4. Clique em **"New repository secret"**

---

### Passo 5 — Adicionar os 4 Secrets obrigatórios

Adicione um por um clicando em **"New repository secret"** a cada vez:

| Nome do Secret | Valor |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Conteúdo completo do arquivo `.json` baixado no Passo 3 |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase (ex.: `protocolo-inteligente-abc12`) |
| `GEMINI_API_KEY` | Sua chave de API do Google Gemini |
| `MERCADO_PAGO_TOKEN` | Seu token de acesso do Mercado Pago |

---

### Passo 6 — Disparar o deploy manualmente

1. No repositório do GitHub, clique na aba **"Actions"**
2. No menu lateral, clique em **"Deploy to Firebase Hosting"**
3. Clique em **"Run workflow"** → **"Run workflow"**
4. Acompanhe o progresso — o deploy leva cerca de 2–3 minutos

---

### Passo 7 — Deploy automático

A partir de agora, sempre que houver um `push` para a branch **`main`**, o deploy será feito automaticamente.

---

### Passo 8 — Acessar o app publicado

Após o deploy concluir com sucesso, seu app estará disponível em:

```
https://SEU_PROJECT_ID.web.app
```

Substitua `SEU_PROJECT_ID` pelo ID do seu projeto Firebase (o mesmo valor do secret `FIREBASE_PROJECT_ID`).

---

## Secrets necessários — resumo rápido

```
FIREBASE_SERVICE_ACCOUNT  → arquivo JSON da conta de serviço
FIREBASE_PROJECT_ID       → ID do projeto Firebase
GEMINI_API_KEY            → chave de API do Google Gemini
MERCADO_PAGO_TOKEN        → token de acesso do Mercado Pago
```
