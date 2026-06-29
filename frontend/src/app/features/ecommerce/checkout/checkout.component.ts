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
    <div class="min-h-screen bg-concrete-50 pt-20 pb-16">
      <div class="w-full max-w-5xl mx-auto px-4">
        <div class="mb-6">
          <button
            (click)="goBack()"
            class="flex items-center gap-2 text-steel-500 hover:text-ferre-600 font-semibold text-sm transition-colors group"
          >
            <lucide-icon [name]="ArrowLeft" size="18" class="group-hover:-translate-x-1 transition-transform"></lucide-icon>
            Volver al Carrito
          </button>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="md:col-span-2 space-y-5">
            <!-- Step Progress -->
            <div class="flex items-center justify-between max-w-lg mx-auto mb-8">
              <div class="relative flex flex-col items-center">
                <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                  [ngClass]="currentStep === 1 ? 'bg-ferre-600 text-white' : 'bg-ferre-100 text-ferre-600'">
                  <lucide-icon *ngIf="currentStep > 1" [name]="Check" size="16" strokeWidth="3"></lucide-icon>
                  <span *ngIf="currentStep <= 1">1</span>
                </div>
                <span class="mt-2 text-xs font-semibold" [ngClass]="currentStep >= 1 ? 'text-ferre-600' : 'text-steel-400'">Contacto</span>
              </div>
              <div class="flex-1 h-0.5 mx-4 rounded-full transition-all" [ngClass]="currentStep >= 2 ? 'bg-ferre-500' : 'bg-concrete-200'"></div>
              <div class="relative flex flex-col items-center">
                <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                  [ngClass]="currentStep === 2 ? 'bg-ferre-600 text-white' : currentStep > 2 ? 'bg-ferre-100 text-ferre-600' : 'bg-concrete-200 text-steel-400'">
                  <lucide-icon *ngIf="currentStep > 2" [name]="Check" size="16" strokeWidth="3"></lucide-icon>
                  <span *ngIf="currentStep <= 2">2</span>
                </div>
                <span class="mt-2 text-xs font-semibold" [ngClass]="currentStep >= 2 ? 'text-ferre-600' : 'text-steel-400'">Envio</span>
              </div>
              <div class="flex-1 h-0.5 mx-4 rounded-full transition-all" [ngClass]="currentStep >= 3 ? 'bg-ferre-500' : 'bg-concrete-200'"></div>
              <div class="relative flex flex-col items-center">
                <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                  [ngClass]="currentStep === 3 ? 'bg-ferre-600 text-white' : 'bg-concrete-200 text-steel-400'">
                  3
                </div>
                <span class="mt-2 text-xs font-semibold" [ngClass]="currentStep >= 3 ? 'text-ferre-600' : 'text-steel-400'">Pago</span>
              </div>
            </div>

            <!-- Step 1: Contacto -->
            <div class="bg-white border border-concrete-200 rounded-2xl p-6 shadow-sm" [class.hidden]="currentStep !== 1">
              <h2 class="text-lg font-bold text-steel-900 mb-5 flex items-center gap-2">
                <lucide-icon [name]="Mail" class="text-ferre-600" size="20"></lucide-icon>
                Datos de Contacto
              </h2>
              <div class="space-y-4">
                <div>
                  <label class="text-xs font-semibold text-steel-500 uppercase tracking-wide block mb-1.5">Correo Electronico</label>
                  <input type="email" [(ngModel)]="formData.email" placeholder="ejemplo@correo.com"
                    class="input-ferre w-full" />
                </div>
                <div class="bg-ferre-50 border border-ferre-200 rounded-xl p-3 flex gap-3 text-sm text-steel-600">
                  <lucide-icon [name]="Check" size="18" class="text-ferre-600 flex-shrink-0 mt-0.5" strokeWidth="3"></lucide-icon>
                  <p>Puedes comprar sin cuenta. Usaremos tu email solo para enviarte el comprobante y seguimiento del pedido.</p>
                </div>
                <button (click)="nextStep()" [disabled]="!formData.email"
                  class="w-full btn-ferre py-3 disabled:opacity-50">
                  Continuar
                </button>
              </div>
            </div>

            <!-- Step 2: Envio / Facturacion -->
            <div class="bg-white border border-concrete-200 rounded-2xl p-6 shadow-sm" [class.hidden]="currentStep !== 2">
              <div class="flex items-center justify-between mb-5">
                <h2 class="text-lg font-bold text-steel-900 flex items-center gap-2">
                  <lucide-icon [name]="User" class="text-ferre-600" size="20"></lucide-icon>
                  Datos de Facturacion
                </h2>
                <button (click)="setStep(1)" class="text-xs font-semibold text-steel-400 hover:text-ferre-600 transition-colors">Cambiar Email</button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-steel-500 uppercase tracking-wide block mb-1.5">Nombre / Razon Social</label>
                  <input type="text" [(ngModel)]="formData.name" class="input-ferre w-full" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-steel-500 uppercase tracking-wide block mb-1.5">DNI o CUIT</label>
                  <input type="text" [(ngModel)]="formData.cuit" class="input-ferre w-full" />
                </div>
                <div class="md:col-span-2">
                  <label class="text-xs font-semibold text-steel-500 uppercase tracking-wide block mb-1.5">Telefono de contacto</label>
                  <input type="tel" [(ngModel)]="formData.phone" class="input-ferre w-full" />
                </div>

                <div class="md:col-span-2 mt-2 pt-4 border-t border-concrete-100">
                  <h3 class="text-sm font-bold text-steel-700 mb-3 flex items-center gap-2">
                    <lucide-icon [name]="MapPin" size="16" class="text-ferre-600"></lucide-icon>
                    Donde enviamos
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="col-span-2 relative">
                      <div class="relative">
                        <input type="text" [(ngModel)]="formData.address" (input)="onAddressInput()" placeholder="Calle y numero" class="input-ferre w-full pr-10" />
                        <div *ngIf="isSearchingAddress" class="absolute right-3 top-1/2 -translate-y-1/2">
                          <lucide-icon [name]="Loader2" size="16" class="animate-spin text-ferre-500"></lucide-icon>
                        </div>
                      </div>
                      <div *ngIf="addressSuggestions.length > 0" class="absolute left-0 right-0 top-full mt-2 bg-white border border-concrete-200 rounded-xl shadow-lg z-50 overflow-hidden">
                        <div class="px-4 py-2.5 bg-concrete-50 border-b border-concrete-100 text-[10px] font-bold text-steel-400 uppercase tracking-wider flex justify-between items-center">
                          <span>Resultados</span>
                          <span class="text-ferre-500">No aparece? Agrega la ciudad</span>
                        </div>
                        <button *ngFor="let suggestion of addressSuggestions" (click)="selectSuggestion(suggestion)"
                          class="w-full text-left px-4 py-3 hover:bg-ferre-50 transition-colors border-b border-concrete-50 last:border-0">
                          <span class="text-sm font-semibold text-steel-800">{{ formatAddressTitle(suggestion) }}</span>
                          <span class="text-xs text-steel-400 block mt-0.5">{{ formatAddressSubtitle(suggestion) }}</span>
                        </button>
                        <div class="p-2 text-center">
                          <button (click)="addressSuggestions = []" class="text-[10px] font-bold text-steel-400 hover:text-steel-700 uppercase">Cerrar</button>
                        </div>
                      </div>
                    </div>
                    <div class="col-span-2">
                      <input type="text" [(ngModel)]="formData.notes" placeholder="Depto, timbre, o indicaciones (Opcional)" class="input-ferre w-full" />
                    </div>
                    <input type="text" [(ngModel)]="formData.city" placeholder="Ciudad" class="input-ferre w-full" />
                    <input type="text" [(ngModel)]="formData.province" placeholder="Provincia" class="input-ferre w-full" />
                    <div class="col-span-2">
                      <input type="text" [(ngModel)]="formData.zip" placeholder="Codigo Postal" class="input-ferre w-full" />
                    </div>
                  </div>
                </div>
              </div>

              <label class="flex items-start gap-3 mt-6 p-4 bg-concrete-50 border border-concrete-200 rounded-xl cursor-pointer hover:bg-concrete-100 transition-colors">
                <div class="relative flex items-center justify-center mt-0.5 w-5 h-5">
                  <input type="checkbox" [(ngModel)]="formData.saveData" class="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" />
                  <div *ngIf="!formData.saveData" class="w-4.5 h-4.5 border-2 border-concrete-300 rounded bg-white transition-colors pointer-events-none relative z-10" style="width:18px;height:18px;"></div>
                  <lucide-icon *ngIf="formData.saveData" [name]="CheckCircle2" size="20" class="text-ferre-600 pointer-events-none relative z-10" strokeWidth="2"></lucide-icon>
                </div>
                <div>
                  <span class="block text-sm font-semibold text-steel-800 mb-0.5">Guardar mis datos y crear una cuenta</span>
                  <span class="block text-xs text-steel-400">Crea una cuenta rapidamente para ver tu historial y acelerar tu proxima compra.</span>
                </div>
              </label>

              <button (click)="nextStep()" [disabled]="!formData.name || !formData.address || !formData.phone"
                class="w-full btn-ferre py-3 mt-5 disabled:opacity-50">
                Continuar al Pago
              </button>
            </div>

            <!-- Step 3: Pago -->
            <div class="bg-white border border-concrete-200 rounded-2xl p-6 shadow-sm" [class.hidden]="currentStep !== 3">
              <div class="flex items-center justify-between mb-5">
                <h2 class="text-lg font-bold text-steel-900 flex items-center gap-2">
                  <lucide-icon [name]="CreditCard" class="text-ferre-600" size="20"></lucide-icon>
                  Medio de Pago
                </h2>
                <button (click)="setStep(2)" class="text-xs font-semibold text-steel-400 hover:text-ferre-600 transition-colors">Cambiar Datos</button>
              </div>

              <div class="space-y-3">
                <div *ngIf="tenantInfo?.has_mp" (click)="selectPayment('mercadopago')"
                  class="p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4"
                  [ngClass]="paymentMethod === 'mercadopago' ? 'border-blue-500 bg-blue-50' : 'border-concrete-200 bg-white hover:border-concrete-300'">
                  <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">M</div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-steel-900 text-sm">Mercado Pago</h3>
                    <p class="text-xs text-steel-400">Tarjetas de credito, debito y dinero en cuenta</p>
                  </div>
                  <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center" [ngClass]="paymentMethod === 'mercadopago' ? 'border-blue-500' : 'border-concrete-300'">
                    <div class="w-2.5 h-2.5 rounded-full bg-blue-500" *ngIf="paymentMethod === 'mercadopago'"></div>
                  </div>
                </div>

                <div *ngIf="tenantInfo?.bank_cvu || tenantInfo?.bank_alias" (click)="selectPayment('transferencia')"
                  class="p-4 rounded-xl border cursor-pointer transition-all flex flex-col"
                  [ngClass]="paymentMethod === 'transferencia' ? 'border-ferre-500 bg-ferre-50' : 'border-concrete-200 bg-white hover:border-concrete-300'">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-steel-800 rounded-full flex items-center justify-center text-white text-lg">B</div>
                    <div class="flex-1">
                      <h3 class="font-semibold text-steel-900 text-sm">Transferencia Bancaria</h3>
                      <p class="text-xs text-steel-400">5% de Descuento (Pago manual)</p>
                    </div>
                    <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center" [ngClass]="paymentMethod === 'transferencia' ? 'border-ferre-500' : 'border-concrete-300'">
                      <div class="w-2.5 h-2.5 rounded-full bg-ferre-600 transition-all scale-0" [class.scale-100]="paymentMethod === 'transferencia'"></div>
                    </div>
                  </div>
                  <div *ngIf="paymentMethod === 'transferencia'" class="mt-4 pt-4 border-t border-concrete-200 text-sm">
                    <p class="text-steel-600 font-medium mb-3">Transfiere el monto exacto a la siguiente cuenta:</p>
                    <div class="bg-concrete-50 p-4 rounded-xl border border-concrete-200 space-y-2">
                      <div class="flex justify-between items-center">
                        <span class="text-steel-400 text-xs">Titular</span>
                        <span class="text-steel-900 font-semibold text-sm">{{ tenantInfo?.name || 'FerreNexo' }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-steel-400 text-xs">CBU / CVU</span>
                        <span class="text-steel-900 font-semibold text-sm">{{ tenantInfo?.bank_cvu || '...' }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-steel-400 text-xs">Alias</span>
                        <span class="text-ferre-600 font-bold text-sm">{{ tenantInfo?.bank_alias || '...' }}</span>
                      </div>
                    </div>
                    <p class="mt-3 text-xs text-steel-400">
                      Una vez finalizado, <span class="text-ferre-600 font-semibold">envia el comprobante</span> por WhatsApp indicando tu codigo de pedido.
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-3 mt-6">
                <button (click)="processPayment()" [disabled]="!paymentMethod || isProcessing"
                  class="w-full btn-ferre py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">
                  <lucide-icon *ngIf="isProcessing" [name]="Loader2" size="20" class="animate-spin"></lucide-icon>
                  <span *ngIf="paymentMethod === 'transferencia'">{{ isProcessing ? 'Procesando...' : 'YA REALICE LA TRANSFERENCIA' }}</span>
                  <span *ngIf="paymentMethod !== 'transferencia' && paymentMethod !== ''">{{ isProcessing ? 'Procesando...' : 'PAGAR $' + getFinalTotal() }}</span>
                  <span *ngIf="paymentMethod === '' && (tenantInfo?.has_mp || tenantInfo?.bank_cvu)">SELECCIONAR PAGO</span>
                  <span *ngIf="!tenantInfo?.has_mp && !tenantInfo?.bank_cvu && !tenantInfo?.bank_alias" class="text-sm">NINGUN MEDIO DE PAGO DISPONIBLE</span>
                </button>
                <button *ngIf="paymentMethod === 'transferencia' && !isProcessing" (click)="goHome()"
                  class="w-full bg-concrete-100 border border-concrete-200 text-steel-700 font-semibold py-3 rounded-xl hover:bg-concrete-200 transition-all text-sm">
                  VOLVER AL INICIO
                </button>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div>
            <div class="bg-white border border-concrete-200 rounded-2xl p-5 shadow-sm sticky top-24">
              <h3 class="font-bold text-steel-900 mb-4 text-sm">Resumen</h3>
              <div class="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-1">
                <div *ngFor="let item of items" class="flex gap-3">
                  <div class="w-11 h-11 bg-concrete-50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-concrete-100">
                    <img *ngIf="item.image" [src]="item.image" class="w-full h-full object-contain" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-steel-800 truncate">{{ item.product_name }}</p>
                    <p class="text-[11px] text-steel-400">{{ item.quantity }} x \${{ item.price }}</p>
                  </div>
                </div>
              </div>
              <div class="border-t border-concrete-100 pt-3 space-y-2 mt-3">
                <div class="flex justify-between text-xs text-steel-400 font-medium">
                  <span>Subtotal</span>
                  <span>\${{ total }}</span>
                </div>
                <div class="flex justify-between text-xs text-steel-400 font-medium">
                  <span>IVA (21%)</span>
                  <span>\${{ getTax() }}</span>
                </div>
                <div class="flex justify-between text-base text-steel-900 font-bold pt-2 border-t border-concrete-100 mt-2">
                  <span>Total</span>
                  <span class="text-ferre-600">\${{ getFinalTotal() }}</span>
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
