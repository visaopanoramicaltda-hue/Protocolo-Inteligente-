/**
 * MoradorSelectorService - Seleciona moradores de uma unidade (bloco/apto).
 * Fornece métodos para listar todos os moradores de um apartamento.
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { DbService, Morador } from './db.service';

export interface UnitResidents {
  bloco: string;
  apto: string;
  principal: Morador | null;
  others: Morador[];
  all: Morador[];
}

@Injectable({ providedIn: 'root' })
export class MoradorSelectorService {
  private db = inject(DbService);

  /** Sinal com a unidade atualmente selecionada (bloco + apto). */
  selectedUnit = signal<{ bloco: string; apto: string } | null>(null);

  /** Moradores da unidade selecionada. */
  unitResidents = computed<UnitResidents | null>(() => {
    const unit = this.selectedUnit();
    if (!unit) return null;
    return this.getResidentsForUnit(unit.bloco, unit.apto);
  });

  /** Seleciona uma unidade e retorna seus moradores. */
  selectUnit(bloco: string, apto: string): UnitResidents {
    this.selectedUnit.set({ bloco, apto });
    return this.getResidentsForUnit(bloco, apto);
  }

  /** Limpa a seleção atual. */
  clearSelection(): void {
    this.selectedUnit.set(null);
  }

  /** Retorna todos os moradores de um bloco/apto. */
  getResidentsForUnit(bloco: string, apto: string): UnitResidents {
    const all = this.db.moradores().filter(
      m =>
        m.bloco.toUpperCase() === bloco.toUpperCase() &&
        m.apto.toUpperCase() === apto.toUpperCase()
    );
    const principal = all.find(m => m.isPrincipal) || (all.length > 0 ? all[0] : null);
    const others = all.filter(m => m !== principal);
    return { bloco, apto, principal, others, all };
  }

  /** Lista todas as unidades com moradores registrados (sem duplicatas). */
  listAllUnits(): { bloco: string; apto: string; count: number }[] {
    const map = new Map<string, number>();
    this.db.moradores().forEach(m => {
      const key = `${m.bloco.toUpperCase()}|${m.apto.toUpperCase()}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([k, count]) => {
        const [bloco, apto] = k.split('|');
        return { bloco, apto, count };
      })
      .sort((a, b) => a.bloco.localeCompare(b.bloco) || a.apto.localeCompare(b.apto));
  }

  /** Procura moradores de forma fuzzy pelo nome. */
  searchByName(query: string): Morador[] {
    if (!query || query.trim().length < 2) return [];
    const q = this.normalize(query);
    return this.db.moradores().filter(m => this.normalize(m.nome).includes(q));
  }

  private normalize(s: string): string {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
