/**
 * BackupAutoService - Backup automático após cada ação relevante.
 * Usa IndexedDB via DbService e salva snapshot incrementalmente.
 */
import { Injectable, inject, signal } from '@angular/core';
import { DbService, BackupData } from './db.service';
import { UiService } from './ui.service';

export type BackupStatus = 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR';

const BACKUP_STORE = 'simbiose_auto_backup_v2';
const MAX_KEPT = 10; // mantém últimos 10 snapshots

@Injectable({ providedIn: 'root' })
export class BackupAutoService {
  private db = inject(DbService);
  private ui = inject(UiService);

  status = signal<BackupStatus>('IDLE');
  lastBackupAt = signal<Date | null>(null);
  totalBackups = signal(0);

  private debounceTimer: any = null;

  /** Dispara backup com debounce de 2s para não sobrecarregar em ações em série. */
  scheduleBackup(immediate = false): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    const delay = immediate ? 0 : 2000;
    this.debounceTimer = setTimeout(() => this.performBackup(), delay);
  }

  async performBackup(): Promise<boolean> {
    this.status.set('SAVING');
    try {
      const data = await this.db.exportData();
      await this.saveToIndexedDB(data);
      this.status.set('SAVED');
      this.lastBackupAt.set(new Date());
      return true;
    } catch (err) {
      console.error('[BackupAuto] Falha:', err);
      this.status.set('ERROR');
      return false;
    }
  }

  /** Retorna lista de snapshots disponíveis (mais recente primeiro). */
  async listSnapshots(): Promise<{ key: string; exportedAt: string; size: number }[]> {
    try {
      const db = await this.openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(BACKUP_STORE, 'readonly');
        const store = tx.objectStore(BACKUP_STORE);
        const req = store.getAll();
        req.onsuccess = () => {
          const items = (req.result || []) as { key: string; exportedAt: string; payload: string }[];
          const list = items
            .map(i => ({ key: i.key, exportedAt: i.exportedAt, size: i.payload.length }))
            .sort((a, b) => new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime());
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  /** Restaura o snapshot mais recente. */
  async restoreLatest(): Promise<boolean> {
    try {
      const db = await this.openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(BACKUP_STORE, 'readonly');
        const store = tx.objectStore(BACKUP_STORE);
        const idx = store.index('exportedAt');
        const req = idx.openCursor(null, 'prev');
        req.onsuccess = async () => {
          const cursor = req.result;
          if (!cursor) { resolve(false); return; }
          try {
            const parsed: BackupData = JSON.parse(cursor.value.payload);
            const ok = await this.db.processBackupData(parsed);
            resolve(ok);
          } catch {
            resolve(false);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return false;
    }
  }

  private async saveToIndexedDB(data: BackupData): Promise<void> {
    const db = await this.openDb();
    const key = `backup_${Date.now()}`;
    const payload = JSON.stringify(data);

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(BACKUP_STORE, 'readwrite');
      const store = tx.objectStore(BACKUP_STORE);
      const req = store.put({ key, exportedAt: data.exportedAt, payload });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    await this.pruneOldBackups(db);
    this.totalBackups.update(n => n + 1);
  }

  private async pruneOldBackups(db: IDBDatabase): Promise<void> {
    return new Promise<void>((resolve) => {
      const tx = db.transaction(BACKUP_STORE, 'readwrite');
      const store = tx.objectStore(BACKUP_STORE);
      const idx = store.index('exportedAt');
      const req = idx.openCursor(null, 'prev');
      let count = 0;
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) { resolve(); return; }
        count++;
        if (count > MAX_KEPT) {
          cursor.delete();
        }
        cursor.continue();
      };
      req.onerror = () => resolve();
    });
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('SimbioseAutoBackup', 1);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(BACKUP_STORE)) {
          const store = db.createObjectStore(BACKUP_STORE, { keyPath: 'key' });
          store.createIndex('exportedAt', 'exportedAt', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}
