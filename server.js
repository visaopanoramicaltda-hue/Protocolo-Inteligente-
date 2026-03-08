const express = require('express');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const app = express();

// Rate-limit all requests: 300 per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Serve the built app (dist/) if available, otherwise show a helpful message.
// For live development, use: npm run dev
const distFolder = path.join(__dirname, 'dist');
const hasDist = fs.existsSync(distFolder) && fs.existsSync(path.join(distFolder, 'index.html'));

if (hasDist) {
  app.use(express.static(distFolder));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distFolder, 'index.html'));
  });
  console.log('Serving from dist/ (production build)');
} else {
  app.get('*', (req, res) => {
    res.status(503).send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Simbiose – Configuração Necessária</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #050505; color: #eae0d5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #111; border: 1px solid #333; border-radius: 12px; padding: 40px; max-width: 600px; width: 100%; }
    h1 { color: #E86C26; margin: 0 0 8px; font-size: 28px; }
    h2 { color: #888; margin: 0 0 30px; font-size: 14px; font-weight: normal; letter-spacing: 2px; text-transform: uppercase; }
    code { background: #222; border: 1px solid #444; border-radius: 6px; padding: 3px 8px; font-family: monospace; color: #E86C26; }
    pre { background: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 20px; overflow-x: auto; }
    pre code { background: none; border: none; padding: 0; color: #eae0d5; }
    .step { margin-bottom: 20px; }
    .step-num { display: inline-block; background: #E86C26; color: black; border-radius: 50%; width: 24px; height: 24px; text-align: center; line-height: 24px; font-weight: bold; font-size: 13px; margin-right: 8px; }
    a { color: #E86C26; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Simbiose</h1>
    <h2>Protocolo Inteligente v9.9</h2>
    <p>A pasta <code>dist/</code> ainda não existe. Para visualizar o aplicativo, siga uma das opções abaixo:</p>

    <div class="step">
      <span class="step-num">A</span> <strong>Modo Desenvolvimento (rápido, hot-reload):</strong>
      <pre><code>npm install
npm run dev</code></pre>
      <p>Acesse: <a href="http://localhost:3000">http://localhost:3000</a></p>
    </div>

    <div class="step">
      <span class="step-num">B</span> <strong>Modo Produção (build completo):</strong>
      <pre><code>npm install
npm run build
npm start</code></pre>
      <p>Acesse: <a href="http://localhost:8080">http://localhost:8080</a></p>
    </div>

    <div class="step">
      <span class="step-num">C</span> <strong>Deploy no Firebase Hosting:</strong>
      <pre><code>npm install -g firebase-tools
npm run deploy</code></pre>
    </div>

    <p style="color:#555; font-size:13px; margin-top:30px;">Veja o <code>README.md</code> para instruções completas.</p>
  </div>
</body>
</html>
    `);
  });
  console.log('⚠️  dist/ não encontrado. Execute "npm run build" para gerar, ou "npm run dev" para desenvolvimento.');
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  if (!hasDist) {
    console.log(`👉 Para desenvolvimento rápido: npm run dev (porta 3000)`);
    console.log(`👉 Para produção: npm run build && npm start`);
  }
});
