/**
 * GeminiOcrV2Service - OCR com Gemini 2.0 Flash
 * Limpeza de cache a cada leitura, preenchimento automático robusto.
 */
import { Injectable, inject, signal } from '@angular/core';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { DbService, Morador } from './db.service';
import { UiService } from './ui.service';

export interface OcrV2Result {
  destinatario: string;
  bloco: string;
  apto: string;
  transportadora: string;
  codigoRastreio: string;
  condicaoFisica: string;
  confianca: number;
  privacyBlocked: boolean;
  rawText?: string;
  matchedMoradorId?: string;
}

@Injectable({ providedIn: 'root' })
export class GeminiOcrV2Service {
  private db = inject(DbService);
  private ui = inject(UiService);

  isProcessing = signal(false);
  lastResult = signal<OcrV2Result | null>(null);

  private genAI: GoogleGenAI | null = null;

  private getModel(): GoogleGenAI {
    if (!this.genAI) {
      const key = (this.db.appConfig()?.googleClientId || '').trim() ||
        (typeof process !== 'undefined' && (process as any).env?.GEMINI_API_KEY) || '';
      this.genAI = new GoogleGenAI({ apiKey: key });
    }
    return this.genAI;
  }

  /** Executa OCR limpando qualquer estado anterior, sem cache. */
  async readLabel(imageBase64: string): Promise<OcrV2Result> {
    if (!imageBase64 || imageBase64.length < 100) {
      return this.emptyResult();
    }

    this.isProcessing.set(true);
    this.lastResult.set(null);

    try {
      const moradores = this.db.moradores();
      const result = await this.runGemini2Flash(imageBase64, moradores);
      const refined = this.resolveResident(result, moradores);
      this.lastResult.set(refined);
      return refined;
    } catch (err) {
      console.error('[GeminiOcrV2] Erro na leitura:', err);
      this.ui.show('Falha no OCR. Tente novamente.', 'ERROR');
      return this.emptyResult();
    } finally {
      this.isProcessing.set(false);
    }
  }

  /** Releitura completa: reseta estado e relê sem nenhum cache. */
  async reread(imageBase64: string): Promise<OcrV2Result> {
    this.lastResult.set(null);
    return this.readLabel(imageBase64);
  }

  private async runGemini2Flash(base64: string, moradores: Morador[]): Promise<OcrV2Result> {
    const genAI = this.getModel();

    const residentList = moradores
      .slice(0, 80)
      .map(m => `${m.nome} (Bl:${m.bloco} Ap:${m.apto})`)
      .join('; ');

    const systemInstruction = `
      Você é um sistema OCR de portaria de condomínio. Extraia APENAS o que está impresso na etiqueta.
      NÃO invente dados. Se um campo não estiver legível, retorne string vazia.
      
      MORADORES REGISTRADOS (use para confirmar bloco/apto):
      ${residentList || 'Nenhum registrado'}
      
      REGRAS ABSOLUTAS:
      1. destinatario: nome exatamente como impresso, sem correções ortográficas
      2. bloco: apenas o bloco/torre (ex: "A", "1", "TORRE B")
      3. apto: apenas o número/letra do apartamento (ex: "101", "23B")
      4. transportadora: nome da transportadora (Correios, SEDEX, Shopee, Magalu, etc.)
      5. codigoRastreio: código alfanumérico longo de rastreio
      6. condicaoFisica: "Intacta", "Amassada", "Rasgada" ou "Violada"
      7. privacyBlocked: true SOMENTE se houver face humana visível na imagem
      8. confianca: 0.0 a 1.0 indicando certeza geral da leitura
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        destinatario: { type: Type.STRING },
        bloco: { type: Type.STRING },
        apto: { type: Type.STRING },
        transportadora: { type: Type.STRING },
        codigoRastreio: { type: Type.STRING },
        condicaoFisica: { type: Type.STRING, enum: ['Intacta', 'Amassada', 'Rasgada', 'Violada'] },
        confianca: { type: Type.NUMBER },
        privacyBlocked: { type: Type.BOOLEAN },
        rawText: { type: Type.STRING }
      },
      required: ['destinatario', 'confianca', 'privacyBlocked']
    };

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64 } },
          { text: 'Analise esta etiqueta de encomenda e extraia os dados conforme o schema.' }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.0,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      destinatario: parsed.destinatario || '',
      bloco: (parsed.bloco || '').toUpperCase().trim(),
      apto: (parsed.apto || '').toUpperCase().trim(),
      transportadora: parsed.transportadora || '',
      codigoRastreio: parsed.codigoRastreio || '',
      condicaoFisica: parsed.condicaoFisica || 'Intacta',
      confianca: typeof parsed.confianca === 'number' ? parsed.confianca : 0,
      privacyBlocked: !!parsed.privacyBlocked,
      rawText: parsed.rawText || ''
    };
  }

  /** Tenta resolver o morador pelo nome/bloco/apto extraídos. */
  private resolveResident(result: OcrV2Result, moradores: Morador[]): OcrV2Result {
    if (!moradores.length) return result;

    // Tentativa 1: correspondência por bloco + apto
    if (result.bloco && result.apto) {
      const byUnit = moradores.find(
        m =>
          m.bloco.toUpperCase() === result.bloco.toUpperCase() &&
          m.apto.toUpperCase() === result.apto.toUpperCase() &&
          m.isPrincipal
      ) || moradores.find(
        m =>
          m.bloco.toUpperCase() === result.bloco.toUpperCase() &&
          m.apto.toUpperCase() === result.apto.toUpperCase()
      );
      if (byUnit) {
        return { ...result, matchedMoradorId: byUnit.id };
      }
    }

    // Tentativa 2: correspondência fuzzy de nome
    if (result.destinatario) {
      const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      const rawNorm = norm(result.destinatario);
      const byName = moradores.find(m => norm(m.nome).includes(rawNorm) || rawNorm.includes(norm(m.nome)));
      if (byName) {
        return {
          ...result,
          bloco: result.bloco || byName.bloco,
          apto: result.apto || byName.apto,
          matchedMoradorId: byName.id
        };
      }
    }

    return result;
  }

  private emptyResult(): OcrV2Result {
    return {
      destinatario: '',
      bloco: '',
      apto: '',
      transportadora: '',
      codigoRastreio: '',
      condicaoFisica: 'Intacta',
      confianca: 0,
      privacyBlocked: false
    };
  }
}
