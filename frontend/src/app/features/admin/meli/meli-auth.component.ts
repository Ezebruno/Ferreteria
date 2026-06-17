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
      <div class="bg-slate-800/40 backdrop-blur-xl p-10 rounded-[2rem] border border-slate-700/50 shadow-2xl relative overflow-hidden">

        <div class="absolute -top-10 -right-10 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-10 -left-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 space-y-8">

          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
              <lucide-icon [name]="Zap" size="28" class="text-yellow-400"></lucide-icon>
            </div>
            <div>
              <h1 class="text-2xl font-black text-white tracking-tight">Mercado Libre</h1>
              <p class="text-slate-400 text-sm">Sincronizá tu catálogo y recibí pedidos automáticamente</p>
            </div>
          </div>

          <div *ngIf="isLoading" class="flex items-center justify-center py-12 gap-3">
            <div class="w-5 h-5 border-2 border-slate-600 border-t-yellow-400 rounded-full animate-spin"></div>
            <span class="text-slate-400 font-medium">Verificando estado...</span>
          </div>

          <div *ngIf="isExchanging" class="flex items-center justify-center py-12 gap-3">
            <div class="w-5 h-5 border-2 border-slate-600 border-t-green-400 rounded-full animate-spin"></div>
            <span class="text-slate-400 font-medium">Vinculando tu cuenta...</span>
          </div>

          <div *ngIf="!isLoading && !isExchanging && isLinked" class="space-y-6">
            <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <lucide-icon [name]="CheckCircle2" size="20" class="text-emerald-400"></lucide-icon>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-white">Cuenta conectada</h3>
                <p class="text-emerald-400/80 text-sm mt-1">Tu cuenta de Mercado Libre está vinculada y activa. Los productos marcados para sincronizar se publican automáticamente.</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="bg-slate-900/50 rounded-xl p-4 text-center">
                <div class="text-2xl font-black text-white">✓</div>
                <div class="text-xs text-slate-400 mt-1 font-medium">Publicaciones automáticas</div>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4 text-center">
                <div class="text-2xl font-black text-white">✓</div>
                <div class="text-xs text-slate-400 mt-1 font-medium">Sync de precios y stock</div>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4 text-center">
                <div class="text-2xl font-black text-white">✓</div>
                <div class="text-xs text-slate-400 mt-1 font-medium">Pedidos integrados</div>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                (click)="linkAccount()"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white text-sm font-bold transition-all"
              >
                <lucide-icon [name]="RefreshCw" size="16"></lucide-icon>
                Reconectar cuenta
              </button>
              <a
                href="https://www.mercadolibre.com.ar/ventas"
                target="_blank"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 text-yellow-400 hover:text-yellow-300 text-sm font-bold transition-all"
              >
                <lucide-icon [name]="ExternalLink" size="16"></lucide-icon>
                Ver mis ventas en MeLi
              </a>
            </div>
          </div>

          <div *ngIf="!isLoading && !isExchanging && !isLinked" class="space-y-6">
            <div class="bg-slate-900/60 border border-slate-700 rounded-2xl p-6">
              <h3 class="text-base font-bold text-white mb-4">¿Qué podés hacer al conectar?</h3>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-sm text-slate-300">
                  <span class="w-5 h-5 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 text-xs font-bold flex-shrink-0">1</span>
                  Publicar productos automáticamente en Mercado Libre desde el formulario del producto
                </li>
                <li class="flex items-center gap-3 text-sm text-slate-300">
                  <span class="w-5 h-5 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 text-xs font-bold flex-shrink-0">2</span>
                  Sincronizar precios y stock en tiempo real sin entrar a Mercado Libre
                </li>
                <li class="flex items-center gap-3 text-sm text-slate-300">
                  <span class="w-5 h-5 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 text-xs font-bold flex-shrink-0">3</span>
                  Recibir notificaciones de nuevos pedidos directamente en el panel
                </li>
              </ul>
            </div>

            <div class="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-5 space-y-3">
              <div class="flex items-start gap-3">
                <lucide-icon [name]="AlertCircle" size="20" class="text-yellow-400 shrink-0 mt-0.5 animate-pulse"></lucide-icon>
                <div>
                  <h4 class="text-sm font-bold text-white uppercase tracking-wider text-[11px]">¿Vincular tu cuenta propia de vendedor?</h4>
                  <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                    Asegurate de iniciar sesión con la cuenta de <strong>tu negocio o ferretería</strong> en Mercado Libre. Si tenés abierta tu cuenta personal en este navegador, cerrala antes de continuar para evitar vinculaciones erróneas.
                  </p>
                </div>
              </div>
              <div class="flex gap-2 pt-2 border-t border-white/5">
                <a 
                  href="https://www.mercadolibre.com.ar/jms/ml/lgout" 
                  target="_blank"
                  class="flex-1 text-center py-2 px-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/60 border border-slate-600/50 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  🚪 Cerrar sesión actual en MeLi
                </a>
              </div>
            </div>

            <button
              (click)="linkAccount()"
              [disabled]="isExchanging"
              class="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 py-4 rounded-2xl font-black text-lg shadow-xl shadow-yellow-400/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              <lucide-icon [name]="Zap" size="22" class="group-hover:rotate-12 transition-transform"></lucide-icon>
              Conectar con Mercado Libre
            </button>

            <p class="text-center text-xs text-slate-500">
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