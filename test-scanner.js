/**
 * test-scanner.js — Testes unitários do pipeline de leitura de etiquetas Simbiose
 *
 * Pipeline: Tesseract OCR → Regex → Gemini 2.0 Flash
 * Campos extraídos: CÓDIGO DE RASTREIO, DESTINATÁRIO, BLOCO, APARTAMENTO, TRANSPORTADORA
 *
 * Uso: node test-scanner.js
 */

'use strict';

// ---------------------------------------------------------------------------
// Regex patterns (espelha exclusive-scanner.service.ts)
// ---------------------------------------------------------------------------
const TRACKING_REGEX = /\b([A-Z]{2}\d{9}[A-Z]{2}|\d{10,14})\b/;
const BLOCO_REGEX    = /\b(?:BL(?:O(?:CO?)?)?\s*[:\-]?\s*)([A-Z0-9]{1,4})\b/i;
const APTO_REGEX     = /\b(?:AP(?:T?O?)?\s*[:\-]?\s*|APART(?:AMENTO)?\s*[:\-]?\s*|UNIDADE\s*[:\-]?\s*)([A-Z0-9]{1,6})\b/i;

const IMMUTABLE_IGNORE_LIST = [
  'RUA', 'AV.', 'AVENIDA', 'ALAMEDA', 'TRAVESSA', 'RODOVIA', 'ESTRADA',
  'CEP', 'BAIRRO', 'CIDADE', 'ESTADO', 'UF', 'BRASIL',
  'PEDIDO', 'ORDER', 'NOTA', 'FISCAL', 'DANFE', 'CNPJ', 'CPF',
  'VOLUME', 'PESO', 'KG', 'GRAMAS', 'LITROS',
  'REMETENTE', 'DESTINATARIO', 'A/C',
  'WWW', 'HTTP', '.COM', '.BR',
  'FRAGIL', 'CUIDADO', 'VIDRO',
];

const BASE_TRANSPORTADORAS = [
  'CORREIOS', 'SEDEX', 'PAC', 'JADLOG', 'JADLOG .PACKAGE', 'JADLOG .EXPRESSO', 'JADLOG .COM',
  'LOGGI', 'TOTAL EXPRESS', 'AZUL CARGO', 'BRASPRESS', 'PATRUS', 'DIRECT EXPRESS', 'SEQUOIA',
  'RODONAVES', 'MERCADO LIVRE', 'MERCADO ENVIOS FLEX', 'MERCADO ENVIOS', 'AMAZON LOGISTICS',
  'AMAZON FLEX', 'AMAZON', 'SHOPEE XPRESS', 'SHOPEE', 'MAGALU', 'MAGALULOG',
  'AMERICANAS', 'B2W ENTREGA', 'CASAS BAHIA', 'VIA VAREJO',
  'FEDEX', 'DHL EXPRESS', 'DHL', 'UPS', 'TNT',
  'LATAM CARGO', 'GOL CARGO', 'MELHOR ENVIO', 'FRENET', 'KANGU',
];

// ---------------------------------------------------------------------------
// Engine de extração (espelha exclusive-scanner.service.ts#extract)
// ---------------------------------------------------------------------------
function extract(rawOcrText) {
  if (!rawOcrText) return { destinatario: '', transportadora: '', rastreio: '', bloco: '', apto: '' };

  const upperText = rawOcrText.toUpperCase();

  // 1. CÓDIGO DE RASTREIO (regex)
  let rastreio = '';
  const trackingMatch = upperText.match(TRACKING_REGEX);
  if (trackingMatch) rastreio = trackingMatch[1];

  // 2. BLOCO (regex)
  let bloco = '';
  const blocoMatch = upperText.match(BLOCO_REGEX);
  if (blocoMatch) bloco = blocoMatch[1].trim();

  // 3. APARTAMENTO (regex)
  let apto = '';
  const aptoMatch = upperText.match(APTO_REGEX);
  if (aptoMatch) apto = aptoMatch[1].trim();

  // 4. DESTINATÁRIO & TRANSPORTADORA (linha por linha)
  const rawLines = rawOcrText.split('\n');
  const validLines = [];
  for (const rawLine of rawLines) {
    const l = rawLine.trim().toUpperCase();
    if (l.length < 3) continue;
    const isToxic = IMMUTABLE_IGNORE_LIST.some(bad => l.includes(bad));
    if (!isToxic) validLines.push(l);
  }

  // Ordena por comprimento DECRESCENTE: match mais longo primeiro
  const sortedCarriers = [...BASE_TRANSPORTADORAS].sort((a, b) => b.length - a.length);

  let destinatario = '';
  let transportadora = '';

  for (const l of validLines) {
    if (!transportadora) {
      for (const t of sortedCarriers) {
        if (l.includes(t)) { transportadora = t; break; }
      }
    }
    if (!destinatario) {
      const isCarrier    = sortedCarriers.some(t => l.includes(t));
      const isAddress    = IMMUTABLE_IGNORE_LIST.some(bad => l.includes(bad));
      const isDimensions = /\d+\s*[Xx×]\s*\d+/.test(l);
      if (!isCarrier && !isAddress && !isDimensions && l.length > 5 && l.length < 60 && !/\d{3,}/.test(l)) {
        const words = l.trim().split(/\s+/);
        if (words.length >= 2 && words.every(w => w.length >= 2)) {
          destinatario = l.trim();
        }
      }
    }
    if (destinatario && transportadora) break;
  }

  return { destinatario, transportadora, rastreio, bloco, apto };
}

// ---------------------------------------------------------------------------
// Validação de formato do código de rastreio
// ---------------------------------------------------------------------------
function validateTrackingCode(code) {
  if (!code) return false;
  const clean = code.trim().toUpperCase().replace(/\s/g, '');
  return /^(?:[A-Z]{2}\d{9}[A-Z]{2}|\d{10,14})$/.test(clean);
}

// ---------------------------------------------------------------------------
// Runner de testes
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    console.error(`     expected: ${JSON.stringify(expected)}`);
    console.error(`     actual  : ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// CASOS DE TESTE
// ---------------------------------------------------------------------------

console.log('\n=== SIMBIOSE LABEL SCANNER — TEST SUITE ===\n');

// --- Tracking code validation ---
console.log('[ validação de código de rastreio ]');
assert('Formato padrão Correios',          validateTrackingCode('BR123456789BR'), true);
assert('Formato SEDEX Internacional',      validateTrackingCode('LO987654321BR'), true);
assert('Código 22 dígitos rejeitado',      validateTrackingCode('9261290100830215692824'), false); // 22 dígitos → inválido
assert('Código numérico 13 dígitos OK',    validateTrackingCode('1234567890123'), true);
assert('Código inválido (lixo)',           validateTrackingCode('PEDIDO12345'), false);
assert('Código inválido (vazio)',          validateTrackingCode(''), false);
assert('Código inválido (curto)',          validateTrackingCode('BR123BR'), false);

// --- Extração por regex ---
console.log('\n[ extração de bloco e apartamento ]');

const textBlocoApto1 = `DESTINATARIO: JOAO DA SILVA\nBLOCO A / APTO 302\nTRANSPORTADORA: CORREIOS\nCODIGO: BR123456789BR`;
const r1 = extract(textBlocoApto1);
assert('Bloco extraído "A"',   r1.bloco, 'A');
assert('Apto extraído "302"',  r1.apto,  '302');
assert('Rastreio Correios',    r1.rastreio, 'BR123456789BR');

const textBlocoApto2 = `PARA: MARIA OLIVEIRA\nBL B / AP 1502\nSHOPEE XPRESS`;
const r2 = extract(textBlocoApto2);
assert('Bloco extraído "B"',    r2.bloco, 'B');
assert('Apto extraído "1502"',  r2.apto,  '1502');

const textBlocoApto3 = `UNIDADE 204\nBLOCO 03\nAMAZON LOGISTICS`;
const r3 = extract(textBlocoApto3);
assert('Bloco extraído "03"',  r3.bloco, '03');
assert('Apto extraído "204"',  r3.apto,  '204');

// --- Extração de destinatário ---
console.log('\n[ extração de destinatário ]');

const textDestinatario1 = `CORREIOS SEDEX\nPARA: FULANO DE TAL\nRUA DAS FLORES 123\nCEP 80000-000`;
const rd1 = extract(textDestinatario1);
assert('Destinatário (carrier line skipped)', rd1.destinatario, 'PARA: FULANO DE TAL');

const textDestinatario2 = `AMAZON LOGISTICS\nCLAUDIA SANTOS FERREIRA\nRUA MARECHAL FLORIANO 456\nBLOCO C / APTO 101`;
const rd2 = extract(textDestinatario2);
assert('Destinatário linha simples', rd2.destinatario, 'CLAUDIA SANTOS FERREIRA');
assert('Transportadora Amazon Logistics', rd2.transportadora, 'AMAZON LOGISTICS');
assert('Bloco C',                   rd2.bloco, 'C');
assert('Apto 101',                  rd2.apto,  '101');

// --- Extração de transportadora ---
console.log('\n[ extração de transportadora ]');

const textCarrier1 = `JOSE MARIO SILVA\nBL D / AP 201\nBR987654321BR\nJADLOG .PACKAGE`;
const rc1 = extract(textCarrier1);
assert('Transportadora JADLOG .PACKAGE', rc1.transportadora, 'JADLOG .PACKAGE');
assert('Rastreio BR987654321BR',         rc1.rastreio, 'BR987654321BR');

const textCarrier2 = `PATRICIA LIMA\nMERCADO ENVIOS FLEX\n13000123456789\nBLOCO 1 / APTO 5B`;
const rc2 = extract(textCarrier2);
assert('Transportadora MERCADO ENVIOS FLEX', rc2.transportadora, 'MERCADO ENVIOS FLEX');
assert('Código numérico 14 dígitos',          rc2.rastreio, '13000123456789');

// --- Proteção contra adivinhação ---
console.log('\n[ proteção anti-adivinhação (não deve preencher campos com lixo) ]');

const textLixo = `FRAGIL\nCUIDADO VIDRO\nPESO: 2.5KG\nDIMENSOES: 30x20x15\nCNPJ: 12.345.678/0001-90`;
const rl = extract(textLixo);
assert('Destinatário vazio (lixo)',     rl.destinatario,   '');
assert('Transportadora vazia (lixo)',   rl.transportadora, '');
assert('Rastreio vazio (lixo)',         rl.rastreio,       '');
assert('Bloco vazio (lixo)',            rl.bloco,          '');
assert('Apto vazio (lixo)',             rl.apto,           '');

// --- Código de rastreio numérico ---
console.log('\n[ código de rastreio numérico ]');

const textNumTracking = `SHOPEE XPRESS\nANA PAULA RODRIGUES\nBLOCO B / AP 802\n9261290100830215692`;
const rn = extract(textNumTracking);
// 19 dígitos — fora do range 10-14, NÃO deve ser capturado como rastreio
assert('Tracking 19 dígitos rejeitado', rn.rastreio, '');

const textNumTracking2 = `SHOPEE\nROBERTO ALVES\nBL A / APTO 12\n12345678901234`;
const rn2 = extract(textNumTracking2);
assert('Tracking 14 dígitos aceito', rn2.rastreio, '12345678901234');

// ---------------------------------------------------------------------------
// Resultado final
// ---------------------------------------------------------------------------
console.log('\n==============================================');
console.log(`Resultado: ${passed} passaram, ${failed} falharam`);
if (failed > 0) {
  console.error(`\n⚠️  ${failed} teste(s) falharam. Revise a lógica de extração.\n`);
  process.exit(1);
} else {
  console.log('\n✅ Todos os testes passaram — pipeline de extração OK.\n');
}
