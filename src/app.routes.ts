
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { UiService } from './services/ui.service';

const authGuard = () => {
  const auth = inject(AuthService);
  const router: Router = inject(Router);
  if (auth.currentUser()) {
    return true;
  }
  return router.parseUrl('/login');
};

const planGuard = () => {
    const auth = inject(AuthService);
    const router: Router = inject(Router);
    const ui = inject(UiService);

    // MUDANÇA: Guest (000000) agora é tratado como plano START e pode acessar.
    // A verificação de limites é feita no momento da ação (Salvar).
    if (auth.hasActiveFeatureAccess()) {
        return true;
    }
    
    ui.show('Funcionalidade bloqueada. Ative um plano.', 'WARNING');
    return router.createUrlTree(['/admin'], { queryParams: { tab: 'quantum' } });
};

// MUDANÇA: Guardião relaxado para permitir navegação do Guest
const guestBlockGuard = () => {
    // Guest tem acesso livre ao Dashboard para testar o sistema (Limite de 25 itens)
    return true;
};

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, guestBlockGuard] 
  },
  { 
    path: 'package/new', 
    loadComponent: () => import('./components/package-form/package-form.component').then(m => m.PackageFormComponent), 
    canActivate: [authGuard, planGuard] 
  },
  { 
    path: 'correspondence/new', 
    loadComponent: () => import('./components/package-form/package-form.component').then(m => m.PackageFormComponent), 
    canActivate: [authGuard, planGuard] 
  },
  { 
    path: 'package/:id', 
    loadComponent: () => import('./components/package-form/package-form.component').then(m => m.PackageFormComponent) 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminHubComponent), 
    canActivate: [authGuard] 
  },
  {
    path: 'manual',
    loadComponent: () => import('./components/manual/manual.component').then(m => m.ManualComponent),
    canActivate: [authGuard, guestBlockGuard]
  },
  {
    path: 'novo-protocolo',
    loadComponent: () => import('./components/novo-protocolo/novo-protocolo.component').then(m => m.NovoProtocoloComponent),
    canActivate: [authGuard]
  },
  {
    path: 'secure-download/:id',
    loadComponent: () => import('./components/secure-download/secure-download.component').then(m => m.SecureDownloadComponent)
  },
  // Rota de Exemplo da Arquitetura
  {
    path: 'example',
    loadComponent: () => import('./app/components/example/example.component').then(m => m.ExampleComponent)
  }
];
