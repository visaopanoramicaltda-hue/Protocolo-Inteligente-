#!/usr/bin/env node
/**
 * check-firebase-config.js
 *
 * Pre-deploy guard: verifies that .firebaserc has been configured with a
 * real Firebase project ID before attempting a deploy.
 *
 * Runs automatically via the "predeploy" npm lifecycle script.
 * Skipped when the FIREBASE_PROJECT_ID environment variable is already set
 * (e.g., in GitHub Actions where the CI passes the project via secrets).
 */

const fs = require('fs');
const path = require('path');

const PLACEHOLDER = 'your-project-id';
const FIREBASERC  = path.resolve(__dirname, '..', '.firebaserc');

// In CI/CD the project ID is injected via the FIREBASE_PROJECT_ID secret
// (used with the --project flag).  No need to check .firebaserc in that case.
if (process.env.FIREBASE_PROJECT_ID) {
  console.log('ℹ️  FIREBASE_PROJECT_ID detectado via variável de ambiente. Verificação do .firebaserc ignorada.');
  process.exit(0);
}

// Read .firebaserc
let config;
try {
  config = JSON.parse(fs.readFileSync(FIREBASERC, 'utf8'));
} catch (err) {
  console.error(`❌ Não foi possível ler o arquivo .firebaserc:\n   ${err.message}`);
  console.error('   Certifique-se de que o arquivo existe na raiz do projeto.');
  process.exit(1);
}

const projectId = (config.projects && config.projects.default) || '';

if (!projectId || projectId === PLACEHOLDER) {
  console.error('');
  console.error('❌ Deploy cancelado — .firebaserc não configurado!');
  console.error('');
  console.error('   O arquivo .firebaserc ainda contém o valor padrão "your-project-id".');
  console.error('   Siga os passos abaixo antes de fazer o deploy:');
  console.error('');
  console.error('   1. Acesse o Firebase Console: https://console.firebase.google.com/');
  console.error('   2. Selecione ou crie seu projeto.');
  console.error('   3. Copie o ID do projeto (ex: meu-app-12345).');
  console.error('   4. Edite o arquivo .firebaserc na raiz do projeto:');
  console.error('');
  console.error('      {');
  console.error('        "projects": {');
  console.error('          "default": "SEU-PROJECT-ID-AQUI"');
  console.error('        }');
  console.error('      }');
  console.error('');
  console.error('   5. Faça login no Firebase:');
  console.error('      npx firebase login');
  console.error('');
  console.error('   6. Execute novamente:');
  console.error('      npm run deploy');
  console.error('');
  process.exit(1);
}

console.log(`✅ Firebase project configurado: "${projectId}"`);
