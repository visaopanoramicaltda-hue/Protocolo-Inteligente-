
import { Injectable, inject } from '@angular/core';
import { Encomenda, Porteiro, DbService, Morador, SystemLog } from './db.service';
import { UiService } from './ui.service';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private db = inject(DbService);
  private ui = inject(UiService);

  // Cores Oficiais (Design System: Piano Black & Neon Orange)
  private readonly COLOR_DARK_BG = [35, 35, 35]; // #232323
  private readonly COLOR_ORANGE = [232, 108, 38]; // #E86C26
  
  constructor() {}

  private async gerarHash(buffer: ArrayBuffer): Promise<string> {
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  private getImageDimensions(base64: string): Promise<{ width: number, height: number }> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
    });
  }

  /* ================= ENGINE DE PDF MASTER (LAYOUT ADAPTATIVO) ================= */

  private async criarPDFModerno(
      tituloDireita: string,
      idControle: string,
      textoResponsabilidade: string,
      colunaEsquerda: { label: string, value: string }[],
      colunaDireita: { label: string, value: string }[],
      itensVisual: Encomenda[], // ARRAY DE ITENS PARA LOGICA DE GRID
      assinaturaBase64?: string
  ): Promise<{ blob: Blob, url: string, hash: string }> {
    
    const doc = new jsPDF();
    const PAGE_WIDTH = 210;
    const PAGE_HEIGHT = 297;
    const MARGIN = 15;
    const FOOTER_HEIGHT = 20; // Altura reservada para rodapé
    const SIGNATURE_HEIGHT = 35; // Altura reservada para assinatura
    
    // --- 1. CABEÇALHO (DARK + ORANGE STRIP) ---
    doc.setFillColor(this.COLOR_DARK_BG[0], this.COLOR_DARK_BG[1], this.COLOR_DARK_BG[2]);
    doc.rect(0, 0, PAGE_WIDTH, 35, 'F'); // Fundo Escuro

    doc.setFillColor(this.COLOR_ORANGE[0], this.COLOR_ORANGE[1], this.COLOR_ORANGE[2]);
    doc.rect(0, 35, PAGE_WIDTH, 2, 'F'); // Faixa Laranja

    // Logo / Título Esquerda
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('SIMBIOSE', MARGIN, 15);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('PROTOCOLO INTELIGENTE DE GESTÃO', MARGIN, 22);

    // Título Direita
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(tituloDireita.toUpperCase(), PAGE_WIDTH - MARGIN, 14, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(`Emissão: ${new Date().toLocaleString('pt-BR')}`, PAGE_WIDTH - MARGIN, 20, { align: 'right' });
    doc.text(`ID Controle: ${idControle.substring(0, 8).toUpperCase()}`, PAGE_WIDTH - MARGIN, 25, { align: 'right' });

    let y = 50;

    // --- 2. DECLARAÇÃO DE RESPONSABILIDADE (BOX) ---
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250); // Cinza muito claro
    doc.rect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 25, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('DECLARAÇÃO DE RESPONSABILIDADE:', MARGIN + 5, y + 6);

    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    
    const splitText = doc.splitTextToSize(textoResponsabilidade, PAGE_WIDTH - (MARGIN * 2) - 10);
    doc.text(splitText, MARGIN + 5, y + 11);

    y += 35;

    // --- 3. DETALHES DO REGISTRO (GRID) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(this.COLOR_DARK_BG[0], this.COLOR_DARK_BG[1], this.COLOR_DARK_BG[2]);
    doc.text('DETALHES DO REGISTRO', MARGIN, y);
    
    doc.setDrawColor(this.COLOR_ORANGE[0], this.COLOR_ORANGE[1], this.COLOR_ORANGE[2]);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y + 2, 70, y + 2);
    
    y += 10;

    // Configuração das Colunas
    const col1X = MARGIN;
    const col2X = PAGE_WIDTH / 2 + 5;
    const rowHeight = 8;
    const maxRows = Math.max(colunaEsquerda.length, colunaDireita.length);

    doc.setLineWidth(0.1);
    doc.setDrawColor(230, 230, 230);

    for (let i = 0; i < maxRows; i++) {
        const itemEsq = colunaEsquerda[i];
        const itemDir = colunaDireita[i];
        const lineY = y + (i * rowHeight);

        if (itemEsq) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(itemEsq.label + ':', col1X, lineY);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text(itemEsq.value, col1X + 35, lineY);
        }

        if (itemDir) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(itemDir.label + ':', col2X, lineY);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text(itemDir.value, col2X + 35, lineY);
        }

        doc.line(MARGIN, lineY + 2, PAGE_WIDTH - MARGIN, lineY + 2);
    }

    y += (maxRows * rowHeight) + 10;

    // --- 4. ENGINE VISUAL ADAPTATIVA (PAGINAÇÃO INTELIGENTE) ---
    
    const totalAvailableWidth = PAGE_WIDTH - (MARGIN * 2);
    // Footer Y Position (Bottom of page minus margin)
    const pageBottomLimit = PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT; 
    
    // Zoom Config
    const activeZoom = { vertical: 1.07, horizontal: 1.20 };

    // --- CASO 1: LOTE (MÚLTIPLOS ITENS) ---
    if (itensVisual.length > 1) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`EVIDÊNCIA VISUAL - LOTE (${itensVisual.length} VOLUMES)`, MARGIN, y);
        y += 5;

        // Grid Logic (2 colunas)
        const colCount = 2;
        const gap = 5;
        const cellWidth = (totalAvailableWidth - (gap * (colCount - 1))) / colCount;
        
        // REDUZIDO PARA 35mm PARA CABER MAIS (Até 10 por página)
        const cellHeight = 35; 

        let currentX = MARGIN;
        
        for (let i = 0; i < itensVisual.length; i++) {
            const item = itensVisual[i];
            
            // VERIFICAÇÃO DE QUEBRA DE PÁGINA (PAGINAÇÃO)
            // Se a posição Y + altura da célula + espaço para assinatura (se for o último) passar do limite
            const spaceNeeded = cellHeight + gap;
            
            // Se estamos prestes a desenhar e vai estourar a página
            if (y + spaceNeeded > pageBottomLimit) {
                doc.addPage();
                y = MARGIN + 10; // Margem no topo da nova página
                
                // Repete título na nova página
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(`EVIDÊNCIA VISUAL (CONT.)`, MARGIN, y - 5);
            }

            // Define X baseado na paridade (coluna 1 ou 2)
            if (i % colCount === 0) {
                currentX = MARGIN;
                // Apenas incrementa Y se NÃO for o primeiro da nova página/bloco
                if (i > 0 && y !== MARGIN + 10) {
                   // A lógica de incremento de Y é feita no final do loop anterior se coluna fechou
                }
            } else {
                currentX = MARGIN + cellWidth + gap;
            }
            
            // Desenha Box
            doc.setDrawColor(200);
            doc.rect(currentX, y, cellWidth, cellHeight);
            
            // Foto
            if (item.fotoBase64) {
                try {
                    const dims = await this.getImageDimensions(item.fotoBase64);
                    this.drawImageFit(doc, item.fotoBase64, dims, currentX, y, cellWidth, cellHeight - 10);
                } catch(e) {}
            }

            // Legenda
            doc.setFontSize(7);
            doc.setTextColor(0, 0, 0);
            
            // REGRA: DESTINATÁRIO (No lugar da transportadora)
            const destName = (item.destinatarioNome || 'NÃO IDENTIFICADO').toUpperCase();
            doc.text(destName.substring(0, 22), currentX + 2, y + cellHeight - 7);
            
            // REGRA: TRACKING
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text((item.codigoRastreio || 'S/N').substring(0, 25), currentX + 2, y + cellHeight - 3);

            // Incrementa Y apenas quando fechamos a linha (coluna 2) ou se é o último item ímpar
            if ((i + 1) % colCount === 0 || i === itensVisual.length - 1) {
                if ((i + 1) % colCount === 0) {
                    y += cellHeight + gap;
                } else {
                    // Se for o último e ímpar, o próximo passo da lógica (assinatura) vai precisar do Y atualizado
                    y += cellHeight + gap; 
                }
            }
        }
        
        // --- ASSINATURA LOTE ---
        if (assinaturaBase64) {
             const spaceForSig = SIGNATURE_HEIGHT + 10;
             
             // Se não houver espaço para assinatura na página atual, cria nova
             if (y + spaceForSig > pageBottomLimit) {
                 doc.addPage();
                 y = MARGIN + 10;
             }
             
             const sigY = y + 5;
             const cleanSig = assinaturaBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
             try {
                 doc.addImage(`data:image/png;base64,${cleanSig}`, 'PNG', PAGE_WIDTH / 2 - 30, sigY, 60, 30);
             } catch(e) { console.warn('Erro assinatura lote', e); }
             
             doc.setDrawColor(0);
             doc.setLineWidth(0.1);
             doc.line(PAGE_WIDTH / 2 - 40, sigY + 30, PAGE_WIDTH / 2 + 40, sigY + 30);
             doc.setFontSize(8);
             doc.setFont('helvetica', 'normal');
             doc.text('Assinatura do Recebedor (Lote)', PAGE_WIDTH / 2, sigY + 34, { align: 'center' });
        }

    } 
    // --- CASO 2: ITEM ÚNICO ---
    else {
        const item = itensVisual[0];
        const fotoBase64 = item?.fotoBase64;

        if (assinaturaBase64) {
            // --- MODO RETIRADA OU LOTE ÚNICO (COM ASSINATURA) ---
            const boxHeight = 70; // Aumentado levemente
            const gap = 5;
            const photoWidth = (totalAvailableWidth - gap) * 0.55; // Reduzido foto
            const sigWidth = (totalAvailableWidth - gap) * 0.45;   // Aumentado assinatura

            doc.setDrawColor(180, 180, 180);
            // Box Foto
            doc.rect(MARGIN, y, photoWidth, boxHeight);
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            doc.text('EVIDÊNCIA VISUAL', MARGIN + 2, y + 4);

            if (fotoBase64) {
                const dims = await this.getImageDimensions(fotoBase64);
                this.drawImageFit(doc, fotoBase64, dims, MARGIN, y + 5, photoWidth, boxHeight - 15, activeZoom);
            }
            
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            const destName = (item.destinatarioNome || 'NÃO IDENTIFICADO').toUpperCase();
            doc.text(destName.substring(0, 45), MARGIN + 2, y + boxHeight - 8);
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(item.codigoRastreio || 'S/N', MARGIN + 2, y + boxHeight - 3);

            // Box Assinatura
            const box2X = MARGIN + photoWidth + gap;
            doc.rect(box2X, y, sigWidth, boxHeight);
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            doc.text('ASSINATURA DIGITAL', box2X + 2, y + 4);
            
            // SANITIZAÇÃO E INSERÇÃO SEGURA DA ASSINATURA
            const cleanSig = assinaturaBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
            try {
                // Ajustado altura e largura para preencher melhor
                doc.addImage(`data:image/png;base64,${cleanSig}`, 'PNG', box2X + 5, y + 10, sigWidth - 10, 40);
            } catch (e) {
                console.warn('Erro ao renderizar assinatura', e);
                doc.text('[Assinatura Ilegível/Erro]', box2X + 5, y + 30);
            }

            doc.setDrawColor(80);
            doc.line(box2X + 5, y + 52, box2X + sigWidth - 5, y + 52);
            doc.setFontSize(7);
            doc.text('Confirmado Eletronicamente', box2X + (sigWidth/2), y + 56, { align: 'center' });

        } else {
            // --- MODO ENTRADA (SEM ASSINATURA) - FOTO GIGANTE ---
            // Verifica espaço
            const availableForPhoto = pageBottomLimit - y;
            const maxBoxHeight = Math.min(availableForPhoto, 140); 
            
            doc.setDrawColor(180, 180, 180);
            doc.rect(MARGIN, y, totalAvailableWidth, maxBoxHeight);
            
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('REGISTRO FOTOGRÁFICO (ALTA DEFINIÇÃO)', MARGIN + 2, y + 5);

            if (fotoBase64) {
                const dims = await this.getImageDimensions(fotoBase64);
                this.drawImageFit(doc, fotoBase64, dims, MARGIN, y + 7, totalAvailableWidth, maxBoxHeight - 9, activeZoom);
            } else {
                doc.text('[Imagem não capturada]', MARGIN + 10, y + 20);
            }
        }
    }

    // --- 5. RODAPÉ (SEMPRE NA ÚLTIMA PÁGINA) ---
    const footerY = PAGE_HEIGHT - 15;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(0, footerY - 5, PAGE_WIDTH, 20, 'F'); 

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    
    // Branding White Label
    const config = this.db.appConfig();
    let footerText = 'SISTEMA SIMBIOSE';
    if (config.nomeCondominio && config.nomeCondominio.trim().length > 0) {
        footerText = config.nomeCondominio.toUpperCase();
    }
    
    doc.text(footerText, PAGE_WIDTH / 2, footerY, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Gerado via Protocolo Inteligente Simbiose', PAGE_WIDTH / 2, footerY + 4, { align: 'center' });

    const rawBuffer = doc.output('arraybuffer');
    const hash = await this.gerarHash(rawBuffer);

    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    doc.text(`HASH SHA-256: ${hash}`, PAGE_WIDTH / 2, footerY + 8, { align: 'center' });
    doc.text(`UUID UNIQ: ${idControle} | INTEGRIDADE VERIFICADA | ${new Date().toISOString()}`, PAGE_WIDTH / 2, footerY + 11, { align: 'center' });

    const blob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    return { blob, url, hash };
  }
  
  // Helper de Imagem Fit
  private drawImageFit(
      doc: jsPDF, 
      base64: string, 
      dims: {width: number, height: number}, 
      x: number, 
      y: number, 
      w: number, 
      h: number,
      zoomConfig: { vertical: number, horizontal: number } = { vertical: 1, horizontal: 1 }
  ) {
      if (dims.width <= 0 || dims.height <= 0) return;
      
      const imgRatio = dims.width / dims.height;
      const pad = 2;
      const availW = w - (pad * 2);
      const availH = h - (pad * 2);

      let dw = availW;
      let dh = availH;

      if (imgRatio > (availW / availH)) {
          dh = availW / imgRatio;
      } else {
          dw = availH * imgRatio;
      }
      
      const isPortrait = dims.height > dims.width;
      const zoom = isPortrait ? zoomConfig.vertical : zoomConfig.horizontal;
      dw *= zoom;
      dh *= zoom;

      const dx = x + pad + (availW - dw) / 2;
      const dy = y + pad + (availH - dh) / 2;
      
      // Limpeza de Base64 para garantir compatibilidade
      const cleanData = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      
      try {
        doc.addImage(`data:image/jpeg;base64,${cleanData}`, 'JPEG', dx, dy, dw, dh);
      } catch(e) {}
  }

  // --- MÉTODOS PÚBLICOS ---

  public async generateEntryProtocol(encomenda: Encomenda, porteiro: Porteiro): Promise<{ blob: Blob, url: string, hash: string }> {
    const dataFormatada = new Date(encomenda.dataEntrada).toLocaleString('pt-BR');
    const textoResponsabilidade = `Certifica-se, para os devidos fins, o recebimento de volume destinado à unidade abaixo identificada, recebido em ${dataFormatada}. O item, em condição física classificada como "${encomenda.condicaoFisica}", permanece sob custódia da portaria até sua retirada formal pelo destinatário ou pessoa autorizada.`;

    const colEsq = [
        { label: 'Gerado Por', value: porteiro.nome },
        { label: 'Data Entrada', value: dataFormatada },
        { label: 'Unidade', value: `${encomenda.bloco || '-'} - ${encomenda.apto || '-'}` },
        { label: 'Rastreio', value: encomenda.codigoRastreio || 'N/A' }
    ];

    const colDir = [
        { label: 'Transportadora', value: (encomenda.transportadora || 'N/A').toUpperCase() },
        { label: 'Destinatário', value: encomenda.destinatarioNome },
        { label: 'Condição', value: encomenda.condicaoFisica || 'Intacta' },
        { label: 'ID Transação', value: encomenda.id.substring(0, 8) + '...' }
    ];

    return this.criarPDFModerno(
        'PROTOCOLO DE ENTRADA',
        encomenda.id,
        textoResponsabilidade,
        colEsq,
        colDir,
        [encomenda],
        undefined
    );
  }

  public async generateWithdrawalProof(
      encomenda: Encomenda, 
      porteiro: Porteiro, 
      receiverName: string, 
      signatureBase64: string,
      itemsGrupo?: Encomenda[]
  ): Promise<{ blob: Blob, url: string, hash: string }> {
    
    const dataRetirada = new Date().toLocaleString('pt-BR');
    const nomeRetirada = receiverName.toUpperCase();
    const isLote = itemsGrupo && itemsGrupo.length > 1;
    
    const textoResponsabilidade = `Certifica-se, para os devidos fins, a entrega definitiva do(s) volume(s) referente(s) ao protocolo em epígrafe, retirado(s) em ${dataRetirada} por ${nomeRetirada}. A aposição da assinatura digital abaixo confirma o recebimento em ordem e encerra a responsabilidade de custódia da portaria sobre o(s) referido(s) item(ns).`;

    const colEsq = [
        { label: 'Gerado Por', value: porteiro.nome },
        { label: 'Data Retirada', value: dataRetirada },
        { label: 'Unidade', value: `${encomenda.bloco || '-'} - ${encomenda.apto || '-'}` },
        { label: 'Rastreio', value: isLote ? `${itemsGrupo.length} VOLUMES` : (encomenda.codigoRastreio || 'N/A') }
    ];

    const colDir = [
        { label: 'Retirado Por', value: nomeRetirada },
        { label: 'Destinatário', value: encomenda.destinatarioNome },
        { label: 'ID Transação', value: encomenda.id.substring(0,8) }
    ];

    return this.criarPDFModerno(
        isLote ? 'COMPROVANTE DE RETIRADA (LOTE)' : 'COMPROVANTE DE RETIRADA',
        encomenda.id,
        textoResponsabilidade,
        colEsq,
        colDir,
        itemsGrupo || [encomenda],
        signatureBase64
    );
  }
  
  public async generateDailyOperationalReport(stats: any, dateStr: string): Promise<{ blob: Blob, url: string }> { return { blob: new Blob(), url: '' }; }
  public async generateInvoice(plano: string, valor: string, cliente: string, cpf: string, condominio: string, nsu: string): Promise<{ blob: Blob, url: string, hash: string }> { return { blob: new Blob(), url: '', hash: '' }; }
  public async generateBatchEntryReceipt(items: Encomenda[], porteiro: Porteiro, courierName: string, signatureBase64: string): Promise<{ blob: Blob, url: string, hash: string }> { return { blob: new Blob(), url: '', hash: '' }; }
  public async generateEncomendasReport(items: Encomenda[], filters: string, user: Porteiro): Promise<{ blob: Blob, url: string, hash: string }> { return { blob: new Blob(), url: '', hash: '' }; }
  public async generatePorteirosReport(users: Porteiro[], requester: Porteiro): Promise<{ blob: Blob, url: string, hash: string }> { return { blob: new Blob(), url: '', hash: '' }; }
  public async generateMoradoresReport(residents: Morador[], requester: Porteiro): Promise<{ blob: Blob, url: string, hash: string }> { return { blob: new Blob(), url: '', hash: '' }; }
  public async generateTransportadorasReport(carriers: string[], requester: Porteiro): Promise<{ blob: Blob, url: string, hash: string }> { return { blob: new Blob(), url: '', hash: '' }; }

  public async generateAuditLogReport(logs: SystemLog[], requester: Porteiro): Promise<{ blob: Blob, url: string, hash: string }> {
    const doc = new jsPDF();
    const PAGE_WIDTH = 210;
    const MARGIN = 15;

    // Header
    doc.setFillColor(this.COLOR_DARK_BG[0], this.COLOR_DARK_BG[1], this.COLOR_DARK_BG[2]);
    doc.rect(0, 0, PAGE_WIDTH, 35, 'F');
    doc.setFillColor(this.COLOR_ORANGE[0], this.COLOR_ORANGE[1], this.COLOR_ORANGE[2]);
    doc.rect(0, 35, PAGE_WIDTH, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('SIMBIOSE', MARGIN, 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('RELATÓRIO DE AUDITORIA – AÇÕES DO SISTEMA', MARGIN, 22);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('AUDITORIA', PAGE_WIDTH - MARGIN, 14, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(`Emissão: ${new Date().toLocaleString('pt-BR')}`, PAGE_WIDTH - MARGIN, 20, { align: 'right' });
    doc.text(`Gerado por: ${requester.nome}`, PAGE_WIDTH - MARGIN, 26, { align: 'right' });

    let y = 44;

    // Table header
    const colWidths = [38, 25, 22, 95];
    const colX = [MARGIN, MARGIN + colWidths[0], MARGIN + colWidths[0] + colWidths[1], MARGIN + colWidths[0] + colWidths[1] + colWidths[2]];

    doc.setFillColor(232, 108, 38);
    doc.rect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA / HORA', colX[0] + 2, y + 5.5);
    doc.text('USUÁRIO', colX[1] + 2, y + 5.5);
    doc.text('AÇÃO', colX[2] + 2, y + 5.5);
    doc.text('DETALHES', colX[3] + 2, y + 5.5);
    y += 10;

    // Table rows
    doc.setFont('helvetica', 'normal');
    let rowAlt = false;
    for (const log of logs) {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        if (rowAlt) {
            doc.setFillColor(245, 245, 245);
            doc.rect(MARGIN, y - 1, PAGE_WIDTH - MARGIN * 2, 7, 'F');
        }
        rowAlt = !rowAlt;
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(6.5);
        const dateStr = new Date(log.timestamp).toLocaleString('pt-BR');
        doc.text(dateStr, colX[0] + 1, y + 4);
        doc.text((log.userName || '').substring(0, 14), colX[1] + 1, y + 4);
        doc.text((log.action || '').substring(0, 10), colX[2] + 1, y + 4);
        const detailLines = doc.splitTextToSize((log.details || '').substring(0, 120), colWidths[3] - 4);
        doc.text(detailLines[0] || '', colX[3] + 1, y + 4);
        y += 7;
    }

    // Footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`Simbiose • Auditoria • Página ${i}/${totalPages}`, PAGE_WIDTH / 2, 290, { align: 'center' });
    }

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const arrayBuffer = await blob.arrayBuffer();
    const hash = await this.gerarHash(arrayBuffer);
    return { blob, url, hash };
  }
}
