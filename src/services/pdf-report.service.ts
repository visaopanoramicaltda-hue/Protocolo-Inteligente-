/**
 * PdfReportService - Relatórios PDF detalhados com histórico completo.
 * Gera PDF de ações, encomendas e moradores para auditoria.
 */
import { Injectable, inject } from '@angular/core';
import { jsPDF } from 'jspdf';
import { DbService, Encomenda, Morador, SystemLog } from './db.service';
import { AuthService } from './auth.service';
import { UiService } from './ui.service';

type ReportType = 'DAILY' | 'FULL_HISTORY' | 'PENDING' | 'DELIVERED' | 'ACTION_LOG';

interface ReportOptions {
  type: ReportType;
  startDate?: Date;
  endDate?: Date;
  blocoFilter?: string;
  aptoFilter?: string;
}

@Injectable({ providedIn: 'root' })
export class PdfReportService {
  private db = inject(DbService);
  private auth = inject(AuthService);
  private ui = inject(UiService);

  private readonly C_DARK = [35, 35, 35] as const;
  private readonly C_ORANGE = [232, 108, 38] as const;
  private readonly C_LIGHT = [234, 224, 213] as const;
  private readonly C_WHITE = [255, 255, 255] as const;

  /** Gera e abre PDF com relatório completo de encomendas. */
  async generatePackageReport(options: ReportOptions): Promise<void> {
    this.ui.show('Gerando relatório PDF...', 'INFO');
    try {
      const blob = await this.buildPdf(options);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_${options.type.toLowerCase()}_${Date.now()}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      this.ui.show('Relatório gerado com sucesso!', 'SUCCESS');
    } catch (err) {
      console.error('[PdfReport]', err);
      this.ui.show('Falha ao gerar relatório.', 'ERROR');
    }
  }

  /** Gera PDF de ações do log do sistema. */
  async generateActionLog(): Promise<void> {
    return this.generatePackageReport({ type: 'ACTION_LOG' });
  }

  /** Envia PDF como Blob (para compartilhar via WhatsApp / mensagem). */
  async buildPdf(options: ReportOptions): Promise<Blob> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const { type, startDate, endDate } = options;

    const allPkgs = this.db.encomendas();
    let items = this.filterItems(allPkgs, options);

    this.drawHeader(doc, this.getReportTitle(type));
    this.drawMetaRow(doc, items, type);

    let y = 60;

    if (type === 'ACTION_LOG') {
      y = this.drawActionLog(doc, y);
    } else {
      y = this.drawPackageTable(doc, items, y);
    }

    this.drawFooter(doc);

    return doc.output('blob');
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private filterItems(items: Encomenda[], opts: ReportOptions): Encomenda[] {
    let result = [...items];
    if (opts.type === 'PENDING') result = result.filter(e => e.status === 'PENDENTE');
    if (opts.type === 'DELIVERED') result = result.filter(e => e.status === 'ENTREGUE');
    if (opts.startDate) result = result.filter(e => new Date(e.dataEntrada) >= opts.startDate!);
    if (opts.endDate) result = result.filter(e => new Date(e.dataEntrada) <= opts.endDate!);
    if (opts.blocoFilter) result = result.filter(e => (e.bloco || '').toUpperCase() === opts.blocoFilter!.toUpperCase());
    if (opts.aptoFilter) result = result.filter(e => (e.apto || '').toUpperCase() === opts.aptoFilter!.toUpperCase());
    if (opts.type === 'DAILY') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(e => new Date(e.dataEntrada) >= today);
    }
    return result.sort((a, b) => new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime());
  }

  private getReportTitle(type: ReportType): string {
    const map: Record<ReportType, string> = {
      DAILY: 'RELATÓRIO DIÁRIO',
      FULL_HISTORY: 'HISTÓRICO COMPLETO',
      PENDING: 'ENCOMENDAS PENDENTES',
      DELIVERED: 'ENCOMENDAS ENTREGUES',
      ACTION_LOG: 'LOG DE AÇÕES'
    };
    return map[type] || 'RELATÓRIO';
  }

  private drawHeader(doc: jsPDF, title: string): void {
    const W = 210;
    doc.setFillColor(...this.C_DARK);
    doc.rect(0, 0, W, 38, 'F');
    doc.setFillColor(...this.C_ORANGE);
    doc.rect(0, 38, W, 2, 'F');

    doc.setTextColor(...this.C_WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('SIMBIOSE', 14, 16);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text('PROTOCOLO INTELIGENTE DE GESTÃO', 14, 22);

    doc.setTextColor(...this.C_WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title, W - 14, 14, { align: 'right' });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    const now = new Date().toLocaleString('pt-BR');
    doc.text(`Gerado em: ${now}`, W - 14, 21, { align: 'right' });

    const condoName = this.db.appConfig()?.nomeCondominio || 'CONDOMÍNIO';
    const user = this.auth.currentUser()?.nome || '';
    doc.text(`${condoName} | Operador: ${user}`, W - 14, 27, { align: 'right' });
  }

  private drawMetaRow(doc: jsPDF, items: Encomenda[], type: ReportType): void {
    const W = 210;
    const pending = items.filter(e => e.status === 'PENDENTE').length;
    const delivered = items.filter(e => e.status === 'ENTREGUE').length;
    const canceled = items.filter(e => e.status === 'CANCELADA').length;

    doc.setFillColor(...this.C_LIGHT);
    doc.rect(0, 42, W, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...this.C_DARK);

    const stats = [
      `TOTAL: ${items.length}`,
      `PENDENTES: ${pending}`,
      `ENTREGUES: ${delivered}`,
      `CANCELADAS: ${canceled}`
    ];
    const colW = W / stats.length;
    stats.forEach((s, i) => {
      doc.text(s, 14 + i * colW, 51);
    });
  }

  private drawPackageTable(doc: jsPDF, items: Encomenda[], startY: number): number {
    const W = 210;
    const MARGIN = 14;
    const COL_W = [10, 35, 18, 18, 28, 22, 22, 27];
    const HEADERS = ['#', 'DESTINATÁRIO', 'BLOCO', 'APTO', 'TRANSPORTADORA', 'ENTRADA', 'SAÍDA', 'STATUS'];
    const ROW_H = 8;

    // Header row
    doc.setFillColor(...this.C_DARK);
    doc.rect(MARGIN, startY, W - MARGIN * 2, ROW_H, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...this.C_WHITE);

    let x = MARGIN + 1;
    HEADERS.forEach((h, i) => {
      doc.text(h, x, startY + 5.5);
      x += COL_W[i];
    });

    let y = startY + ROW_H;

    items.forEach((item, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        // Repeat header on new page
        doc.setFillColor(...this.C_DARK);
        doc.rect(MARGIN, y, W - MARGIN * 2, ROW_H, 'F');
        doc.setTextColor(...this.C_WHITE);
        doc.setFont('helvetica', 'bold');
        x = MARGIN + 1;
        HEADERS.forEach((h, i) => { doc.text(h, x, y + 5.5); x += COL_W[i]; });
        y += ROW_H;
      }

      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 250 : 240, isEven ? 248 : 240, isEven ? 245 : 240);
      doc.rect(MARGIN, y, W - MARGIN * 2, ROW_H, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...this.C_DARK);

      const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
      const cols = [
        String(idx + 1),
        this.truncate(item.destinatarioNome || '-', 22),
        item.bloco || '-',
        item.apto || '-',
        this.truncate(item.transportadora || 'MANUAL', 16),
        formatDate(item.dataEntrada),
        formatDate(item.dataSaida),
        item.status
      ];

      // Color status
      x = MARGIN + 1;
      cols.forEach((c, i) => {
        if (i === 7) {
          const [r, g, b] = item.status === 'PENDENTE'
            ? [217, 119, 6]
            : item.status === 'ENTREGUE'
            ? [22, 163, 74]
            : [220, 38, 38];
          doc.setTextColor(r, g, b);
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setTextColor(...this.C_DARK);
          doc.setFont('helvetica', 'normal');
        }
        doc.text(c, x, y + 5.5);
        x += COL_W[i];
      });

      y += ROW_H;
    });

    if (items.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Nenhum registro encontrado para os filtros selecionados.', MARGIN, y + 10);
      y += 20;
    }

    return y + 5;
  }

  private drawActionLog(doc: jsPDF, startY: number): number {
    const logs: SystemLog[] = this.db.logs ? this.db.logs() : [];
    const MARGIN = 14;
    const W = 210;
    const ROW_H = 9;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...this.C_DARK);
    doc.text('REGISTRO DE AÇÕES DO SISTEMA', MARGIN, startY);
    startY += 6;

    doc.setFillColor(...this.C_DARK);
    doc.rect(MARGIN, startY, W - MARGIN * 2, ROW_H, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...this.C_WHITE);
    doc.text('DATA/HORA', MARGIN + 1, startY + 6);
    doc.text('AÇÃO', MARGIN + 32, startY + 6);
    doc.text('USUÁRIO', MARGIN + 60, startY + 6);
    doc.text('DETALHES', MARGIN + 90, startY + 6);
    startY += ROW_H;

    const recent = [...logs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 200);

    recent.forEach((log, idx) => {
      if (startY > 270) { doc.addPage(); startY = 20; }
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 250 : 240, isEven ? 248 : 240, isEven ? 245 : 240);
      doc.rect(MARGIN, startY, W - MARGIN * 2, ROW_H, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...this.C_DARK);
      const ts = new Date(log.timestamp).toLocaleString('pt-BR');
      doc.text(ts, MARGIN + 1, startY + 6);
      doc.text(log.action || '-', MARGIN + 32, startY + 6);
      doc.text(this.truncate(log.userName || '-', 14), MARGIN + 60, startY + 6);
      doc.text(this.truncate(log.details || '-', 38), MARGIN + 90, startY + 6);
      startY += ROW_H;
    });

    return startY + 5;
  }

  private drawFooter(doc: jsPDF): void {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(...this.C_DARK);
      doc.rect(0, 285, 210, 12, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(150, 150, 150);
      doc.text('Simbiose Protocolo Inteligente – Documento gerado automaticamente', 14, 292);
      doc.text(`Pág. ${i}/${pageCount}`, 196, 292, { align: 'right' });
    }
  }

  private truncate(s: string, max: number): string {
    return s.length > max ? s.substring(0, max - 1) + '…' : s;
  }
}
