import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  LucideAngularModule,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-angular";
import { CartService } from "../../../core/services/cart.service";

@Component({
  selector: "app-checkout-result",
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  template: `
    <div
      class="min-h-screen bg-slate-800 flex items-center justify-center p-4 relative overflow-hidden"
    >
      <!-- Background Effects -->
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-slate-900 to-slate-900"
      ></div>

      <div
        class="max-w-md w-full bg-slate-800/80 backdrop-blur-2xl border border-red-500/30 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(220,38,38,0.2)] p-10 text-center relative z-10 animate-in fade-in zoom-in duration-500"
      >
        <div *ngIf="status === 'success'" class="mb-8">
          <div
            class="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
          >
            <lucide-icon
              [name]="CheckCircle"
              size="48"
              class="text-emerald-500"
            ></lucide-icon>
          </div>
          <h1 class="text-4xl font-black text-white mb-3 tracking-tight">
            ¡Pago Exitoso!
          </h1>
          <p class="text-slate-400 font-medium">
            Tu pedido ha sido procesado y el pago fue aprobado correctamente.
          </p>
        </div>

        <div *ngIf="status === 'failure'" class="mb-8">
          <div
            class="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]"
          >
            <lucide-icon
              [name]="XCircle"
              size="48"
              class="text-red-500"
            ></lucide-icon>
          </div>
          <h1 class="text-4xl font-black text-white mb-3 tracking-tight">
            Pago Fallido
          </h1>
          <p class="text-slate-400 font-medium">
            Hubo un problema al procesar tu pago. Por favor, intenta nuevamente
            en unos minutos.
          </p>
        </div>

        <div *ngIf="status === 'pending'" class="mb-8">
          <div
            class="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(220,38,38,0.3)]"
          >
            <lucide-icon
              [name]="Clock"
              size="48"
              class="text-red-500"
            ></lucide-icon>
          </div>
          <h1 class="text-4xl font-black text-white mb-3 tracking-tight">
            Pago Pendiente
          </h1>
          <p class="text-slate-400 font-medium">
            Tu pago está en proceso de revisión. Te enviaremos un correo apenas
            se apruebe.
          </p>
        </div>

        <!-- Summary Box -->
        <div
          class="bg-slate-800/40 border border-red-500/20 rounded-2xl p-6 mb-10 text-left"
        >
          <div class="flex justify-between items-center text-xs mb-3">
            <span class="text-slate-500 font-bold uppercase tracking-widest"
              >Referencia de Pedido</span
            >
            <span class="text-red-500 font-black"
              >#{{ preferenceId?.split("-")?.[0] || "N/A" }}</span
            >
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-slate-500 font-bold uppercase tracking-widest"
              >Estado Mercado Pago</span
            >
            <span
              class="bg-white/10 text-white px-2 py-1 rounded text-[10px] font-black uppercase"
              >{{ mpStatus || "N/A" }}</span
            >
          </div>
        </div>

        <div
          *ngIf="status === 'pending' && paymentMethod === 'transferencia'"
          class="bg-[#020617] p-4 rounded-2xl border border-red-500/20 text-sm mb-6"
        >
          <h4 class="font-black text-white mb-2">
            Datos para la transferencia
          </h4>
          <div class="text-slate-400">
            <div class="flex justify-between">
              <span>Titular</span
              ><span class="text-white font-bold">FerreNexo (by VectraWeb)</span>
            </div>
            <div class="flex justify-between">
              <span>CUIT</span
              ><span class="text-white font-bold">30-71932456-9</span>
            </div>
            <div class="flex justify-between">
              <span>CBU</span
              ><span class="text-white font-bold">0140000101234567890123</span>
            </div>
            <div class="flex justify-between">
              <span>Alias</span
              ><span class="text-red-500 font-black">FERRE.PRO.PAGOS</span>
            </div>
          </div>
          <p class="mt-3 text-slate-400 text-xs">
            Envía el comprobante por WhatsApp indicando tu referencia
            <span class="text-white font-bold">{{ preferenceId }}</span
            >. Confirmaremos la recepción y procesaremos tu pedido.
          </p>
        </div>

        <button
          routerLink="/"
          class="w-full relative group bg-red-500 hover:bg-red-400 text-black font-black py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] flex items-center justify-center gap-3 overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          ></div>
          <span class="relative">Volver a la Tienda</span>
          <lucide-icon
            [name]="ArrowRight"
            size="20"
            class="relative group-hover:translate-x-2 transition-transform"
          ></lucide-icon>
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class CheckoutResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cartService = inject(CartService);

  status: "success" | "failure" | "pending" = "success";
  preferenceId: string | null = null;
  mpStatus: string | null = null;
  paymentMethod: string | null = null;

  CheckCircle = CheckCircle;
  XCircle = XCircle;
  Clock = Clock;
  ArrowRight = ArrowRight;

  ngOnInit() {
    this.route.url.subscribe((url) => {
      const path = url[url.length - 1].path;
      if (path === "success") this.status = "success";
      else if (path === "failure") this.status = "failure";
      else if (path === "pending") this.status = "pending";
    });

    this.route.queryParams.subscribe((params) => {
      this.preferenceId = params["preference_id"] || null;
      this.mpStatus = params["status"] || null;
      this.paymentMethod = params["payment"] || null;

      if (this.status === "success") {
        this.cartService.clearCart().subscribe();
      }
    });
  }
}
