# 🚀 Guia de Deploy — Firebase Hosting (Passo a Passo para Iniciantes)

> **Situação atual:** A infraestrutura de deploy já está 100% pronta no repositório.
> Você só precisa configurar 4 credenciais externas. Leva cerca de 15 minutos.

---

## Resumo dos passos

| # | Passo | Status |
|---|---|---|
| 1 | Criar projeto no Firebase | ✅ Feito |
| 2 | Ativar Firebase Hosting | ✅ Feito |
| **2B** | **⚠️ Mesclar (merge) este PR para main** | ← **Faça isso PRIMEIRO** |
| **3** | **Descobrir o ID do projeto** | |
| 4 | Gerar chave da Service Account | |
| 5 | Obter chave da API Gemini | |
| 6 | Cadastrar os 4 secrets no GitHub | |
| 7 | Disparar o deploy | |

---

## ✅ Passo 1 — Criar projeto no Firebase  *(já feito)*

Você criou o projeto Firebase. Prossiga para o Passo 3.

---

## ✅ Passo 2 — Ativar Firebase Hosting  *(já feito)*

Você clicou em "Hospedagem" e seguiu o assistente. Ótimo!

---

## ⚠️ Passo 2B — Mesclar este PR para a branch main  *(faça antes dos outros passos)*

O pipeline de deploy e todas as configurações estão neste PR.
Enquanto este PR não for mesclado, o botão **"Run workflow"** não aparece na aba Actions.

**Como mesclar:**

1. Vá para a página do PR no GitHub
2. Se o PR estiver marcado como **Draft**, clique em **"Ready for review"** primeiro
3. Clique no botão verde **"Merge pull request"** → **"Confirm merge"**
4. Pronto! Agora continue com o Passo 3 ↓

---

---

## 📋 Passo 3 — Descobrir o ID do seu projeto Firebase

O **ID do projeto** é um código único do seu app. Você vai precisar dele várias vezes a seguir.

**Como encontrar:**

1. Acesse [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Clique no seu projeto
3. Clique no ícone de **engrenagem ⚙️** no topo esquerdo → **"Configurações do projeto"**
4. Na aba **"Geral"**, role até a seção **"Seus apps"**
   - O ID aparece como **"ID do projeto"** — é algo parecido com `protocolo-inteligente-a1b2c`
   - Também aparece na URL do navegador: `...project/SEU-ID-AQUI/settings...`

> 📌 **Anote esse ID agora** — você vai usá-lo no Passo 6.

---

## 🔑 Passo 4 — Gerar a chave da Service Account

Esta chave permite que o GitHub faça deploy no Firebase no seu lugar, de forma automática e segura.

**Passo a passo:**

1. Ainda em **⚙️ Configurações do projeto**, clique na aba **"Contas de serviço"**
   _(fica ao lado das abas "Geral", "Uso e cobrança", etc.)_

2. Você verá a seção **"SDK Admin do Firebase"** com um botão azul:
   **"Gerar nova chave privada"** — clique nele

3. Uma caixa de confirmação aparece. Clique em **"Gerar chave"**

4. Um arquivo `.json` será **baixado automaticamente** para o seu computador
   - O nome será algo como `protocolo-inteligente-a1b2c-firebase-adminsdk-xxxxx.json`
   - ⚠️ **Não apague esse arquivo** — você vai precisar dele no Passo 6
   - ⚠️ **Não compartilhe esse arquivo** com ninguém e não o coloque no repositório

5. **Como ver o conteúdo do arquivo:**
   - Windows: clique com botão direito → Abrir com → Bloco de notas
   - Mac: clique com botão direito → Abrir com → TextEdit
   - O arquivo começa com `{` e tem várias linhas — isso é normal
   - **Selecione tudo** (Ctrl+A / Cmd+A) e **copie** (Ctrl+C / Cmd+C)

---

## 🤖 Passo 5 — Obter a chave da API Gemini (Inteligência Artificial)

Esta chave ativa as funcionalidades de IA do app.

1. Acesse [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   _(faça login com a mesma conta Google)_

2. Clique em **"Create API key"** (Criar chave de API)

3. Selecione o mesmo projeto Firebase que você criou — ou crie em um projeto novo

4. Clique em **"Create API key in existing project"**

5. A chave aparece na tela — é uma sequência longa começando com `AIza...`
   - Clique no ícone de **copiar** ao lado da chave
   - ⚠️ **Não compartilhe esta chave** publicamente

> 📌 **Guarde essa chave** — você vai precisar dela no Passo 6.

---

## 🐙 Passo 6 — Cadastrar os 4 secrets no GitHub

Aqui você "ensina" o GitHub quais são suas senhas/chaves, de forma segura.
O GitHub nunca mostra esses valores depois de salvos — nem para você.

> ⚠️ **ATENÇÃO — duas telas erradas comuns:**
>
> ❌ **Tela 1 — "Regras de branch" (Rulesets):** Se você clicou em **"Protect this branch"** ou vê campos como "Nome do conjunto de regras", "Filiais-alvo" — você está na tela errada. Clique **Voltar** no navegador.
>
> ❌ **Tela 2 — Configurações da sua conta pessoal:** Se você vê itens como "Perfil público", "Conta", "Aparência", "Acessibilidade", "Notificações", "E-mails", "Senha e autenticação", "Sessões", "Chaves SSH e GPG", "Organizações" — você está nas configurações do **seu perfil pessoal**, não do repositório. Isso é errado. Clique **Voltar** no navegador.
>
> ✅ **O "Settings" certo fica DENTRO DO REPOSITÓRIO**, não no menu do seu ícone de perfil.

**Como acessar a tela de Secrets:**

1. Acesse **diretamente** o repositório:
   `https://github.com/visaopanoramicaltda-hue/Protocolo-Inteligente-`
   _(você deve ver arquivos do projeto: `README.md`, `package.json`, etc.)_

2. Nessa tela do repositório, role o menu horizontal e clique em **"Settings"** _(fica após "Insights")_
   _(Atenção: é o "Settings" do repositório, NÃO o do seu ícone/foto de perfil)_
   _(se não aparecer, você precisa ser Admin do repositório)_

3. No menu **lateral esquerdo**, desça até a seção **"Security"** e clique em **"Secrets and variables"**
   → Clique em **"Actions"** no submenu que aparecer

4. Você verá a página **"Actions secrets and variables"**
   Clique no botão verde **"New repository secret"**

---

> ✅ **VOCÊ ESTÁ NA TELA CERTA se vê:**
> - Título: **"Segredos de ações / Novo segredo"**
> - Campo **"Nome \*"** (com placeholder "SEU_NOME_SECRETO")
> - Campo **"Segredo \*"** (caixa de texto grande)
> - Botão verde **"Adicionar segredo"**
>
> Se está vendo isso, **ótimo — é exatamente aqui que você precisa estar!** Continue abaixo.

**Agora você vai criar 4 secrets, um de cada vez:**

---

### 🔐 Secret 1 de 4: `FIREBASE_SERVICE_ACCOUNT`

Este é o conteúdo do arquivo `.json` que você baixou no Passo 4.

1. No campo **"Nome \*"**, digite exatamente:
   ```
   FIREBASE_SERVICE_ACCOUNT
   ```

2. No campo **"Segredo \*"**, cole **todo o conteúdo** do arquivo `.json` (pressione e segure o campo → "Colar")
   - Deve começar com `{` e terminar com `}`
   - Pode ter muitas linhas — isso é normal

3. Toque no botão verde **"Adicionar segredo"**

---

### 🔐 Secret 2 de 4: `FIREBASE_PROJECT_ID`

Este é o ID do projeto que você anotou no Passo 3.

1. Toque em **"New repository secret"** novamente

2. No campo **"Nome \*"**, digite exatamente:
   ```
   FIREBASE_PROJECT_ID
   ```

3. No campo **"Segredo \*"**, cole o ID do projeto (ex: `protocolo-inteligente-a1b2c`)
   - Só o ID, sem espaços, sem aspas

4. Toque no botão verde **"Adicionar segredo"**

---

### 🔐 Secret 3 de 4: `GEMINI_API_KEY`

Esta é a chave que você obteve no Passo 5.

1. Toque em **"New repository secret"** novamente

2. No campo **"Nome \*"**, digite exatamente:
   ```
   GEMINI_API_KEY
   ```

3. No campo **"Segredo \*"**, cole a chave (começa com `AIza...`)

4. Toque no botão verde **"Adicionar segredo"**

---

### 🔐 Secret 4 de 4: `MERCADO_PAGO_TOKEN`

Este é o token de acesso da sua conta MercadoPago (necessário para processar pagamentos).

1. Para obter o token de **teste** (comece sempre pelo teste para não fazer cobranças reais):
   - Acesse [https://www.mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel)
   - Faça login → **"Suas integrações"** → selecione seu app → **"Credenciais de teste"**
   - Copie o **"Access token"** de teste (começa com `TEST-...`)
   - _(Para produção real: troque por "Credenciais de produção" → Access token `APP_USR-...`)_

2. Toque em **"New repository secret"** novamente

3. No campo **"Nome \*"**, digite exatamente:
   ```
   MERCADO_PAGO_TOKEN
   ```

4. No campo **"Segredo \*"**, cole o token

5. Toque no botão verde **"Adicionar segredo"**

---

**Ao final, você deve ver 4 secrets listados:**

```
FIREBASE_SERVICE_ACCOUNT   ✅
FIREBASE_PROJECT_ID        ✅
GEMINI_API_KEY             ✅
MERCADO_PAGO_TOKEN         ✅
```

---

## 🚀 Passo 7 — Disparar o deploy

> ⚠️ **Pré-requisito:** Este passo só funciona após mesclar o PR (Passo 2B). Se o workflow **"Deploy to Firebase Hosting"** não aparecer no menu lateral, é porque o PR ainda não foi mesclado.

Após mesclar o PR e cadastrar os 4 secrets, **dispare o deploy manualmente** assim:

1. No repositório, clique na aba **"Actions"** (menu horizontal superior)
2. No menu lateral esquerdo, clique em **"Deploy to Firebase Hosting"**
3. À direita, clique no botão **"Run workflow"**
4. No popup que abrir, clique novamente em **"Run workflow"** (botão verde)
5. Você verá um círculo amarelo ⏳ — clique nele para acompanhar em tempo real

> ✅ O deploy também roda **automaticamente** toda vez que um código for enviado para a branch `main`.

---

## 👀 Passo 8 — Acompanhar e verificar o deploy

1. Na aba **"Actions"** do GitHub, você verá um item novo com um círculo amarelo ⏳
2. Clique nele para ver o progresso em tempo real
3. Quando ficar verde ✅, o deploy foi feito com sucesso!
4. O link do seu aplicativo será exibido nos logs do deploy e também fica disponível em:

```
https://SEU-PROJETO-ID.web.app
```

_(substitua `SEU-PROJETO-ID` pelo ID que você anotou no Passo 3 — é o mesmo valor do secret `FIREBASE_PROJECT_ID`)_

> 💡 **Dica:** O link exato também aparece no log do GitHub Actions — clique no job **"Build & Deploy"** → procure por `Hosting URL: https://...`

---

## ❌ Solução de problemas

| O que aparece | O que fazer |
|---|---|
| "Deploy to Firebase Hosting" **não aparece** na aba Actions | O PR ainda não foi mesclado — faça o merge (Passo 2B) primeiro |
| Botão **"Run workflow"** não aparece | O PR não foi mesclado, ou você está vendo um branch diferente de `main` — mescle o PR primeiro |
| `Error: Failed to authenticate` | O secret `FIREBASE_SERVICE_ACCOUNT` está errado — delete-o e recrie com o conteúdo **completo** do `.json` |
| `Error: Project 'your-project-id' not found` | O `FIREBASE_PROJECT_ID` está como `your-project-id` — corrija com o ID real |
| `Build failed` — erro de TypeScript | Falta alguma dependência; verifique os logs na aba Actions |
| Página abre em branco | O rewrite SPA já está configurado — verifique se o build completou sem erro |
| `GEMINI_API_KEY` não funciona | Verifique se a chave começa com `AIza` e foi copiada completamente |

---

## 📞 Precisa de ajuda?

Se travar em algum passo, abra uma issue no repositório descrevendo:
1. Em qual passo travou
2. O que aparece na tela (pode tirar um print)
3. Qual mensagem de erro aparece (se houver)
