#!/usr/bin/env bash
# ============================================================
#  deploy.sh — Deploy do Protocolo Inteligente via Google Cloud Shell
# ============================================================
#  Uso:
#    1. Abra o Google Cloud Shell (https://shell.cloud.google.com)
#    2. Clone o repositório:
#       git clone https://github.com/visaopanoramicaltda-hue/Protocolo-Inteligente-.git
#       cd Protocolo-Inteligente-
#    3. Configure as variáveis de ambiente (ou crie um arquivo .env):
#       export FIREBASE_PROJECT_ID="protocolo-digital-v2-8"
#       export GEMINI_API_KEY="sua-chave-gemini"
#       export MERCADO_PAGO_TOKEN="seu-token-mercadopago"
#    4. Execute:
#       bash deploy.sh
# ============================================================

set -euo pipefail

# ── Cores para output ────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERRO]${NC}  $*"; }

# ── Carregar .env se existir ─────────────────────────────────
if [ -f .env ]; then
  info "Carregando variáveis de .env ..."
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
  ok "Variáveis carregadas do .env"
fi

# ── Validar variáveis obrigatórias ───────────────────────────
FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID:-}"

if [ -z "$FIREBASE_PROJECT_ID" ]; then
  error "FIREBASE_PROJECT_ID não definido."
  echo "  Defina com: export FIREBASE_PROJECT_ID=\"seu-project-id\""
  echo "  Ou adicione no arquivo .env"
  exit 1
fi

ok "Projeto Firebase: $FIREBASE_PROJECT_ID"

# ── Verificar / Instalar Node.js ────────────────────────────
REQUIRED_NODE="20"
if command -v node &>/dev/null; then
  CURRENT_NODE=$(node -v | cut -d'.' -f1 | tr -d 'v')
  if [ "$CURRENT_NODE" -lt "$REQUIRED_NODE" ]; then
    warn "Node.js v$CURRENT_NODE encontrado, mas v$REQUIRED_NODE+ é necessário."
    info "Instalando Node.js v$REQUIRED_NODE via nvm ..."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    nvm install "$REQUIRED_NODE"
    nvm use "$REQUIRED_NODE"
  fi
  ok "Node.js $(node -v)"
else
  error "Node.js não encontrado. Instale o Node.js v$REQUIRED_NODE+."
  exit 1
fi

# ── Verificar / Instalar Firebase CLI ────────────────────────
if ! command -v firebase &>/dev/null; then
  info "Instalando Firebase CLI ..."
  npm install -g firebase-tools
fi
ok "Firebase CLI $(firebase --version)"

# ── Autenticar no Google Cloud / Firebase ────────────────────
info "Verificando autenticação ..."

# No Google Cloud Shell, gcloud já está autenticado.
# Usar a credencial do gcloud para o Firebase.
if command -v gcloud &>/dev/null; then
  GCLOUD_ACCOUNT=$(gcloud config get-value account 2>/dev/null || true)
  if [ -n "$GCLOUD_ACCOUNT" ]; then
    ok "Autenticado no gcloud como: $GCLOUD_ACCOUNT"
    # Configura o projeto no gcloud
    gcloud config set project "$FIREBASE_PROJECT_ID" 2>/dev/null || true
    ok "Projeto gcloud configurado: $FIREBASE_PROJECT_ID"
  else
    warn "Nenhuma conta gcloud ativa. Executando login ..."
    gcloud auth login
  fi
else
  warn "gcloud CLI não encontrado. Usando firebase login."
  firebase login
fi

# ── Instalar dependências ────────────────────────────────────
info "Instalando dependências ..."
npm ci
ok "Dependências instaladas"

# ── Injetar segredos (se definidos) ──────────────────────────
GEMINI_API_KEY="${GEMINI_API_KEY:-}"
MERCADO_PAGO_TOKEN="${MERCADO_PAGO_TOKEN:-}"

if [ -n "$GEMINI_API_KEY" ]; then
  ESCAPED_KEY=$(printf '%s' "$GEMINI_API_KEY" | sed 's/[&/\|]/\\&/g')
  sed -i "s|geminiApiKey: ''|geminiApiKey: '${ESCAPED_KEY}'|" src/environments/environment.prod.ts
  ok "GEMINI_API_KEY injetada"
else
  warn "GEMINI_API_KEY não definida — usando valor vazio"
fi

if [ -n "$MERCADO_PAGO_TOKEN" ]; then
  ESCAPED_TOKEN=$(printf '%s' "$MERCADO_PAGO_TOKEN" | sed 's/[&/\|]/\\&/g')
  sed -i "s|mercadoPagoAccessToken: ''|mercadoPagoAccessToken: '${ESCAPED_TOKEN}'|" src/environments/environment.prod.ts
  ok "MERCADO_PAGO_TOKEN injetado"
else
  warn "MERCADO_PAGO_TOKEN não definido — usando valor vazio"
fi

# ── Build ────────────────────────────────────────────────────
info "Executando build de produção ..."
npm run build
ok "Build concluído com sucesso"

# ── Deploy ───────────────────────────────────────────────────
info "Enviando deploy para Firebase Hosting ..."
firebase deploy --only hosting --project "$FIREBASE_PROJECT_ID"

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}  🌐  https://${FIREBASE_PROJECT_ID}.web.app${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
