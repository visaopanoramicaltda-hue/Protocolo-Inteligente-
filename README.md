<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Protocolo Inteligente

Sistema inteligente de protocolo e gestão documental — PWA + Android (TWA).

---

## ▶️ Executar localmente

**Pré-requisitos:** Node.js 20+

```bash
npm install
# Coloque sua GEMINI_API_KEY em .env.local
npm run dev
```

---

## 🚀 PRÓXIMOS PASSOS — Gerar o APK Android

O workflow `.github/workflows/build-android.yml` já está configurado.
Siga os passos abaixo para obter o APK/AAB do aplicativo.

---

### Passo 1 — Mesclar este PR e fazer push para `main`

O workflow dispara automaticamente em qualquer `push` para a branch `main`.
Depois que o PR for aprovado e mesclado, a pipeline será executada sozinha.

---

### Passo 2 — Acompanhar o build no GitHub Actions

1. Acesse a aba **Actions** do repositório:
   `https://github.com/visaopanoramicaltda-hue/Protocolo-Inteligente-/actions`
2. Clique no workflow **"Build Android APK"**.
3. Aguarde as etapas concluírem (≈ 10–15 min na primeira execução).

---

### Passo 3 — Baixar o APK / AAB gerado

Ao final do build bem-sucedido, dois artefatos ficam disponíveis na página do run:

| Artefato | Uso |
|---|---|
| `protocolo-inteligente-apk` | Instalar diretamente no celular (`.apk`) |
| `protocolo-inteligente-aab` | Enviar para a Google Play Store (`.aab`) |

Clique no nome do artefato para baixar o arquivo `.zip` com o binário.

---

### Passo 4 — Obter o SHA-256 da assinatura e atualizar `assetlinks.json`

Para que o Android reconheça o app como TWA legítimo (sem barra de endereço),
o arquivo `src/assets/assetlinks.json` precisa conter o SHA-256 da chave de assinatura.

#### 4a. Copiar o SHA-256 do log do build

No log da etapa **"Build APK"** (ou no output do `bubblewrap build`), procure uma linha como:

```
SHA-256: AA:BB:CC:DD:...
```

#### 4b. Atualizar `src/assets/assetlinks.json`

Substitua o placeholder pelo valor copiado:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "app.protocolo.inteligente",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:..."
      ]
    }
  }
]
```

Faça commit e push do arquivo atualizado para que o Firebase sirva o `assetlinks.json` correto.

---

### Passo 5 — Re-publicar no Firebase para servir o `assetlinks.json` atualizado

O arquivo `assetlinks.json` precisa estar acessível em:

```
https://protocolo-digital-v2-8.web.app/.well-known/assetlinks.json
```

Caso o Firebase Hosting já esteja configurado, um simples `git push` para `main` acionará
o deploy automático (via `.github/workflows/firebase-hosting.yml`).

---

### Passo 6 — (Opcional) Publicar na Google Play Store

1. Acesse o [Google Play Console](https://play.google.com/console).
2. Crie um novo aplicativo com o package ID **`app.protocolo.inteligente`**.
3. Faça upload do arquivo `.aab` baixado no Passo 3.
4. Preencha os metadados (descrição, capturas de tela, ícones).
5. Submeta para revisão.

> **Ícone da Play Store:** use `src/assets/icons/icon-512.png` (512 × 512 px).

---

## 📂 Estrutura relevante

```
.github/workflows/
  build-android.yml       ← pipeline TWA (APK/AAB)
  firebase-hosting.yml    ← deploy Firebase (PWA)
src/
  manifest.webmanifest    ← manifesto PWA (tema #3b1f15)
  assets/
    icons/
      icon-192.png        ← ícone PWA 192 × 192
      icon-512.png        ← ícone PWA / Play Store 512 × 512
      maskable-512.png    ← ícone adaptável Android
    assetlinks.json       ← Digital Asset Links (TWA)
```

---

## 🔑 Secrets necessários (GitHub → Settings → Secrets)

| Secret | Descrição |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | JSON da conta de serviço Firebase |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `GEMINI_API_KEY` | Chave da API Gemini |
| `MERCADO_PAGO_TOKEN` | Token do Mercado Pago |

