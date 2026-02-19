
import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';
}

@Injectable({
  providedIn: 'root'
})
export class UiService {
  // LOGO MASTER V2: RÉPLICA EXATA DA AGENDA K4 (Couro Escuro + Detalhes Dourados)
  // Substitui a logo antiga por um SVG vetorial que imita o livro físico da tela de login.
  public readonly APP_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImxlYXRoZXJCb2R5IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNmI0MjM1Ii8+PHN0b3Agb2ZZnNldD0iNTAlIiBzdG9wLWNvbG9yPSIjM2UyMzE4Ii8+PHN0b3Agb2ZZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFhMGIwNiIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJnb2xkQWNjZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjJlNmJmIi8+PHN0b3Agb2ZZnNldD0iNTAlIiBzdG9wLWNvbG9yPSIjZDRhZjM3Ii8+PHN0b3Agb2ZZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2FhOGMyYyIvPjwvbGluZWFyR3JhZGllbnQ+PGZpbHRlciBpZD0ibGVhdGhlckdyYWluIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44IiBudW1PY3RhdmVzYz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjxmZUNvbG9yTWF0cml4IHR5cGU9InNhdHVyYXRlIiB2YWx1ZXM9IjAuMSIvPjxmZUJsZW5kIG1vZGU9Im11bHRpcGx5IiBpbjI9IlNvdXJjZUdyYXBoaWMiLz48L2ZpbHRlcj48L2RlZnM+PCEtLSBDYXBhIGRvIExpdnJvIC0tPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQ3MiIgaGVpZ2h0PSI0NzIiIHJ4PSI0MCIgZmlsbD0idXJsKCNsZWF0aGVyQm9keSkiIGZpbHRlcj0idXJsKCNsZWF0aGVyR3JhaW4pIiBzdHJva2U9IiMzZTIzMTgiIHN0cm9rZS13aWR0aD0iNCIvPjwhLS0gQ29zdHVyYSAtLT48cmVjdCB4PSI1MCIgeT0iNTAiIHdpZHRoPSI0MTIiIGhlaWdodD0iNDEyIiByeD0iMjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhhNmE1YyIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtZGFzaGFycmF5PSIxNSAxMCIgb3BhY2l0eT0iMC42Ii8+PCEtLSBMb2dvIFNpbmV0YSAvIFMgLS0+PHBhdGggZD0iTTI1NiAxMzAgQyAyMDAgMTMwLCAxODAgMTgwLCAxODAgMjIwIEMgMTgwIDI4MCwgMjMwIDI4MCwgMjMwIDMyMCBDIDIzMCAzNTAsIDIwMCAzNjAsIDE4MCAzNjAgTSAyNTYgMTMwIEMgMzEyIDEzMCwgMzMyIDE4MCwgMzMyIDIyMCBDIDMzMiAyODAsIDI4MiAyODAsIDI4MiAzMjAgQyAyODIgMzUwLCAzMTIgMzYwLCAzMzIgMzYwIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZ29sZEFjY2VudCkiIHN0cm9rZS13aWR0aD0iMjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZmlsdGVyPSJkcm9wLXNoYWRvdygycHggNHB4IDZweCByZ2JhKDAsMCwwLDAuNSkpIi8+PCEtLSBEZXRhbGhlIENlbnRyYWwgLS0+PGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSIyMCIgZmlsbD0idXJsKCNnb2xkQWNjZW50KSIgc2hhZG93PSJpbnNldCAwIDAgMTBweCBibGFjayIvPjwvc3ZnPg==";

  toasts = signal<Toast[]>([]);
  isOnline = signal(navigator.onLine);
  
  // Controls global header visibility
  isFullscreen = signal(false);
  
  // SINALIZADOR GLOBAL: Indica se alguma visualização de imagem está ativa
  isImageViewerOpen = signal(false);
  
  // SINALIZADOR GLOBAL: Indica se a tela de assinatura está ativa (Oculta cabeçalho)
  isSignatureMode = signal(false);
  
  // Armazena a imagem atual para o visualizador global
  currentFullscreenImage = signal<string | null>(null);
  
  restoreCheckTrigger = signal(false);
  pushPermissionStatus = signal<NotificationPermission>('default');
  
  // --- PWA INSTALL STATE ---
  public showInstallPrompt = signal(false);
  public deferredPrompt: any = null;
  
  constructor() {
      if ('Notification' in window) {
          this.pushPermissionStatus.set(Notification.permission);
      }
      localStorage.removeItem('simbiose_kiosk_active');
  }
  
  // --- ROTATION & ORIENTATION CONTROL ---
  public async lockOrientationLandscape() {
      try {
          // A maioria dos navegadores exige Fullscreen para travar a orientação
          if (!document.fullscreenElement) {
              await document.documentElement.requestFullscreen().catch(() => {});
          }
          
          if (screen.orientation && (screen.orientation as any).lock) {
              await (screen.orientation as any).lock('landscape').catch((e: any) => console.warn('Orientation lock failed:', e));
          }
      } catch (e) {
          console.warn('Rotation not supported', e);
      }
  }

  public async unlockOrientation() {
      try {
          if (screen.orientation && (screen.orientation as any).unlock) {
              (screen.orientation as any).unlock();
          }
          // Sai do fullscreen se não estivermos no modo Kiosk forçado
          if (document.fullscreenElement && !localStorage.getItem('simbiose_kiosk_active')) {
              await document.exitFullscreen().catch(() => {});
          }
      } catch (e) {}
  }

  // --- GLOBAL IMAGE VIEWER ---
  public openImage(base64: string) {
      if (!base64) return;
      // Garante que não duplique prefixos
      const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      this.currentFullscreenImage.set(cleanBase64);
      this.isImageViewerOpen.set(true);
  }

  public closeImage() {
      this.currentFullscreenImage.set(null);
      this.isImageViewerOpen.set(false);
  }
  
  public async requestPushPermission() {
      if (!('Notification' in window)) return;
      const permission = await Notification.requestPermission();
      this.pushPermissionStatus.set(permission);
      if (permission === 'granted') {
          this.showNativeNotification('Notificações Ativadas', 'O Sistema Simbiose agora pode te alertar sobre eventos importantes.');
      }
  }

  public showNativeNotification(title: string, body: string, icon?: string) {
      if (this.pushPermissionStatus() === 'granted') {
          try {
              if (navigator.serviceWorker && navigator.serviceWorker.ready) {
                  navigator.serviceWorker.ready.then(registration => {
                      registration.showNotification(title, {
                          body,
                          icon: icon || this.APP_LOGO,
                          vibrate: [200, 100, 200],
                          tag: 'simbiose-alert'
                      } as any);
                  });
              } else {
                  new Notification(title, { body, icon: icon || this.APP_LOGO });
              }
          } catch(e) { console.warn('Native Push Failed:', e); }
      }
  }
  
  show(message: string, type: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING' = 'INFO', duration: number = 4000) {
    const id = crypto.randomUUID();
    const toast: Toast = { id, message, type };
    this.toasts.update(current => [...current, toast]);
    setTimeout(() => { this.remove(id); }, duration);
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  public vibrate(pattern: number | number[]): void {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }
  
  public enterFullscreen() {
    localStorage.setItem('simbiose_kiosk_active', 'true');
    this.isFullscreen.set(true);
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
  }

  public exitFullscreen() {
    this.isFullscreen.set(false);
    localStorage.removeItem('simbiose_kiosk_active');
    const doc = document as any;
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      if (doc.exitFullscreen) doc.exitFullscreen().catch((err: any) => console.warn('Exit blocked:', err));
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
    }
  }
  
  public forceKioskUI() { this.isFullscreen.set(true); }

  playTone(type: 'SUCCESS' | 'ERROR' | 'SHUTTER' | 'URGENT') {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'SUCCESS') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime); 
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.6);
        osc.start(); osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'SHUTTER') {
        osc.type = 'square'; osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'URGENT') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
        this.vibrate([100, 50, 100]);
      }
    } catch (e) {}
  }
}
