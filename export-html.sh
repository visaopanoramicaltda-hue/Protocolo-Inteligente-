#!/usr/bin/env bash
# ============================================================
# export-html.sh — Gera a versão HTML do Protocolo Inteligente
# ============================================================
# Uso:
#   chmod +x export-html.sh
#   ./export-html.sh
#
# Após a execução, copie todo o conteúdo da pasta dist/ para
# o seu ambiente de destino (qualquer servidor web estático).
# ============================================================

set -euo pipefail

echo "🔧 Instalando dependências..."
npm ci --legacy-peer-deps || npm install --legacy-peer-deps

echo "🏗️  Compilando o projeto para HTML..."
npx ng build --configuration production

echo ""
echo "============================================"
echo "✅ HTML gerado com sucesso!"
echo "============================================"
echo ""
echo "📁 Arquivos gerados em: ./dist/"
echo ""
echo "Para usar em outro ambiente:"
echo "  1. Copie TODOS os arquivos da pasta dist/"
echo "  2. Cole no diretório raiz do seu servidor web"
echo "  3. Acesse pelo navegador"
echo ""
echo "Exemplo com servidor local:"
echo "  cd dist && npx serve ."
echo "  ou: cd dist && python3 -m http.server 8080"
echo "============================================"
