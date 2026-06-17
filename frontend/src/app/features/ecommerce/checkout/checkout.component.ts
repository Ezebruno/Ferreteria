import { Component, OnInit, inject } from "@angular/core";
import { ApiService } from "../../../core/services/api.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { CartService, CartItem } from "../../../core/services/cart.service";
import {
  LucideAngularModule,
  ArrowLeft,
  CheckCircle2,
  Mail,
  User,
  MapPin,
  CreditCard,
  Building2,
  Phone,
  Check,
  Loader2,
} from "lucide-angular";

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div
      class="min-h-screen bg-slate-800 flex flex-col justify-start pt-28 pb-16"
    >
      <div class="w-full max-w-5xl mx-auto px-4">
        <!-- Back to Cart Button -->
        <div class="mb-8">
          <button
            (click)="goBack()"
            class="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold transition-colors"
          >
            <lucide-icon [name]="ArrowLeft" size="20"></lucide-icon>
            Volver al Carrito
          </button>
        </div>

        <!-- Main Content -->
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Left Column: Steps -->
          <div class="md:col-span-2 space-y-6">
            <!-- Step progress indicator -->
            <div
              class="flex items-center justify-between mb-12 max-w-xl mx-auto px-2 relative"
            >
              <!-- Step 1 -->
              <div class="relative flex justify-center">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-black transition-all relative z-20"
                  [ngClass]="
                    currentStep === 1
                      ? 'bg-red-500 text-black shadow-[0_0_15px_rgba(220,38,38,0.5)] border-2 border-red-500'
                      : 'bg-transparent border-2 border-red-500 text-red-500 shadow-[0_0_10px_rgba(220,38,38,0.2)]'
                  "
                >
                  <lucide-icon
                    *ngIf="currentStep > 1"
                    [name]="Check"
                    size="20"
                    strokeWidth="3"
                  ></lucide-icon>
                  <span *ngIf="currentStep <= 1">1</span>
                </div>
                <span
                  class="absolute top-12 whitespace-nowrap text-xs font-bold"
                  [ngClass]="
                    currentStep >= 1 ? 'text-red-500' : 'text-slate-600'
                  "
                  >Contacto</span
                >
              </div>

              <!-- Line 1-2 -->
              <div
                class="flex-1 h-1 rounded-full transition-all mx-3"
                [ngClass]="currentStep >= 2 ? 'bg-red-500' : 'bg-slate-800'"
              ></div>

              <!-- Step 2 -->
              <div class="relative flex justify-center">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-black transition-all relative z-20"
                  [ngClass]="
                    currentStep === 2
                      ? 'bg-red-500 text-black shadow-[0_0_15px_rgba(220,38,38,0.5)] border-2 border-red-500'
                      : currentStep > 2
                        ? 'bg-transparent border-2 border-red-500 text-red-500 shadow-[0_0_10px_rgba(220,38,38,0.2)]'
                        : 'bg-transparent border-2 border-slate-700 text-slate-500'
                  "
                >
                  <lucide-icon
                    *ngIf="currentStep > 2"
                    [name]="Check"
                    size="20"
                    strokeWidth="3"
                  ></lucide-icon>
                  <span *ngIf="currentStep <= 2">2</span>
                </div>
                <span
                  class="absolute top-12 whitespace-nowrap text-xs font-bold"
                  [ngClass]="
                    currentStep >= 2 ? 'text-red-500' : 'text-slate-600'
                  "
                  >Envío</span
                >
              </div>

              <!-- Line 2-3 -->
              <div
                class="flex-1 h-1 rounded-full transition-all mx-3"
                [ngClass]="currentStep >= 3 ? 'bg-red-500' : 'bg-slate-800'"
              ></div>

              <!-- Step 3 -->
              <div class="relative flex justify-center">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-black transition-all relative z-20"
                  [ngClass]="
                    currentStep === 3
                      ? 'bg-red-500 text-black shadow-[0_0_15px_rgba(220,38,38,0.5)] border-2 border-red-500'
                      : 'bg-transparent border-2 border-slate-700 text-slate-500'
                  "
                >
                  <span *ngIf="currentStep <= 3">3</span>
                </div>
                <span
                  class="absolute top-12 whitespace-nowrap text-xs font-bold"
                  [ngClass]="
                    currentStep >= 3 ? 'text-red-500' : 'text-slate-600'
                  "
                  >Pago</span
                >
              </div>
            </div>

            <!-- Step 1: Contacto (Guest Checkout) -->
            <div
              class="bg-slate-800 border border-red-500/20 rounded-3xl p-8 shadow-xl"
              [class.hidden]="currentStep !== 1"
            >
              <h2
                class="text-2xl font-black text-white mb-6 flex items-center gap-3"
              >
                <lucide-icon [name]="Mail" class="text-red-500"></lucide-icon>
                Datos de Contacto
              </h2>
              <div class="space-y-4">
                <div>
                  <label
                    class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2"
                    >Correo Electrónico</label
                  >
                  <input
                    type="email"
                    [(ngModel)]="formData.email"
                    placeholder="ejemplo@correo.com"
                    class="w-full bg-[#020617] border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium"
                  />
                </div>

                <div
                  class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-sm text-slate-300"
                >
                  <lucide-icon
                    [name]="Check"
                    size="20"
                    class="text-red-500 flex-shrink-0 mt-0.5"
                    strokeWidth="3"
                  ></lucide-icon>
                  <p>
                    Puedes comprar sin cuenta. Usaremos tu email solo para
                    enviarte el comprobante y seguimiento del pedido.
                  </p>
                </div>

                <button
                  (click)="nextStep()"
                  [disabled]="!formData.email"
                  class="w-full mt-6 bg-red-500 text-black font-black py-4 rounded-xl hover:bg-red-400 transition-all disabled:opacity-50 disabled:hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] disabled:shadow-none"
                >
                  Continuar
                </button>
              </div>
            </div>

            <!-- Step 2: Envío / Facturación -->
            <div
              class="bg-slate-800 border border-red-500/20 rounded-3xl p-8 shadow-xl"
              [class.hidden]="currentStep !== 2"
            >
              <div class="flex items-center justify-between mb-6">
                <h2
                  class="text-2xl font-black text-white flex items-center gap-3"
                >
                  <lucide-icon [name]="User" class="text-red-500"></lucide-icon>
                  Datos de Facturación
                </h2>
                <button
                  (click)="setStep(1)"
                  class="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest"
                >
                  Cambiar Email
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2"
                    >Nombre / Razón Social</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="formData.name"
                    class="w-full bg-[#020617] border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label
                    class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2"
                    >DNI o CUIT (Para Factura A)</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="formData.cuit"
                    class="w-full bg-[#020617] border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div class="md:col-span-2">
                  <label
                    class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2"
                    >Teléfono de contacto</label
                  >
                  <div
                    class="flex items-center w-full bg-[#020617] border border-red-500/30 rounded-xl focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50 transition-all overflow-hidden"
                  >
                    <lucide-icon
                      [name]="Phone"
                      size="18"
                      class="text-slate-500 ml-4 mr-3 pointer-events-none"
                    ></lucide-icon>
                    <input
                      type="tel"
                      [(ngModel)]="formData.phone"
                      class="flex-1 bg-transparent py-3 pr-4 text-white font-medium focus:outline-none"
                    />
                  </div>
                </div>
                <div class="md:col-span-2 mt-4 pt-4 border-t border-red-500/20">
                  <h3
                    class="text-sm font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2"
                  >
                    <lucide-icon
                      [name]="MapPin"
                      size="16"
                      class="text-red-500"
                    ></lucide-icon>
                    Donde enviamos
                  </h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2 relative">
                      <div class="relative">
                        <input
                          type="text"
                          [(ngModel)]="formData.address"
                          (input)="onAddressInput()"
                          placeholder="Calle y número"
                          class="w-full bg-[#020617] border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 pr-10"
                        />
                        <div
                          *ngIf="isSearchingAddress"
                          class="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <lucide-icon
                            [name]="Loader2"
                            size="18"
                            class="animate-spin text-red-500"
                          ></lucide-icon>
                        </div>
                      </div>

                      <!-- Address Suggestions Dropdown -->
                      <div
                        *ngIf="addressSuggestions.length > 0"
                        class="absolute left-0 right-0 top-full mt-2 bg-slate-900 border-2 border-red-500 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4"
                      >
                        <div
                          class="px-6 py-4 bg-slate-800 border-b border-white/10 text-xs font-black text-slate-400 uppercase tracking-widest flex justify-between items-center"
                        >
                          <span>Resultados Encontrados</span>
                          <span class="text-red-500"
                            >¿No aparece? Agrega la ciudad</span
                          >
                        </div>
                        <button
                          *ngFor="let suggestion of addressSuggestions"
                          (click)="selectSuggestion(suggestion)"
                          class="w-full text-left px-6 py-5 hover:bg-red-500/10 hover:text-red-400 transition-all border-b border-white/5 last:border-0 flex flex-col gap-1.5 group"
                        >
                          <span
                            class="text-lg font-black text-white group-hover:text-red-400 transition-colors"
                          >
                            {{ formatAddressTitle(suggestion) }}
                          </span>
                          <span
                            class="text-xs font-medium text-slate-400 group-hover:text-slate-300"
                          >
                            {{ formatAddressSubtitle(suggestion) }}
                          </span>
                        </button>
                        <div class="p-4 bg-slate-800/30 text-center">
                          <button
                            (click)="addressSuggestions = []"
                            class="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-tighter"
                          >
                            Cerrar sugerencias
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="col-span-2">
                      <input
                        type="text"
                        [(ngModel)]="formData.notes"
                        placeholder="Depto, timbre, o indicaciones (Opcional)"
                        class="w-full bg-[#020617] border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <input
                      type="text"
                      [(ngModel)]="formData.city"
                      placeholder="Ciudad"
                      class="w-full bg-[#020617] border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      [(ngModel)]="formData.province"
                      placeholder="Provincia"
                      class="w-full bg-[#020617] border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    />
                    <div class="col-span-2">
                      <input
                        type="text"
                        [(ngModel)]="formData.zip"
                        placeholder="Código Postal"
                        class="w-full bg-[#020617] border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Checkbox de Registro Transparente -->
              <label
                class="flex items-start gap-3 mt-8 p-4 bg-white/5 border border-red-500/30 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div
                  class="relative flex items-center justify-center mt-0.5 w-6 h-6"
                >
                  <!-- Invisible Real Input -->
                  <input
                    type="checkbox"
                    [(ngModel)]="formData.saveData"
                    class="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                  />

                  <!-- Visual when UNCHECKED -->
                  <div
                    *ngIf="!formData.saveData"
                    class="w-5 h-5 border-2 border-slate-500 rounded-full bg-slate-800/50 transition-colors pointer-events-none relative z-10"
                  ></div>

                  <!-- Visual when CHECKED -->
                  <lucide-icon
                    *ngIf="formData.saveData"
                    [name]="CheckCircle2"
                    size="24"
                    class="text-red-500 transition-all pointer-events-none relative z-10"
                    strokeWidth="2"
                  ></lucide-icon>
                </div>
                <div>
                  <span class="block text-sm font-bold text-white mb-1"
                    >Guardar mis datos y crear una cuenta</span
                  >
                  <span class="block text-xs text-slate-400 font-medium"
                    >Crea una cuenta rápidamente para ver tu historial de
                    facturas y acelerar tu próxima compra.</span
                  >
                </div>
              </label>

              <button
                (click)="nextStep()"
                [disabled]="
                  !formData.name || !formData.address || !formData.phone
                "
                class="w-full mt-6 bg-red-500 text-black font-black py-4 rounded-xl hover:bg-red-400 transition-all disabled:opacity-50 disabled:hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              >
                Continuar al Pago
              </button>
            </div>

            <!-- Step 3: Payment -->
            <div
              class="bg-slate-800 border border-red-500/20 rounded-3xl p-8 shadow-xl"
              [class.hidden]="currentStep !== 3"
            >
              <div class="flex items-center justify-between mb-6">
                <h2
                  class="text-2xl font-black text-white flex items-center gap-3"
                >
                  <lucide-icon
                    [name]="CreditCard"
                    class="text-red-500"
                  ></lucide-icon>
                  Medio de Pago
                </h2>
                <button
                  (click)="setStep(2)"
                  class="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest"
                >
                  Cambiar Datos
                </button>
              </div>

              <div class="space-y-3">
                <div
                  *ngIf="tenantInfo?.has_mp"
                  (click)="selectPayment('mercadopago')"
                  class="p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4"
                  [ngClass]="
                    paymentMethod === 'mercadopago'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-red-500/30 bg-[#020617] hover:bg-white/5'
                  "
                >
                  <div
                    class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl"
                  >
                    Ⓜ️
                  </div>
                  <div>
                    <h3 class="font-bold text-white">Mercado Pago</h3>
                    <p class="text-xs text-slate-400">
                      Tarjetas de crédito, débito y dinero en cuenta
                    </p>
                  </div>
                  <div class="ml-auto">
                    <div
                      class="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center"
                    >
                      <div
                        class="w-3 h-3 rounded-full bg-blue-500"
                        *ngIf="paymentMethod === 'mercadopago'"
                      ></div>
                    </div>
                  </div>
                </div>

                <div
                  *ngIf="tenantInfo?.bank_cvu || tenantInfo?.bank_alias"
                  (click)="selectPayment('transferencia')"
                  class="p-4 rounded-xl border cursor-pointer transition-all flex flex-col"
                  [ngClass]="
                    paymentMethod === 'transferencia'
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-red-500/30 bg-[#020617] hover:bg-white/5'
                  "
                >
                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-xl"
                    >
                      🏦
                    </div>
                    <div>
                      <h3 class="font-bold text-white">
                        Transferencia Bancaria
                      </h3>
                      <p class="text-xs text-slate-400">
                        5% de Descuento (Pago manual)
                      </p>
                    </div>
                    <div class="ml-auto">
                      <div
                        class="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center transition-colors"
                        [ngClass]="
                          paymentMethod === 'transferencia'
                            ? 'border-red-500'
                            : ''
                        "
                      >
                        <div
                          class="w-3 h-3 rounded-full bg-red-500 transition-all scale-0"
                          [class.scale-100]="paymentMethod === 'transferencia'"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div
                    *ngIf="paymentMethod === 'transferencia'"
                    class="mt-4 pt-4 border-t border-red-500/20 text-sm animate-fade-in"
                  >
                    <p class="text-slate-300 font-medium mb-3">
                      Transfiere el monto exacto a la siguiente cuenta:
                    </p>
                    <div
                      class="bg-[#020617] p-4 rounded-lg border border-red-500/20 space-y-2"
                    >
                      <div class="flex justify-between items-center">
                        <span class="text-slate-400">Titular</span
                        ><span class="text-white font-bold">{{ tenantInfo?.name || 'FerreNexo' }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-slate-400">CUIT</span
                        ><span class="text-white font-bold">{{ tenantInfo?.afip_cuit || '...' }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-slate-400">CBU / CVU</span
                        ><span class="text-white font-bold"
                          >{{ tenantInfo?.bank_cvu || '...' }}</span
                        >
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-slate-400">Alias</span
                        ><span class="text-red-500 font-black"
                          >{{ tenantInfo?.bank_alias || '...' }}</span
                        >
                      </div>
                    </div>
                    <p class="mt-3 text-xs text-slate-400">
                      Una vez finalizado,
                      <span class="text-red-500 font-bold"
                        >envía el comprobante</span
                      >
                      por WhatsApp indicando tu código de pedido. Validaremos el
                      pago para liberar el envío.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Main Action Buttons -->
              <div class="flex flex-col gap-3 mt-8">
                <button
                  (click)="processPayment()"
                  [disabled]="!paymentMethod || isProcessing"
                  class="w-full bg-red-500 text-black font-black py-4 rounded-xl hover:bg-red-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-[0_0_25px_rgba(220,38,38,0.3)]"
                >
                  <lucide-icon
                    *ngIf="isProcessing"
                    [name]="Loader2"
                    size="24"
                    class="animate-spin"
                  ></lucide-icon>
                  <span *ngIf="paymentMethod === 'transferencia'">{{
                    isProcessing
                      ? "Procesando..."
                      : "YA REALICÉ LA TRANSFERENCIA"
                  }}</span>
                  <span
                    *ngIf="
                      paymentMethod !== 'transferencia' && paymentMethod !== ''
                    "
                    >{{
                      isProcessing
                        ? "Procesando..."
                        : "PAGAR $" + getFinalTotal()
                    }}</span
                  >
                  <span *ngIf="paymentMethod === '' && (tenantInfo?.has_mp || tenantInfo?.bank_cvu)">SELECCIONAR PAGO</span>
                  <span *ngIf="!tenantInfo?.has_mp && !tenantInfo?.bank_cvu && !tenantInfo?.bank_alias" class="text-sm">NINGÚN MEDIO DE PAGO DISPONIBLE</span>
                </button>

                <button
                  *ngIf="paymentMethod === 'transferencia' && !isProcessing"
                  (click)="goHome()"
                  class="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all"
                >
                  VOLVER AL INICIO
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column: Order Summary Mini -->
          <div>
            <div
              class="bg-slate-800 border border-red-500/30 rounded-3xl p-6 sticky top-24"
            >
              <h3
                class="font-black text-white mb-4 uppercase tracking-widest text-sm"
              >
                Resumen
              </h3>
              <div class="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
                <div *ngFor="let item of items" class="flex gap-3">
                  <div
                    class="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                  >
                    <img
                      *ngIf="item.image"
                      [src]="item.image"
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-slate-300 line-clamp-1">
                      {{ item.product_name }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ item.quantity }} x \${{ item.price }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="border-t border-red-500/30 pt-4 space-y-2 mt-4">
                <div
                  class="flex justify-between text-sm text-slate-400 font-medium"
                >
                  <span>Subtotal</span>
                  <span>\${{ total }}</span>
                </div>
                <div
                  class="flex justify-between text-sm text-slate-400 font-medium"
                >
                  <span>IVA (21%)</span>
                  <span>\${{ getTax() }}</span>
                </div>
                <div
                  class="flex justify-between text-lg text-white font-black pt-2 border-t border-red-500/20 mt-2"
                >
                  <span>Total</span>
                  <span class="text-red-500">\${{ getFinalTotal() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  private api = inject(ApiService);

  currentStep = 1;
  items: CartItem[] = [];
  total = 0;
  isProcessing = false;
  tenantInfo: any = null;

  formData = {
    email: "",
    name: "",
    cuit: "",
    phone: "",
    address: "",
    notes: "",
    city: "",
    province: "",
    zip: "",
    saveData: true,
  };

  addressSuggestions: any[] = [];
  isSearchingAddress = false;
  private searchTimeout: any;

  paymentMethod: string = "";

  ArrowLeft = ArrowLeft;
  Mail = Mail;
  User = User;
  MapPin = MapPin;
  CreditCard = CreditCard;
  Building2 = Building2;
  Phone = Phone;
  Check = Check;
  CheckCircle2 = CheckCircle2;
  Loader2 = Loader2;

  private purchaseCompleted = false;

  ngOnInit() {
    this.cartService.cart$.subscribe((cart) => {
      this.items = cart?.items || [];
      this.calculateTotal();

      // Solo redirigir al carrito si el carrito está vacío Y no estamos procesando ni terminamos la compra
      if (
        this.items.length === 0 &&
        !this.isProcessing &&
        !this.purchaseCompleted
      ) {
        this.router.navigate(["/cart"]);
      }
    });
    this.cartService.loadCart();
    
    this.api.get<any>('/tenant/info/').subscribe({
      next: (data) => {
        this.tenantInfo = data;
      },
      error: (err) => {
        console.error('Error fetching tenant payments config', err);
      }
    });
  }

  calculateTotal(): void {
    this.total = this.items.reduce((sum, item) => sum + item.total, 0);
  }

  getTax(): number {
    return Math.round(this.total * 0.21); // IVA 21%
  }

  getFinalTotal(): number {
    return this.total + this.getTax();
  }

  goBack() {
    this.router.navigate(["/cart"]);
  }

  goHome() {
    this.router.navigate(["/"]);
  }

  setStep(step: number) {
    this.currentStep = step;
  }

  nextStep() {
    if (this.currentStep < 3) this.currentStep++;
  }

  selectPayment(method: string) {
    this.paymentMethod = method;
  }

  processPayment() {
    this.isProcessing = true;

    // Si eligió guardar datos, procesarlo (simulado o usando authService)
    if (this.formData.saveData) {
      console.log("Account to be created for:", this.formData.email);
    }

    if (this.paymentMethod === "mercadopago") {
      this.cartService.createMercadoPagoPreference().subscribe({
        next: (res) => {
          if (res.init_point) window.location.href = res.init_point;
        },
        error: () => {
          alert("Error creando pago");
          this.isProcessing = false;
        },
      });
    } else {
      // Flow for Transferencia (Backend Create Order)
      this.cartService
        .createCheckout(this.formData, this.paymentMethod)
        .subscribe({
          next: (res) => {
            this.purchaseCompleted = true;
            const reference =
              res?.order_reference || res?.reference || res?.id || null;
            this.cartService.clearCart().subscribe(() => {
              this.isProcessing = false;
              // Navigate to the checkout result page (pending) with reference and payment method
              this.router.navigate(["/checkout/pending"], {
                queryParams: {
                  preference_id: reference,
                  payment: this.paymentMethod,
                },
              });
            });
          },
          error: (err) => {
            console.error("Error creating checkout:", err);
            this.isProcessing = false;
            // Optionally add an alert here
          },
        });
    }
  }

  onAddressInput() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    const query = this.formData.address;
    if (query.length < 5) {
      this.addressSuggestions = [];
      return;
    }

    this.isSearchingAddress = true;
    this.searchTimeout = setTimeout(() => {
      // Nominatim con sesgo regional (Santa Fe / BsAs) para máxima precisión local
      const viewbox = "-63,-36,-58,-31";
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ar&viewbox=${viewbox}&addressdetails=1&limit=10`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          this.addressSuggestions = data.map((item: any) => ({
            display_name: item.display_name,
            address: item.address,
            title: this.getSmartTitle(item),
            subtitle: this.getSmartSubtitle(item),
          }));
          this.isSearchingAddress = false;
        })
        .catch((err) => {
          console.error("Error fetching addresses:", err);
          this.isSearchingAddress = false;
        });
    }, 600);
  }

  private getSmartTitle(item: any): string {
    const addr = item.address;
    // Si tenemos calle oficial en el mapa, la usamos
    const street =
      addr.road || addr.pedestrian || addr.cycleway || addr.suburb || "";
    const number = addr.house_number || "";

    if (street) {
      // Buscamos si la palabra que el usuario escribió está en el display_name para completarla
      return `${street} ${number}`.trim();
    }

    // Fallback: Tomamos todo hasta la primera coma (pero aseguramos que no sea solo un número)
    const parts = item.display_name.split(",");
    if (parts[0].length < 5 && parts.length > 1) {
      return `${parts[0].trim()}, ${parts[1].trim()}`;
    }
    return parts[0].trim();
  }

  private getSmartSubtitle(item: any): string {
    const parts = item.display_name.split(",");
    const title = this.getSmartTitle(item);
    // Retornamos el resto de la dirección que no está en el título
    return parts
      .filter((p: string) => !title.includes(p.trim()))
      .slice(0, 3)
      .join(", ")
      .trim();
  }

  selectSuggestion(suggestion: any) {
    const addr = suggestion.address;

    // Captura completa y robusta
    this.formData.address = this.getSmartTitle(suggestion);
    this.formData.city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.hamlet ||
      addr.suburb ||
      "";
    this.formData.province = addr.state || "";
    this.formData.zip = addr.postcode || "";

    this.addressSuggestions = [];
  }

  formatAddressTitle(suggestion: any): string {
    return suggestion.title;
  }

  formatAddressSubtitle(suggestion: any): string {
    return suggestion.subtitle;
  }
}

declare var google: any;
