/**
 * package-zip.js
 * Creates a distributable ZIP of the built Angular application (dist/) and
 * a separate ZIP of the source code for delivery/backup.
 *
 * Usage: node scripts/package-zip.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version || '0.0.0';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

function zipDir(sourceDir, outFile) {
  // Use system zip if available (Linux/macOS)
  try {
    execSync(`zip -r "${outFile}" .`, { cwd: sourceDir, stdio: 'pipe' });
    return true;
  } catch (e) {
    // Windows / no zip available
    try {
      execSync(
        `powershell -Command "Compress-Archive -Path '${sourceDir}\\*' -DestinationPath '${outFile}' -Force"`,
        { stdio: 'pipe' }
      );
      return true;
    } catch (e2) {
      return false;
    }
  }
}

// 1. ZIP the built dist/ folder (deploy package)
const distZip = path.join(ROOT, `Simbiose-Deploy-v${VERSION}-${TIMESTAMP}.zip`);
if (fs.existsSync(DIST)) {
  console.log(`📦 Empacotando dist/ => ${path.basename(distZip)}`);
  const ok = zipDir(DIST, distZip);
  if (ok) console.log(`✅ Deploy ZIP criado: ${path.basename(distZip)}`);
  else console.warn('⚠️  Sistema ZIP não disponível. Instale o utilitário zip.');
} else {
  console.error('❌ Pasta dist/ não encontrada. Execute "npm run build" primeiro.');
  process.exit(1);
}

// 2. ZIP the source code (excluding node_modules and dist)
const srcZip = path.join(ROOT, `Simbiose-Source-v${VERSION}-${TIMESTAMP}.zip`);
console.log(`📦 Empacotando código-fonte => ${path.basename(srcZip)}`);
try {
  execSync(
    `zip -r "${srcZip}" . --exclude "node_modules/*" --exclude "dist/*" --exclude ".git/*" --exclude "*.zip" --exclude ".env" --exclude ".env.*" --exclude "*credentials*" --exclude "*secrets*" --exclude "*.key" --exclude "*.pem"`,
    { cwd: ROOT, stdio: 'pipe' }
  );
  console.log(`✅ Source ZIP criado: ${path.basename(srcZip)}`);
} catch (e) {
  console.warn('⚠️  Não foi possível criar o Source ZIP:', e.message);
}

console.log('\n🚀 Pacotes prontos para deploy e distribuição!');
