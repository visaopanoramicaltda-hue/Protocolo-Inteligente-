
import { Component, inject, signal, effect, OnDestroy, computed, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { AuthService } from './services/auth.service';
import { DbService } from './services/db.service';
import { UiService } from './services/ui.service';
import { DataProtectionService } from './services/data-protection.service';
import { QuantumNetService } from './services/core/quantum-net.service';
import { GeminiService } from './services/gemini.service'; 
import { DeepSeekService } from './services/deep-seek.service';
import { CommonModule, PlatformLocation } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { BackPressService } from './services/core/back-press.service';
import { SingleSessionService } from './services/core/single-session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy, OnInit {
  auth = inject(AuthService);
  db = inject(DbService);
  ui = inject(UiService);
  protection = inject(DataProtectionService);
  quantumNet = inject(QuantumNetService); 
  gemini = inject(GeminiService); 
  deepSeek = inject(DeepSeekService); 
  sessionGuard = inject(SingleSessionService); 
  private router = inject(Router);
  
  // Update State
  updateAvailable = signal(false);
  
  // Initialization State
  initStatus = signal<'loading' | 'error' | 'ready'>('loading');
  initMessage = signal('');
  isRouteLoading = signal(false);
  
  // Logout Confirmation State
  showLogoutConfirmation = signal(false);
  
  // ROUTE TRACKING FOR HEADER VISIBILITY
  currentRoute = signal('');
  
  // TOAST SWIPE STATE
  activeToastSwipe = signal<{id: string, startX: number, currentOffset: number} | null>(null);
  
  // Image Viewer State (Local use mostly, but kept for compatibility)
  viewingImage = signal<string | null>(null);
  
  // Computed Header Visibility: EXCLUSIVE TO DASHBOARD
  isHeaderVisible = computed(() => {
      // 1. Verificações Básicas de Estado
      if (!this.db.initialized() || !this.auth.currentUser()) return false;
      
      // 2. Se o visualizador de imagens global estiver ativo, oculta tudo
      if (this.ui.isImageViewerOpen()) return false;

      // 3. Se estiver em Modo de Assinatura (Foco Total), oculta
      if (this.ui.isSignatureMode()) return false;

      // 4. REGRA DE OURO: O Header só aparece na rota '/dashboard' exata.
      // Em '/admin', '/login' ou qualquer outra, ele deve ser destruído.
      const route = this.currentRoute();
      return route === '/dashboard';
  });
  
  private restorationAttempted = false;
  private heartbeatInterval: any;
  private safetyTimeout: any;
  
  // REGRA DE OURO: VERSÃO ATUAL DO APP
  private readonly APP_VERSION_TAG = '9.9.4';
  private readonly VERSION_KEY = 'simbiose_installed_version';

  constructor() {
    const location = inject(PlatformLocation) as PlatformLocation;
    const backPressService = inject(BackPressService);

    this.initializeSystem();
    this.currentRoute.set(this.router.url.split('?')[0]);
    
    // --- SAFETY UNLOCK ---
    this.safetyTimeout = setTimeout(() => {
        if (this.initStatus() === 'loading') {
            console.warn('[Safety] Forçando desbloqueio da UI por timeout.');
            this.db.initialized.set(true);
            this.initStatus.set('ready');
        }
    }, 4000);
    
    this.quantumNet.conectarRede();
    this.startGlobalHeartbeat();

    this.router.events.pipe(
      filter(event => 
        event instanceof NavigationStart || 
        event instanceof NavigationEnd || 
        event instanceof NavigationCancel || 
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        if (event.url.includes('/package/new') || event.url.includes('/correspondence/new')) {
        } else {
          this.isRouteLoading.set(true);
        }
      } else if (event instanceof NavigationEnd) {
        this.isRouteLoading.set(false);
        // Atualiza a rota atual limpando query params para garantir comparação exata
        this.currentRoute.set(event.urlAfterRedirects.split('?')[0]);
      } else { 
        this.isRouteLoading.set(false);
      }
    });

    location.onPopState(() => {
      if (this.showLogoutConfirmation()) {
          this.cancelLogout();
          history.pushState(null, '');
          return;
      }
      if (this.viewingImage()) {
          this.closeImage();
          history.pushState(null, '');
          return;
      }
      if (backPressService.handleBackPress()) {
        history.pushState(null, '');
      }
    });

    effect(async () => {
        const dbReady = this.db.initialized();
        if (!dbReady || this.restorationAttempted) return;
        
        this.restorationAttempted = true; 
        if (this.safetyTimeout) clearTimeout(this.safetyTimeout);

        // --- PROTOCOLO DE RESTAURAÇÃO AUTOMÁTICA ---
        // Verifica se houve update e restaura backup se necessário
        await this.handleVersionMigration();

        // --- PROTOCOLO DE RESSURREIÇÃO (FALLBACK) ---
        // Se após a tentativa de migração o banco ainda estiver vazio, tenta de novo
        const hasData = this.db.porteiros().length > 0;
        if (!hasData) {
            try {
                console.log('[Auto-Restore] Banco vazio. Tentando restaurar backup automático...');
                const status = await this.deepSeek.tentarRessuscitacaoSistema();
                if (status === 'RESTORED') {
                    this.ui.show('Sistema restaurado automaticamente.', 'SUCCESS');
                }
            } catch(e) {
                console.warn('Auto-Restore warning:', e);
            }
        }
        
        await this.db.ensureSpecialUsers();

    }, { allowSignalWrites: true });

    effect(() => {
      if (this.db.initialized()) {
        this.initStatus.set('ready');
      }
    });
    
    // --- PWA INSTALL LISTENER ---
    window.addEventListener('beforeinstallprompt', (e: any) => {
        e.preventDefault(); // Previne o banner padrão do Chrome
        this.ui.deferredPrompt = e;
        this.ui.showInstallPrompt.set(true); // Exibe nosso banner customizado
    });
  }

  ngOnInit() {
      // --- CLEANUP FINAL ---
      localStorage.removeItem('kiosk');
      localStorage.removeItem('simbiose_kiosk_active');
      
      try {
          if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
          } else if ((document as any).webkitExitFullscreen) {
              (document as any).webkitExitFullscreen();
          }
      } catch (e) {}
  }
  
  // --- PWA ACTION ---
  async installPwaApp() {
      if (!this.ui.deferredPrompt) return;
      this.ui.deferredPrompt.prompt();
      const { outcome } = await this.ui.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
          this.ui.show('Instalando Simbiose...', 'SUCCESS');
      }
      this.ui.deferredPrompt = null;
      this.ui.showInstallPrompt.set(false);
  }
  
  dismissPwaInstall() {
      this.ui.showInstallPrompt.set(false);
  }

  // --- TOAST SWIPE LOGIC ---
  onToastTouchStart(event: TouchEvent, id: string) {
      this.activeToastSwipe.set({
          id,
          startX: event.touches[0].clientX,
          currentOffset: 0
      });
  }

  onToastTouchMove(event: TouchEvent) {
      const state = this.activeToastSwipe();
      if (!state) return;
      const currentX = event.touches[0].clientX;
      const offset = currentX - state.startX;
      this.activeToastSwipe.set({ ...state, currentOffset: offset });
      if (Math.abs(offset) > 10) event.preventDefault();
  }

  onToastTouchEnd() {
      const state = this.activeToastSwipe();
      if (!state) return;
      if (Math.abs(state.currentOffset) > 100) {
          const direction = state.currentOffset > 0 ? 1 : -1;
          this.activeToastSwipe.set({ ...state, currentOffset: direction * 500 });
          setTimeout(() => {
              this.ui.remove(state.id);
              this.activeToastSwipe.set(null);
          }, 200);
      } else {
          this.activeToastSwipe.set(null);
      }
  }

  getToastOpacity(toastId: string): number {
      const state = this.activeToastSwipe();
      if (state && state.id === toastId) {
          return Math.max(0, 1 - (Math.abs(state.currentOffset) / 300));
      }
      return 1;
  }

  reloadApp() { window.location.reload(); }
  
  closeImage() {
      this.viewingImage.set(null);
  }
  
  private async handleVersionMigration() {
      const installedVersion = localStorage.getItem(this.VERSION_KEY);
      
      if (installedVersion !== this.APP_VERSION_TAG) {
          console.log(`[Simbiose Update] Atualização detectada: ${installedVersion} -> ${this.APP_VERSION_TAG}`);
          this.ui.show('Atualizando sistema e restaurando dados...', 'INFO');
          
          // 1. SNAPSHOT DE SEGURANÇA (Antes de qualquer coisa)
          // Salva o que existe agora em um "Pre-Update Snapshot"
          if (this.db.porteiros().length > 0 || this.db.encomendas().length > 0) {
              await this.deepSeek.executarBackupTatico(true);
          }
          
          // 2. FORÇA RESTAURAÇÃO DO ÚLTIMO BACKUP VÁLIDO (Vault ou Internal)
          // Isso garante que a nova versão carregue os dados mais recentes do cofre
          // e corrige possíveis estados vazios pós-update do navegador.
          const restoreStatus = await this.deepSeek.tentarRessuscitacaoSistema();
          
          if (restoreStatus === 'RESTORED') {
              this.ui.show('Restauração pós-atualização concluída com sucesso.', 'SUCCESS');
          } else {
              // Se não conseguiu restaurar (ex: app virgem), apenas avisa
              // this.ui.show('Sistema atualizado. Pronto para uso.', 'SUCCESS');
          }

          localStorage.setItem(this.VERSION_KEY, this.APP_VERSION_TAG);
      }
  }
  
  ngOnDestroy() {
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      if (this.safetyTimeout) clearTimeout(this.safetyTimeout);
  }
  
  private startGlobalHeartbeat() {
      const pulse = () => {
          if (this.quantumNet.status() === 'CONECTADO') {
              const user = this.auth.currentUser();
              const config = this.db.appConfig();
              let nodeIdentity = config.nomeCondominio || user?.nome || 'Node Desconhecido';
              this.quantumNet.broadcastTelemetry({
                  nodeName: nodeIdentity,
                  plan: this.auth.activePlan(),
                  usageCount: this.auth.usageCount(),
                  planLimit: this.auth.getPlanLimit(),
                  neuralWeight: this.gemini.calculateNeuralWeight()
              });
          }
      };
      setTimeout(pulse, 3000); 
      this.heartbeatInterval = setInterval(pulse, 30000);
  }

  async initializeSystem() {
    this.initializeNetworkStatus();
    console.log('%c Simbiose: Boot Sequence Started.', 'color: #ff6a00');
  }

  retryInit() { this.initStatus.set('loading'); this.initializeSystem(); }
  resetRoot() { window.location.hash = '/'; window.location.search = ''; window.location.pathname = '/'; window.location.reload(); }

  async initializeNetworkStatus() {
    const updateStatus = () => {
      const online = navigator.onLine;
      if (this.ui.isOnline() !== online) {
        this.ui.isOnline.set(online);
        if (online) this.ui.show('Conexão restabelecida.', 'SUCCESS');
        else this.ui.show('Você está OFFLINE.', 'WARNING');
      }
    };
    this.ui.isOnline.set(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
  }
  
  requestLogout() { this.showLogoutConfirmation.set(true); }
  confirmLogout() { this.showLogoutConfirmation.set(false); this.auth.logout(); }
  cancelLogout() { this.showLogoutConfirmation.set(false); }
}
