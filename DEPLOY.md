# 🚀 Guia de Deploy — Firebase Hosting

Este documento descreve **todos os passos manuais** necessários para colocar o app no ar no Firebase Hosting.
A infraestrutura de CI/CD já está completa no repositório. O que falta é configurar as credenciais externas.

---

## ✅ Pré-requisitos

- Conta Google com acesso ao [Firebase Console](https://console.firebase.google.com/)
- Repositório com permissão de **Admin** (para configurar Secrets)
- (Opcional) Node.js 20 instalado localmente para testar o deploy manual

---

## Passo 1 — Criar o projeto no Firebase

1. Acesse [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"**
3. Dê um nome (ex: `protocolo-inteligente`)
4. Desative o Google Analytics se não precisar → **Criar projeto**
5. Anote o **ID do projeto** (ex: `protocolo-inteligente-abc12`) — visível na URL e na página inicial do projeto

---

## Passo 2 — Ativar o Firebase Hosting

1. No Console Firebase, clique em **Hospedagem** (menu lateral)
2. Clique em **"Primeiros passos"**
3. Siga até o final (sem instalar nada — o CI faz isso)

---

## Passo 3 — Gerar a Service Account (chave de deploy)

1. No Console Firebase → **⚙️ Configurações do projeto** → aba **"Contas de serviço"**
2. Clique em **"Gerar nova chave privada"**
3. Um arquivo `.json` será baixado — **guarde-o com segurança**
4. Abra o arquivo e copie **todo o conteúdo** (é um JSON com várias linhas)

---

## Passo 4 — Configurar os GitHub Secrets

1. Acesse o repositório no GitHub
2. Vá em: **Settings → Secrets and variables → Actions → New repository secret**
3. Adicione **4 secrets** conforme a tabela abaixo:

| Nome do Secret | Valor |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Cole o conteúdo **completo** do arquivo `.json` da etapa anterior |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase (ex: `protocolo-inteligente-abc12`) |
| `GEMINI_API_KEY` | Sua chave da API Google Gemini ([obter em aistudio.google.com](https://aistudio.google.com/app/apikey)) |
| `MERCADO_PAGO_TOKEN` | Token de acesso MercadoPago (opcional — necessário apenas para pagamentos) |

> ⚠️ **Nunca** coloque esses valores diretamente em arquivos do repositório.
> O workflow de CI já injeta tudo automaticamente antes do build.

---

## Passo 5 — Disparar o deploy via GitHub Actions (automático)

O deploy acontece automaticamente ao fazer **push na branch `main` ou `master`**:

```bash
git push origin main
```

Ou ao abrir um **Pull Request** — nesse caso, o app vai para um canal de preview com URL temporária.

Acompanhe o progresso em: **GitHub → Actions → "Deploy to Firebase Hosting"**

---

## Passo 6 — Verificar o deploy

Após o workflow verde ✅, acesse:

```
https://<FIREBASE_PROJECT_ID>.web.app
```

Ou clique no link gerado pelo GitHub Actions no PR/commit.

---

## Deploy manual (opcional, para testar localmente)

```bash
# 1. Configure o .firebaserc com seu projeto
# Edite .firebaserc e substitua "your-project-id" pelo ID real

# 2. Faça login
npx firebase login

# 3. Configure as variáveis locais (NÃO commite esses valores)
# Edite src/environments/environment.ts e adicione suas chaves locais

# 4. Build + deploy em um comando
npm run deploy
```

---

## Estrutura do CI/CD

```
push → main/master
    └─ actions/checkout@v4
    └─ actions/setup-node@v4  (Node 20, via .nvmrc)
    └─ npm ci
    └─ Inject secrets → environment.prod.ts  (GEMINI_API_KEY, MERCADO_PAGO_TOKEN)
    └─ ng build --configuration production  → dist/
    └─ FirebaseExtended/action-hosting-deploy@v0
           ├─ PR   → preview channel  (URL temporária)
           └─ push → live channel     (https://<project>.web.app)
```

---

## Solução de problemas

| Erro | Solução |
|---|---|
| `❌ Deploy cancelado — .firebaserc não configurado!` | Edite `.firebaserc` e substitua `"your-project-id"` pelo ID real do seu projeto |
| `Error: Failed to authenticate` | Verifique se o secret `FIREBASE_SERVICE_ACCOUNT` está correto e completo |
| `Error: Project not found` | Confirme que `FIREBASE_PROJECT_ID` bate com o ID no Firebase Console |
| Build falha com erro de TypeScript | Execute `npm ci && npm run build` localmente para ver o erro completo |
| App abre em branco | Verifique se `firebase.json` tem o rewrite `"/**" → "/index.html"` (já configurado) |
