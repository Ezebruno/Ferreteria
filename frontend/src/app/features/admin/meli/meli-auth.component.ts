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
      <div class="bg-white p-10 rounded-xl border border-concrete-200 shadow-sm relative overflow-hidden">

        <div class="absolute -top-10 -right-10 w-64 h-64 bg-amber-50 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-10 -left-10 w-64 h-64 bg-ferre-50 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 space-y-8">

          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <lucide-icon [name]="Zap" size="28" class="text-amber-600"></lucide-icon>
            </div>
            <div>
              <h1 class="text-2xl font-extrabold text-steel-900 tracking-tight" style="font-family: Sora, sans-serif;">Mercado Libre</h1>
              <p class="text-steel-500 text-sm">Sincronizá tu catálogo y recibí pedidos automáticamente</p>
            </div>
          </div>

          <div *ngIf="isLoading" class="flex items-center justify-center py-12 gap-3">
            <div class="w-5 h-5 border-2 border-concrete-200 border-t-amber-600 rounded-full animate-spin"></div>
            <span class="text-steel-500 font-medium">Verificando estado...</span>
          </div>

          <div *ngIf="isExchanging" class="flex items-center justify-center py-12 gap-3">
            <div class="w-5 h-5 border-2 border-concrete-200 border-t-green-600 rounded-full animate-spin"></div>
            <span class="text-steel-500 font-medium">Vinculando tu cuenta...</span>
          </div>

          <div *ngIf="!isLoading && !isExchanging && isLinked" class="space-y-6">
            <div class="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <lucide-icon [name]="CheckCircle2" size="20" class="text-green-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-steel-900" style="font-family: Sora, sans-serif;">Cuenta conectada</h3>
                <p class="text-green-600/80 text-sm mt-1">Tu cuenta de Mercado Libre está vinculada y activa. Los productos marcados para sincronizar se publican automáticamente.</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="bg-concrete-50 rounded-xl p-4 text-center">
                <div class="text-2xl font-extrabold text-steel-900" style="font-family: Sora, sans-serif;">✓</div>
                <div class="text-xs text-steel-500 mt-1 font-medium">Publicaciones automáticas</div>
              </div>
              <div class="bg-concrete-50 rounded-xl p-4 text-center">
                <div class="text-2xl font-extrabold text-steel-900" style="font-family: Sora, sans-serif;">✓</div>
                <div class="text-xs text-steel-500 mt-1 font-medium">Sync de precios y stock</div>
              </div>
              <div class="bg-concrete-50 rounded-xl p-4 text-center">
                <div class="text-2xl font-extrabold text-steel-900" style="font-family: Sora, sans-serif;">✓</div>
                <div class="text-xs text-steel-500 mt-1 font-medium">Pedidos integrados</div>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                (click)="linkAccount()"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-concrete-200 hover:bg-concrete-300 border border-concrete-200 text-steel-600 hover:text-steel-900 text-sm font-bold transition-all"
              >
                <lucide-icon [name]="RefreshCw" size="16"></lucide-icon>
                Reconectar cuenta
              </button>
              <a
                href="https://www.mercadolibre.com.ar/ventas"
                target="_blank"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 hover:text-amber-500 text-sm font-bold transition-all"
              >
                <lucide-icon [name]="ExternalLink" size="16"></lucide-icon>
                Ver mis ventas en MeLi
              </a>
            </div>
          </div>

          <div *ngIf="!isLoading && !isExchanging && !isLinked" class="space-y-6">
            <div class="bg-concrete-50 border border-concrete-200 rounded-xl p-6">
              <h3 class="text-base font-bold text-steel-900 mb-4" style="font-family: Sora, sans-serif;">¿Qué podés hacer al conectar?</h3>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-sm text-steel-600">
                  <span class="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-xs font-bold flex-shrink-0">1</span>
                  Publicar productos automáticamente en Mercado Libre desde el formulario del producto
                </li>
                <li class="flex items-center gap-3 text-sm text-steel-600">
                  <span class="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-xs font-bold flex-shrink-0">2</span>
                  Sincronizar precios y stock en tiempo real sin entrar a Mercado Libre
                </li>
                <li class="flex items-center gap-3 text-sm text-steel-600">
                  <span class="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-xs font-bold flex-shrink-0">3</span>
                  Recibir notificaciones de nuevos pedidos directamente en el panel
                </li>
              </ul>
            </div>

            <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
              <div class="flex items-start gap-3">
                <lucide-icon [name]="AlertCircle" size="20" class="text-amber-600 shrink-0 mt-0.5 animate-pulse"></lucide-icon>
                <div>
                  <h4 class="text-sm font-bold text-steel-900 uppercase tracking-wider text-[11px]" style="font-family: Sora, sans-serif;">¿Vincular tu cuenta propia de vendedor?</h4>
                  <p class="text-xs text-steel-500 mt-1 leading-relaxed">
                    Asegurate de iniciar sesión con la cuenta de <strong>tu negocio o ferretería</strong> en Mercado Libre. Si tenés abierta tu cuenta personal en este navegador, cerrala antes de continuar para evitar vinculaciones erróneas.
                  </p>
                </div>
              </div>
              <div class="flex gap-2 pt-2 border-t border-concrete-200">
                <a 
                  href="https://www.mercadolibre.com.ar/jms/ml/lgout" 
                  target="_blank"
                  class="flex-1 text-center py-2 px-3 rounded-xl bg-concrete-50 hover:bg-concrete-100 border border-concrete-200 text-steel-600 hover:text-steel-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  🚪 Cerrar sesión actual en MeLi
                </a>
              </div>
            </div>

            <button
              (click)="linkAccount()"
              [disabled]="isExchanging"
              class="w-full bg-amber-500 hover:bg-amber-400 text-steel-900 py-4 rounded-xl font-extrabold text-lg shadow-sm transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
              style="font-family: Sora, sans-serif;"
            >
              <lucide-icon [name]="Zap" size="22" class="group-hover:rotate-12 transition-transform"></lucide-icon>
              Conectar con Mercado Libre
            </button>

            <p class="text-center text-xs text-steel-400">
              Serás redirigido a Mercado Libre para autorizar el acceso. Es seguro y podés revocar el permiso en cualquier momento.
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