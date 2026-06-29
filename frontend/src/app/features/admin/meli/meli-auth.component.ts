import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "src/app/core/services/api.service";
import { LucideAngularModule, Zap, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from "lucide-angular";

@Component({
  selector: "app-meli-auth",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="max-w-2xl mx-auto py-12">
      <div class="card-industrial p-8 relative overflow-hidden">
        <div class="relative z-10 space-y-8">

          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-lg bg-safety-yellow/20 border border-safety-yellow/30 flex items-center justify-center flex-shrink-0">
              <lucide-icon [name]="Zap" size="28" class="text-safety-yellow"></lucide-icon>
            </div>
            <div>
              <h1 class="text-2xl font-extrabold text-white uppercase tracking-wider" style="font-family: Sora, sans-serif;">Mercado Libre</h1>
              <p class="text-steel-400 text-sm">Sincroniza tu catalogo y recibi pedidos automaticamente</p>
            </div>
          </div>

          <div *ngIf="isLoading" class="flex items-center justify-center py-12 gap-3">
            <div class="w-5 h-5 border-2 border-[#2a2f38] border-t-amber-600 rounded-full animate-spin"></div>
            <span class="text-steel-400 font-medium">Verificando estado...</span>
          </div>

          <div *ngIf="isExchanging" class="flex items-center justify-center py-12 gap-3">
            <div class="w-5 h-5 border-2 border-[#2a2f38] border-t-green-600 rounded-full animate-spin"></div>
            <span class="text-steel-400 font-medium">Vinculando tu cuenta...</span>
          </div>

          <div *ngIf="!isLoading && !isExchanging && isLinked" class="space-y-6">
            <div class="rounded-lg p-6 flex items-start gap-4" style="background: #22c55e10; border: 2px solid #22c55e30; border-left: 4px solid #22c55e;">
              <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <lucide-icon [name]="CheckCircle2" size="20" class="text-green-400"></lucide-icon>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-white uppercase tracking-wider" style="font-family: Sora, sans-serif;">Cuenta conectada</h3>
                <p class="text-green-400/80 text-sm mt-1">Tu cuenta de Mercado Libre esta vinculada y activa. Los productos marcados para sincronizar se publican automaticamente.</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="bg-[#13161c] rounded-lg p-4 text-center border border-[#2a2f38]">
                <div class="text-2xl font-extrabold text-white" style="font-family: Sora, sans-serif;">&#10003;</div>
                <div class="text-[10px] text-steel-400 mt-1 font-bold uppercase tracking-wider">Publicaciones automaticas</div>
              </div>
              <div class="bg-[#13161c] rounded-lg p-4 text-center border border-[#2a2f38]">
                <div class="text-2xl font-extrabold text-white" style="font-family: Sora, sans-serif;">&#10003;</div>
                <div class="text-[10px] text-steel-400 mt-1 font-bold uppercase tracking-wider">Sync de precios y stock</div>
              </div>
              <div class="bg-[#13161c] rounded-lg p-4 text-center border border-[#2a2f38]">
                <div class="text-2xl font-extrabold text-white" style="font-family: Sora, sans-serif;">&#10003;</div>
                <div class="text-[10px] text-steel-400 mt-1 font-bold uppercase tracking-wider">Pedidos integrados</div>
              </div>
            </div>

            <div class="flex gap-3">
              <button (click)="linkAccount()" class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#3a404a] hover:bg-[#3a404a] border border-[#2a2f38] text-steel-500 hover:text-white text-sm font-bold transition-all">
                <lucide-icon [name]="RefreshCw" size="16"></lucide-icon>
                Reconectar cuenta
              </button>
              <a href="https://www.mercadolibre.com.ar/ventas" target="_blank" class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-safety-yellow/10 hover:bg-safety-yellow/20 border border-safety-yellow/30 text-amber-700 text-sm font-bold transition-all">
                <lucide-icon [name]="ExternalLink" size="16"></lucide-icon>
                Ver mis ventas en MeLi
              </a>
            </div>
          </div>

          <div *ngIf="!isLoading && !isExchanging && !isLinked" class="space-y-6">
            <div class="bg-[#13161c] border border-[#2a2f38] rounded-lg p-6">
              <h3 class="text-base font-bold text-white mb-4 uppercase tracking-wider" style="font-family: Sora, sans-serif;">Que podes hacer al conectar?</h3>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-sm text-steel-500">
                  <span class="w-5 h-5 rounded-full bg-safety-yellow/20 border border-safety-yellow/30 flex items-center justify-center text-amber-700 text-[10px] font-bold flex-shrink-0">1</span>
                  Publicar productos automaticamente en Mercado Libre desde el formulario del producto
                </li>
                <li class="flex items-center gap-3 text-sm text-steel-500">
                  <span class="w-5 h-5 rounded-full bg-safety-yellow/20 border border-safety-yellow/30 flex items-center justify-center text-amber-700 text-[10px] font-bold flex-shrink-0">2</span>
                  Sincronizar precios y stock en tiempo real sin entrar a Mercado Libre
                </li>
                <li class="flex items-center gap-3 text-sm text-steel-500">
                  <span class="w-5 h-5 rounded-full bg-safety-yellow/20 border border-safety-yellow/30 flex items-center justify-center text-amber-700 text-[10px] font-bold flex-shrink-0">3</span>
                  Recibir notificaciones de nuevos pedidos directamente en el panel
                </li>
              </ul>
            </div>

            <div class="p-5 space-y-3" style="background: #FFC10710; border: 2px solid #FFC107; border-left: 4px solid #d45e08; border-radius: 0.375rem;">
              <div class="flex items-start gap-3">
                <lucide-icon [name]="AlertCircle" size="20" class="text-amber-700 shrink-0 mt-0.5 animate-pulse"></lucide-icon>
                <div>
                  <h4 class="text-[11px] font-bold text-white uppercase tracking-wider" style="font-family: Sora, sans-serif;">Vincular tu cuenta propia de vendedor?</h4>
                  <p class="text-xs text-steel-400 mt-1 leading-relaxed">
                    Asegurate de iniciar sesion con la cuenta de <strong>tu negocio o ferreteria</strong> en Mercado Libre. Si tenes abierta tu cuenta personal en este navegador, cerrala antes de continuar.
                  </p>
                </div>
              </div>
              <div class="flex gap-2 pt-2" style="border-top: 2px solid #2a2f38;">
                <a href="https://www.mercadolibre.com.ar/jms/ml/lgout" target="_blank" class="flex-1 text-center py-2 px-3 rounded-lg bg-[#13161c] hover:bg-[#2a2f38] border border-[#2a2f38] text-steel-500 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                  Cerrar sesion actual en MeLi
                </a>
              </div>
            </div>

            <button
              (click)="linkAccount()"
              [disabled]="isExchanging"
              class="w-full bg-amber-500 hover:bg-amber-400 text-white py-3.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-3 group disabled:opacity-50 uppercase tracking-wider"
            >
              <lucide-icon [name]="Zap" size="20" class="group-hover:rotate-12 transition-transform"></lucide-icon>
              Conectar con Mercado Libre
            </button>

            <p class="text-center text-xs text-steel-500">
              Seras redirigido a Mercado Libre para autorizar el acceso. Es seguro y podes revocar el permiso en cualquier momento.
            </p>
          </div>

        </div>
      </div>
    </div>
  `
})
export class MeliAuthComponent implements OnInit {
  api = inject(ApiService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  Zap = Zap;
  CheckCircle2 = CheckCircle2;
  AlertCircle = AlertCircle;
  RefreshCw = RefreshCw;
  ExternalLink = ExternalLink;

  isLoading = true;
  isLinked = false;
  isExchanging = false;
  authUrl = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.isLoading = false;
        this.isExchanging = true;
        this.exchangeCode(params['code']);
      } else {
        this.checkStatus();
      }
    });
  }

  checkStatus() {
    this.isLoading = true;
    this.api.get<any>('/integrations/meli/auth-url/').subscribe({
      next: (res) => {
        this.isLinked = res.is_linked;
        this.authUrl = res.auth_url;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // CORRECCIÓN PRINCIPAL: Si por carrera de asincronismo authUrl está vacía, la va a buscar de inmediato
  linkAccount() {
    if (this.authUrl && this.authUrl !== '#error-no-config') {
      window.location.href = this.authUrl;
    } else {
      // Evitamos el bloqueo: hacemos el fetch explícito al hacer clic por si acaso
      this.isLoading = true;
      this.api.get<any>('/integrations/meli/auth-url/').subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.auth_url && res.auth_url !== '#error-no-config') {
            window.location.href = res.auth_url;
          } else {
            alert('Error: Las credenciales MELI_CLIENT_ID o MELI_REDIRECT_URI no están bien configuradas en el .env del servidor master.');
          }
        },
        error: () => {
          this.isLoading = false;
          alert('Error de comunicación con el backend al generar la URL.');
        }
      });
    }
  }

  exchangeCode(code: string) {
    this.api.post<any>('/integrations/meli/authorize/', { code }).subscribe({
      next: () => {
        this.isExchanging = false;
        this.isLinked = true;
        // Limpiamos los query params de la URL de navegación para dejar la UI limpia
        this.router.navigate([], { queryParams: { code: null }, queryParamsHandling: 'merge' });
      },
      error: (err) => {
        this.isExchanging = false;
        alert('Error al vincular cuenta: ' + (err.error?.error || 'Intenta de nuevo'));
        this.router.navigate(['/admin/meli']);
      }
    });
  }
}