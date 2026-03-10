
import { Injectable } from '@angular/core';

declare var Tesseract: any;

export type ScanStatus = 'valid' | 'invalid' | 'fallback';

export type ScanResult = {
  destinatario: string;
  transportadora: string;
  rastreio: string;
  bloco: string;
  apto: string;
  confidence: number;
  heatmap: 'green' | 'yellow' | 'red';
  status: ScanStatus;
  timeMs: number;
  rawText?: string;
};

const STORAGE = {
  moradores: 'learned-moradores',
  transportadoras: 'learned-transportadoras',
  lastSync: 'dataset-last-sync'
};

// Dataset de transportadoras brasileiras (200+)
const BASE_TRANSPORTADORAS = [
  // CORREIOS E SERVIÇOS
  'CORREIOS', 'SEDEX', 'SEDEX 10', 'SEDEX 12', 'SEDEX HOJE', 'PAC', 'PAC MINI',
  'E-SEDEX', 'CARTA REGISTRADA', 'ENCOMENDA PAC',
  // GRANDES OPERADORES NACIONAIS
  'JADLOG', 'JADLOG .PACKAGE', 'JADLOG .EXPRESSO', 'JADLOG .COM',
  'LOGGI', 'TOTAL EXPRESS', 'AZUL CARGO', 'AZUL EXPRESSO',
  'BRASPRESS', 'PATRUS', 'DIRECT EXPRESS', 'SEQUOIA', 'SEQUOIA LOGISTICA',
  'RODONAVES', 'JAMEF', 'TEGMA', 'JSL LOGISTICA', 'BRINGER', 'LOCALFRIO',
  'TNT MERCURIO', 'MERCURIO TRANSPORTES', 'RTE', 'RTE EXPRESSO',
  // E-COMMERCE PLATFORMS
  'MERCADO LIVRE', 'MERCADO ENVIOS', 'MERCADO ENVIOS FLEX',
  'AMAZON', 'AMAZON LOGISTICS', 'AMAZON FLEX',
  'SHOPEE', 'SHOPEE XPRESS',
  'MAGALU', 'MAGALULOG', 'MAGAZINE LUIZA', 'MAGALU ENTREGAS',
  'AMERICANAS', 'B2W ENTREGA', 'SHOPTIME', 'SUBMARINO',
  'CASAS BAHIA', 'VIA VAREJO', 'PONTOFRIO',
  'ALIEXPRESS', 'CAINIAO', 'SHEIN', 'WISH',
  // INTERNACIONAIS
  'FEDEX', 'FEDEX EXPRESSO', 'FEDEX ECONÔMICO',
  'DHL', 'DHL EXPRESS', 'DHL ECONÔMICO', 'DHL PAKET',
  'UPS', 'UPS EXPRESS', 'TNT', 'TNT EXPRESSO',
  // AÉREOS
  'LATAM CARGO', 'GOL CARGO', 'TAM CARGO', 'AEROCARGO',
  // APP DELIVERY / LAST MILE
  'RAPPI', 'IFOOD', 'UBER FLASH', 'LALAMOVE', 'LOGGI URBANO',
  'DELIVERY DIRETO', 'ENTREGA FACIL', 'MOTOBOY',
  // PLATAFORMAS TECH
  'MELHOR ENVIO', 'FRENET', 'KANGU', 'PEGAKI', 'INTELIPOST',
  'FLEX EXPRESS', 'NUVEM ENVIOS', 'EASYLOG', 'OMNILOG',
  // LOJAS / MARKETPLACE
  'RENNER ENTREGA', 'CENTAURO DELIVERY', 'ZATTINI', 'DAFITI',
  'NETSHOES', 'RIACHUELO', 'CEA ENTREGA', 'HERING ENTREGA',
  'KABUM', 'PICHAU', 'TERABYTE',
  'LEROY MERLIN', 'TOK STOK', 'IKEA', 'MADEIRAMADEIRA',
  'CARREFOUR', 'ATACADAO', 'ASSAI', 'ULTRAFARMA',
  // REGIONAIS E OUTROS
  'EXPRESSO ARAXÁ', 'EXPRESSO JUNDIAI', 'EXPRESSO NORDESTE',
  'RAPIDO MERCANTIL', 'GIRO LOGISTICA', 'BRLOG', 'LOGSUL',
  'LOG EXPRESSO', 'SPEEDLOG', 'FASTLOG', 'DROLOG', 'SKY EXPRESS',
  'LUFT LOGISTICS', 'SDC LOGISTICA', 'TRANS RODONORTE',
  'NORDESTAO LOGISTICA', 'CATLOG', 'SOLISTICA', 'GOLOG',
  'COMETA LOGISTICA', 'CONECTA LOG', 'JET ENTREGA',
  'B&M LOGISTICA', 'EXATA LOGISTICA', 'NUTRANS', 'PLENOBRAS',
  'DIRECIONAL LOGISTICA', 'LEVE LOGISTICA', 'ENVIAAQUI',
  'ENVIAREI', 'MINIENVIOS', 'FRETEBRAS', 'FRETEMAIS',
  'TRANSPORTANDO', 'DESPACHA', 'TRANS MAZZA',
  'ITAMARATI NORTE', 'ARCO IRIS TRANSPORTES', 'TRANS NB',
  'EXPRESSO MARINGA', 'EXPRESSO ARAÇATUBA', 'TRANS EXPRESSO SUL',
  'CLICKPOST', 'DROGA RAIA', 'DROGASIL',
];

// --- PROTOCOLO DE IMUNIDADE (BLACKLIST IMUTÁVEL) ---
const IMMUTABLE_IGNORE_LIST = [
    'RUA', 'AV.', 'AVENIDA', 'ALAMEDA', 'TRAVESSA', 'RODOVIA', 'ESTRADA',
    'CEP', 'BAIRRO', 'CIDADE', 'ESTADO', 'UF', 'BRASIL',
    'PEDIDO', 'ORDER', 'NOTA', 'FISCAL', 'DANFE', 'CNPJ', 'CPF', 'INSCRICAO',
    'VOLUME', 'PESO', 'KG', 'GRAMAS', 'LITROS',
    'SMS1', 'SMS2', 'SMS',
    'REMETENTE', 'DESTINATARIO', 'A/C',
    'SERIE', 'LOTE', 'VALIDADE', 'FABRICACAO',
    'FONE', 'TEL', 'CEL', 'CONTATO',
    'WWW', 'HTTP', '.COM', '.BR',
    'FRAGIL', 'CUIDADO', 'VIDRO'
];

// Regex patterns para extração estruturada
const TRACKING_REGEX    = /\b([A-Z]{2}\d{9}[A-Z]{2}|\d{10,14})\b/;
const BLOCO_REGEX       = /\b(?:BL(?:O(?:CO?)?)?\s*[:\-]?\s*)([A-Z0-9]{1,4})\b/i;
const APTO_REGEX        = /\b(?:AP(?:T?O?)?\s*[:\-]?\s*|APART(?:AMENTO)?\s*[:\-]?\s*|UNIDADE\s*[:\-]?\s*)([A-Z0-9]{1,6})\b/i;

// Blacklist adicional para dimensões/medidas
const DIMENSIONS_REGEX  = /\d+\s*[Xx×]\s*\d+/;  // ex: 20x15, 30X20X15

@Injectable({
  providedIn: 'root'
})
export class ExclusiveScannerService {

  private readonly TIME_LIMIT = 25000; 
  
  // Yield de Resfriamento para Releitura (Motor Local é pesado)
  private readonly RELEITURA_THERMAL_YIELD_MS = 200; 
  
  // ROTA LOCAL (OFFLINE FIRST)
  private readonly WORKER_LOCAL = '/assets/tesseract/worker.min.js';
  private readonly CORE_LOCAL = '/assets/tesseract/tesseract-core.wasm.js';
  
  // CDN FALLBACK
  private readonly WORKER_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js';
  private readonly CORE_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js';
  
  constructor() {}

  /* ==========================
     OCR LOCAL (V4 ENGINE)
     ========================== */
  public async runOCR(image: Blob | string): Promise<string> {
    const source = typeof image === 'string' && !image.startsWith('data:') ? `data:image/jpeg;base64,${image}` : image;

    if (typeof Tesseract === 'undefined') {
        console.error('ExclusiveScanner: Tesseract.js global not loaded.');
        return ''; 
    }

    // 1. TENTATIVA LOCAL
    try {
        const worker = await Tesseract.createWorker('por', 1, {
          workerPath: this.WORKER_LOCAL,
          corePath: this.CORE_LOCAL,
          logger: () => {}, 
          errorHandler: () => {} 
        });
        
        // Parâmetros otimizados para texto misto (logística)
        await worker.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-./: ',
          tessedit_pageseg_mode: '6' // Assume bloco uniforme
        });

        const { data } = await worker.recognize(source);
        await worker.terminate();
        
        return data.text.toUpperCase();

    } catch (e: any) {
        if (!navigator.onLine) {
            console.warn('ExclusiveScanner: Offline e worker local falhou.');
            return ''; 
        }
        console.warn('ExclusiveScanner: Falha no Worker Local. Tentando CDN...', e);
        
        try {
            const workerCDN = await Tesseract.createWorker('por', 1, {
                workerPath: this.WORKER_CDN,
                corePath: this.CORE_CDN,
                errorHandler: () => {}
            });
            const { data } = await workerCDN.recognize(source);
            await workerCDN.terminate();
            return data.text.toUpperCase();
        } catch (cdnError) {
            console.error('ExclusiveScanner: Falha Fatal (Local + CDN).', cdnError);
            return '';
        }
    }
  }

  /* ==========================
     HISTÓRICO LOCAL (MEMORY)
     ========================== */
  private load(key: string): string[] {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch { return []; }
  }

  private learn(key: string, value: string) {
    if (!value || value.length < 3) return;
    const list = this.load(key);
    if (!list.includes(value)) {
      list.push(value);
      localStorage.setItem(key, JSON.stringify(list));
    }
  }

  /* ==========================
     EXTRAÇÃO + CORREÇÃO (TITANIUM SHIELD)
     ========================== */
  private extract(text: string) {
    if (!text) return { destinatario: '', transportadora: '', rastreio: '', bloco: '', apto: '' };

    const upperText = text.toUpperCase();

    // --- FASE 1: EXTRAÇÃO POR REGEX (CAMPOS ESTRUTURADOS) ---

    // Código de rastreio
    let rastreio = '';
    const trackingMatch = upperText.match(TRACKING_REGEX);
    if (trackingMatch) rastreio = trackingMatch[1];

    // Bloco
    let bloco = '';
    const blocoMatch = upperText.match(BLOCO_REGEX);
    if (blocoMatch) bloco = blocoMatch[1].trim();

    // Apartamento
    let apto = '';
    const aptoMatch = upperText.match(APTO_REGEX);
    if (aptoMatch) apto = aptoMatch[1].trim();

    // --- FASE 2: EXTRAÇÃO DE TRANSPORTADORA E DESTINATÁRIO ---
    const rawLines = text.split('\n');
    const validLines: string[] = [];

    for (const rawLine of rawLines) {
        const line = rawLine.trim().toUpperCase();
        if (line.length < 3) continue;
        const isToxic = IMMUTABLE_IGNORE_LIST.some(badTerm => line.includes(badTerm));
        // Permite linhas com tracking (para não suprimir a linha de rastreio)
        if (!isToxic) validLines.push(line);
    }

    const learnedT = this.load(STORAGE.transportadoras);
    // Ordena por comprimento DECRESCENTE: match mais longo primeiro (evita "PAC" em "JADLOG .PACKAGE")
    const allCarriers = [...BASE_TRANSPORTADORAS, ...learnedT].sort((a, b) => b.length - a.length);

    let destinatario = '';
    let transportadora = '';

    for (const l of validLines) {
      // Extração de transportadora por lookup (longest-match first)
      if (!transportadora) {
          for (const t of allCarriers) {
            if (l.includes(t)) { transportadora = t; break; }
          }
      }

      // Extração de destinatário: exclui linhas de transportadora, endereço e dimensões
      if (!destinatario) {
          const isCarrier    = allCarriers.some(t => l.includes(t));
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

  /* ==========================
     SCORE + HEATMAP
     ========================== */
  private confidence(data: { destinatario: string; transportadora: string; rastreio: string }) {
    let c = 0;
    if (data.destinatario.length >= 6) c += 30;
    if (data.transportadora) c += 30;
    if (data.rastreio) c += 20;
    
    const learnedResidents = this.load(STORAGE.moradores);
    if (learnedResidents.some(r => data.destinatario.includes(r) || r.includes(data.destinatario))) c += 20;
    
    return Math.min(c, 100);
  }

  private heatmap(score: number): 'green' | 'yellow' | 'red' {
    if (score >= 75) return 'green';
    if (score >= 40) return 'yellow';
    return 'red';
  }

  /* ==========================
     ENGINE PRINCIPAL
     ========================== */
  async processScan(image: Blob | string): Promise<ScanResult> {
    // --- PROTOCOLO DE RESFRIAMENTO PARA RELEITURA ---
    // Pausa tática de 200ms antes de iniciar o Tesseract.
    // Isso permite que o device dissipe o calor gerado pela câmera antes de
    // iniciar o pico de CPU do OCR local.
    await new Promise(resolve => setTimeout(resolve, this.RELEITURA_THERMAL_YIELD_MS));

    const start = performance.now();

    try {
      const text = await Promise.race([
        this.runOCR(image),
        new Promise<string>((resolve) => setTimeout(() => resolve('TIMEOUT'), this.TIME_LIMIT))
      ]);

      if (text === 'TIMEOUT' || !text) {
          if (text === 'TIMEOUT') console.warn('[ExclusiveScanner] Tempo limite de leitura excedido.');
          
          return {
              destinatario: '', transportadora: '', rastreio: '', bloco: '', apto: '',
              confidence: 0, heatmap: 'red', status: 'invalid',
              timeMs: performance.now() - start, rawText: ''
          };
      }

      const extracted = this.extract(text);
      const score = this.confidence(extracted);
      const heatmap = this.heatmap(score);

      if (score >= 90) {
        this.learn(STORAGE.moradores, extracted.destinatario);
        this.learn(STORAGE.transportadoras, extracted.transportadora);
      }

      return {
        destinatario:  extracted.destinatario,
        transportadora: extracted.transportadora,
        rastreio:      extracted.rastreio,
        bloco:         extracted.bloco,
        apto:          extracted.apto,
        confidence:    score,
        heatmap,
        status: score >= 75 ? 'valid' : score >= 40 ? 'fallback' : 'invalid',
        timeMs: performance.now() - start,
        rawText: text
      };

    } catch (e) {
      console.error('[ExclusiveScanner] Falha no processamento:', e);
      return {
          destinatario: '', transportadora: '', rastreio: '', bloco: '', apto: '',
          confidence: 0, heatmap: 'red', status: 'invalid',
          timeMs: performance.now() - start, rawText: ''
      };
    }
  }
}
