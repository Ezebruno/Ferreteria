// Formulario para crear/editar productos con información de precios e inventario
// Valida cambios y sincroniza con el backend
import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ApiService } from "src/app/core/services/api.service";
import { CategoriesService } from "src/app/core/services/categories.service";
import { InputTextModule } from "primeng/inputtext";
import { InputNumberModule } from "primeng/inputnumber";
import { DropdownModule } from "primeng/dropdown";
import { ButtonModule } from "primeng/button";
import {
  LucideAngularModule,
  ArrowLeft,
  Save,
  UploadCloud,
  ExternalLink,
  Zap,
  Globe,
  Search,
} from "lucide-angular";
import { CheckboxModule } from "primeng/checkbox";

@Component({
  selector: "app-product-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    LucideAngularModule,
    CheckboxModule,
  ],
  styles: [
    `
      :host ::ng-deep {
        /* Estilos para PrimeNG Inputs y Dropdowns en fondo oscuro */
        .custom-dark-input-number .p-inputnumber-input,
        .custom-dark-dropdown,
        .custom-dark-dropdown .p-dropdown-label,
        .p-inputtext {
          background: rgba(2, 6, 23, 0.5) !important; /* bg-slate-800/50 */
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-radius: 1rem !important;
          padding: 0.75rem 1rem !important;
          transition: all 0.3s ease !important;
        }

        .custom-dark-input-number .p-inputnumber-input:focus,
        .custom-dark-dropdown.p-focus,
        .p-inputtext:focus {
          border-color: #f59e0b !important; /* red-500 */
          box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2) !important;
          background: rgba(2, 6, 23, 0.8) !important;
        }

        /* Dropdown specific */
        .custom-dark-dropdown .p-dropdown-trigger {
          color: #94a3b8 !important; /* slate-400 */
        }

        .p-dropdown-panel {
          background: #0f172a !important; /* slate-900 */
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1rem !important;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }

        .p-dropdown-items .p-dropdown-item {
          color: #94a3b8 !important;
          transition: all 0.2s ease;
        }

        .p-dropdown-items .p-dropdown-item:hover {
          background: rgba(220, 38, 38, 0.1) !important;
          color: #ef4444 !important;
        }

        .p-dropdown-items .p-dropdown-item.p-highlight {
          background: rgba(220, 38, 38, 0.2) !important;
          color: #ef4444 !important;
        }

        /* Input Number Buttons */
        .p-inputnumber-button {
          background: #1e293b !important; /* slate-800 */
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #94a3b8 !important;
        }

        .p-inputnumber-button:hover {
          background: #334155 !important;
          color: white !important;
        }
      }
    `,
  ],
  template: `
    <div
      class="max-w-5xl mx-auto h-full flex flex-col space-y-8 pb-20 animate-in"
    >
      <!-- Top Header -->
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div class="flex items-center gap-4">
          <a
            routerLink="/admin/products"
            class="w-12 h-12 rounded-2xl bg-white/5 border border-red-500/30 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center shadow-lg"
          >
            <lucide-icon [name]="ArrowLeft" size="24"></lucide-icon>
          </a>
          <div>
            <h1 class="text-3xl font-black text-white tracking-tight">
              {{ isEditMode ? "Editar Producto" : "Nuevo Producto" }}
            </h1>
            <p class="text-slate-500 font-medium">
              Gestión detallada de artículos en catálogo.
            </p>
          </div>
        </div>

        <button
          (click)="onSubmit()"
          [disabled]="form.invalid || isSaving"
          class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 disabled:opacity-30 text-black px-10 py-4 rounded-2xl font-black shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
        >
          <lucide-icon [name]="Save" size="22"></lucide-icon>
          {{ isSaving ? "Sincronizando..." : "Guardar Cambios" }}
        </button>
      </div>

      <form [formGroup]="form" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Main Details -->
        <div class="lg:col-span-2 space-y-8">
          <div
            class="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-red-500/20 shadow-2xl space-y-8"
          >
            <h2
              class="text-xl font-black text-white flex items-center gap-2 uppercase tracking-widest text-sm opacity-80"
            >
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              Información del Producto
            </h2>

            <div class="flex flex-col gap-3">
              <label
                class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                >Nombre Comercial *</label
              >
              <input
                pInputText
                formControlName="name"
                placeholder="Ej. Taladro Percutor Industrial 20V"
                class="w-full p-4 rounded-2xl bg-slate-800/50 border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-slate-700 outline-none"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="flex flex-col gap-3">
                <label
                  class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                  >Referencia SKU / EAN *</label
                >
                <input
                  pInputText
                  formControlName="sku"
                  placeholder="TP-20V-X1"
                  class="w-full p-4 rounded-2xl bg-slate-800/50 border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-slate-700 font-mono uppercase outline-none"
                />
              </div>
              <div class="flex flex-col gap-3">
                <label
                  class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                  >Categoría Asignada *</label
                >
                <p-dropdown
                  [options]="categories"
                  formControlName="category"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Selecciona una categoría"
                  styleClass="w-full custom-dark-dropdown"
                ></p-dropdown>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <label
                class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                >Descripción Técnica</label
              >
              <textarea
                pInputTextarea
                formControlName="description"
                rows="6"
                placeholder="Describe las características principales del producto..."
                class="w-full p-4 rounded-2xl bg-slate-800/50 border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-slate-700 resize-none outline-none"
              ></textarea>
            </div>
          </div>

          <!-- Detalles Técnicos Card -->
          <div
            class="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-red-500/20 shadow-2xl space-y-8"
          >
            <h2
              class="text-xl font-black text-white flex items-center gap-2 uppercase tracking-widest text-sm opacity-80"
            >
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              Ficha de Especificaciones
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="flex flex-col gap-3">
                <label
                  class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                  >Fabricante / Marca</label
                >
                <input
                  pInputText
                  formControlName="brand"
                  placeholder="Ej. DeWalt"
                  class="w-full p-4 rounded-2xl bg-slate-800/50 border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                />
              </div>
              <div class="flex flex-col gap-3">
                <label
                  class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                  >Composición / Material</label
                >
                <input
                  pInputText
                  formControlName="material"
                  placeholder="Ej. Acero Reforzado"
                  class="w-full p-4 rounded-2xl bg-slate-800/50 border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="flex flex-col gap-3">
                <label
                  class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                  >Peso Neto</label
                >
                <input
                  pInputText
                  formControlName="weight"
                  placeholder="Ej. 2.4 Kg"
                  class="w-full p-4 rounded-2xl bg-slate-800/50 border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                />
              </div>
              <div class="flex flex-col gap-3">
                <label
                  class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                  >Dimensiones (An x Al x Pr)</label
                >
                <input
                  pInputText
                  formControlName="dimensions"
                  placeholder="Ej. 10x20x15 cm"
                  class="w-full p-4 rounded-2xl bg-slate-800/50 border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Media & Numbers -->
        <div class="space-y-8">
          <!-- Multimedia Section -->
          <div
            class="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-red-500/20 shadow-2xl space-y-6"
          >
            <h2
              class="text-sm font-black text-white uppercase tracking-widest opacity-80"
            >
              Galería Multimedia
            </h2>

            <div
              class="relative group border-2 border-dashed border-red-500/30 rounded-3xl h-64 flex flex-col items-center justify-center overflow-hidden bg-slate-800/50 transition-all hover:bg-red-500/5 hover:border-red-500/40"
            >
              <input
                type="file"
                (change)="onFileSelected($event)"
                accept="image/*"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />

              <img
                *ngIf="previewUrl"
                [src]="previewUrl"
                class="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-700"
              />

              <div
                *ngIf="!previewUrl"
                class="flex flex-col items-center text-center p-6 relative z-10"
              >
                <div
                  class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 border border-red-500/20 shadow-xl group-hover:bg-red-500 group-hover:text-black transition-all"
                >
                  <lucide-icon
                    [name]="UploadCloud"
                    size="28"
                    class="text-red-500 group-hover:text-black"
                  ></lucide-icon>
                </div>
                <p class="font-black text-white text-sm">Cargar Imagen</p>
                <p class="text-xs text-slate-500 mt-2">
                  Formatos aceptados: PNG, JPG (Máx 5MB)
                </p>
              </div>

              <div
                *ngIf="previewUrl"
                class="absolute inset-0 bg-slate-800/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-sm"
              >
                <div
                  class="px-6 py-2 bg-white text-black font-black rounded-xl text-xs uppercase"
                >
                  Remplazar
                </div>
              </div>
            </div>
          </div>

          <!-- Precios e Inventario -->
          <div
            class="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-red-500/20 shadow-2xl space-y-6"
          >
            <h2
              class="text-sm font-black text-white uppercase tracking-widest opacity-80 flex items-center gap-2"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              Precios e Inventario
            </h2>

            <div class="flex flex-col gap-3">
              <label
                class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                >Precio de Venta *</label
              >
              <input
                pInputText
                formControlName="price_retail"
                type="number"
                placeholder="0"
                class="w-full p-4 rounded-2xl bg-slate-800/50 border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
              />
            </div>

            <div class="flex flex-col gap-3">
              <label
                class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                >Descuento (%)</label
              >
              <input
                pInputText
                formControlName="discount_percentage"
                type="number"
                placeholder="0"
                class="w-full p-4 rounded-2xl bg-slate-800/50 border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-3">
                <label
                  class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                  >Stock Actual</label
                >
                <input
                  pInputText
                  formControlName="stock_current"
                  type="number"
                  placeholder="0"
                  class="w-full p-4 rounded-2xl bg-slate-800/50 border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                />
              </div>
              <div class="flex flex-col gap-3">
                <label
                  class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter"
                  >Stock Mínimo</label
                >
                <input
                  pInputText
                  formControlName="stock_minimum"
                  type="number"
                  placeholder="5"
                  class="w-full p-4 rounded-2xl bg-slate-800/50 border-red-500/30 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <!-- Mercado Libre Integration -->
          <div
            class="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-blue-500/20 shadow-2xl space-y-6 overflow-hidden relative group"
          >
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <lucide-icon [name]="Globe" size="64"></lucide-icon>
            </div>

            <div class="flex items-center justify-between">
              <h2 class="text-sm font-black text-white uppercase tracking-widest opacity-80 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                Mercado Libre
              </h2>
              <p-checkbox 
                formControlName="meli_sync" 
                [binary]="true" 
                label="Sincronizar"
                labelStyleClass="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2"
              ></p-checkbox>
            </div>

            <div *ngIf="form.get('meli_sync')?.value" class="space-y-6 animate-in">
              <div class="flex flex-col gap-3">
                <label class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter">Categoría ML</label>
                <div class="flex gap-2">
                  <input
                    pInputText
                    formControlName="meli_category_id"
                    placeholder="Ej. MLA1234"
                    class="flex-1 p-4 rounded-2xl bg-slate-800/50 border-blue-500/30 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-mono"
                  />
                  <button
                    type="button"
                    (click)="predictCategory()"
                    class="p-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30 transition-all flex items-center justify-center shadow-lg"
                    title="Predecir Categoría"
                  >
                    <lucide-icon [name]="Zap" size="20"></lucide-icon>
                  </button>
                  <button
                    type="button"
                    (click)="searchCategories()"
                    class="p-4 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded-2xl border border-slate-500/30 transition-all flex items-center justify-center shadow-lg"
                    title="Buscar Categoría por nombre"
                  >
                    <lucide-icon [name]="Search" size="20"></lucide-icon>
                  </button>
                  <button
                    type="button"
                    (click)="openMeLiSell()"
                    class="p-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-2xl border border-yellow-500/30 transition-all flex items-center justify-center shadow-lg"
                    title="Ir a Publicar en Mercado Libre (Web)"
                  >
                    <lucide-icon [name]="ExternalLink" size="20"></lucide-icon>
                  </button>
                </div>
              </div>

              <!-- List of predicted/searched categories if multiple -->
              <div *ngIf="categorySearchResults.length > 0" class="p-2 bg-slate-900/50 rounded-2xl border border-blue-500/20 space-y-2 animate-in">
              <!-- MeLi Listing Type -->
              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Tipo de Publicación MeLi</label>
                <select
                  formControlName="meli_listing_type"
                  class="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                >
                  <option *ngFor="let type of meliListingTypes" [value]="type.value">{{ type.label }}</option>
                </select>
              </div>

              <!-- MeLi Format -->
              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Formato de Venta</label>
                <select
                  formControlName="meli_format"
                  class="w-full p-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                >
                  <option value="unidades">Unidad / Individual</option>
                  <option value="pack">Pack / Multipack</option>
                </select>
              </div>
              <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 pt-1">Resultados encontrados:</p>
                <div 
                  *ngFor="let cat of categorySearchResults" 
                  (click)="selectCategory(cat)"
                  class="p-3 hover:bg-blue-500/10 rounded-xl cursor-pointer border border-transparent hover:border-blue-500/20 transition-all group"
                >
                  <p class="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{{ cat.category_name }}</p>
                  <p class="text-[10px] text-slate-400 italic mb-1">{{ cat.category_path }}</p>
                  <p class="text-[10px] text-slate-500 font-mono">{{ cat.category_id }} - {{ cat.domain_name }}</p>
                </div>
                <button (click)="categorySearchResults = []" class="w-full py-2 text-[10px] font-black text-rose-500 uppercase hover:bg-rose-500/10 rounded-xl transition-all">Cerrar</button>
              </div>

              <div class="flex flex-col gap-3">
                <label class="font-bold text-slate-400 text-sm ml-1 uppercase tracking-tighter">Condición</label>
                <p-dropdown
                  [options]="meliConditions"
                  formControlName="meli_condition"
                  optionLabel="label"
                  optionValue="value"
                  styleClass="w-full custom-dark-dropdown"
                ></p-dropdown>
                  <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">ID de Item Mercado Libre (Vincular Manualmente)</p>
                <div class="flex gap-2">
                  <input
                    type="text"
                    formControlName="meli_item_id"
                    placeholder="MLA12345678"
                    class="flex-1 p-3 bg-slate-900 border border-emerald-500/20 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <a 
                    *ngIf="form.get('meli_item_id')?.value"
                    [href]="'https://articulo.mercadolibre.com.ar/' + form.get('meli_item_id')?.value" 
                    target="_blank"
                    class="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all"
                  >
                    <lucide-icon [name]="ExternalLink" size="18"></lucide-icon>
                  </a>
                </div>
                <p class="text-[10px] text-slate-500 mt-2 italic">Si publicas directamente en Mercado Libre, pega aquí el ID (ej: MLA...) para vincular el stock.</p>
              </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  fb = inject(FormBuilder);
  api = inject(ApiService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  categoriesService = inject(CategoriesService);

  ArrowLeft = ArrowLeft;
  Save = Save;
  UploadCloud = UploadCloud;
  ExternalLink = ExternalLink;
  Zap = Zap;
  Globe = Globe;
  Search = Search;

  form: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  categories: any[] = [];
  isSaving = false;
  categorySearchResults: any[] = [];

  meliConditions = [
    { label: "Nuevo", value: "new" },
    { label: "Usado", value: "used" },
    { label: "No especificado", value: "not_specified" },
  ];

  meliListingTypes = [
    { label: "Premium (Cuotas)", value: "gold_special" },
    { label: "Clásica", value: "gold_pro" },
    { label: "Plata", value: "silver" },
    { label: "Bronce", value: "bronze" },
  ];

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor() {
    this.form = this.fb.group({
      name: ["", Validators.required],
      sku: ["", Validators.required],
      description: [""],
      category: [null, Validators.required],
      price_retail: [0, Validators.min(0)],
      price_wholesale: [0], // Default values for backend
      cost_price: [0],
      discount_percentage: [0, [Validators.min(0), Validators.max(100)]],
      stock_current: [0, Validators.min(0)],
      stock_minimum: [0, Validators.min(0)],
      brand: [""],
      material: [""],
      weight: [""],
      dimensions: [""],
      warranty: [""],
      specifications: [""],
      meli_sync: [false],
      meli_condition: ["new"],
      meli_listing_type: ["gold_pro"],
      meli_format: ["unidades"],
      meli_item_id: [null],
    });
  }

  ngOnInit() {
    this.loadCategories();

    this.route.params.subscribe((params: any) => {
      if (params["id"]) {
        this.isEditMode = true;
        this.productId = +params["id"];
        this.loadProduct(this.productId);
      } else {
        // Auto-generate SKU for new products
        this.form.patchValue({
          sku: this.generateUniqueSKU(),
        });
      }
    });
  }

  generateUniqueSKU(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "PRD-";
    // Add 8 random characters
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  loadCategories() {
    // Always load from API to ensure IDs match the database
    this.api.get<any>(`/inventory/categories/`).subscribe({
      next: (res: any) => {
        this.categories = res.results || res;
      },
      error: () => {
        // Fallback to cached if API fails
        this.categories = this.categoriesService.getCategoriesArray();
      },
    });
  }

  loadProduct(id: number) {
    this.api.get<any>(`/inventory/products/${id}/`).subscribe({
      next: (product: any) => {
        this.form.patchValue({
          name: product.name,
          sku: product.sku,
          description: product.description,
          category: product.category?.id || product.category,
          price_retail: product.price_retail,
          discount_percentage: product.discount_percentage || 0,
          stock_current: product.stock_current,
          stock_minimum: product.stock_min || product.stock_minimum, // map stock_min from db
          brand: product.brand || "",
          material: product.material || "",
          weight: product.weight || "",
          dimensions: product.dimensions || "",
          warranty: product.warranty || "",
          specifications: Array.isArray(product.specifications)
            ? product.specifications.join("\n")
            : product.specifications || "",
          meli_sync: product.meli_sync || false,
          meli_category_id: product.meli_category_id || "",
          meli_condition: product.meli_condition || "new",
          meli_listing_type: product.meli_listing_type || "gold_special",
          meli_item_id: product.meli_item_id || null,
        });
        if (product.image) {
          this.previewUrl = product.image;
        }
      },
      error: (err: any) => {
        console.error("Error loading product", err);
        alert("Error al cargar el producto para editar");
        this.router.navigate(["/admin/products"]);
      },
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSaving = true;
    const formValue = this.form.value;

    // Use FormData for image upload support
    const formData = new FormData();
    formData.append("name", formValue.name);
    formData.append("sku", formValue.sku);
    formData.append("description", formValue.description || "Sin descripción.");
    formData.append("category", formValue.category); // category ID
    formData.append("price_retail", (formValue.price_retail || 0).toString());
    formData.append(
      "price_wholesale",
      (formValue.price_wholesale || formValue.price_retail || 0).toString(),
    );
    formData.append("cost_price", (formValue.cost_price || 0).toString());
    formData.append("stock_current", (formValue.stock_current || 0).toString());
    formData.append("stock_min", (formValue.stock_minimum || 5).toString());
    formData.append(
      "discount_percentage",
      (formValue.discount_percentage || 0).toString(),
    );
    formData.append("is_active", "true");
    formData.append("is_ecommerce", "true");
    formData.append("featured", "false");

    // Specification Fields
    formData.append("brand", formValue.brand || "");
    formData.append("material", formValue.material || "");
    formData.append("weight", formValue.weight || "");
    formData.append("dimensions", formValue.dimensions || "");
    formData.append("warranty", formValue.warranty || "");
    formData.append("specifications", formValue.specifications || "");

    // MeLi Integration fields
    formData.append("meli_sync", formValue.meli_sync ? "true" : "false");
    if (formValue.meli_sync) {
      formData.append("meli_category_id", formValue.meli_category_id || "");
      formData.append("meli_condition", formValue.meli_condition || "new");
      formData.append(
        "meli_listing_type",
        formValue.meli_listing_type || "gold_special",
      );
    }

    // Only append image if a new file was selected
    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }

    if (this.isEditMode && this.productId) {
      // Update existing product
      this.api.put(`/products/${this.productId}/`, formData).subscribe({
        next: (response: any) => {
          this.isSaving = false;
          alert("✅ Producto actualizado exitosamente");
          if (response && response.meli_url) {
            window.open(response.meli_url, "_blank");
          }
          this.router.navigate(["/admin/products"]);
        },
        error: (error: any) => {
          this.isSaving = false;
          console.error("Error updating product", error);
          const errorMsg =
            error.error?.detail || JSON.stringify(error.error) || error.message;
          alert("Error al actualizar el producto: " + errorMsg);
        },
      });
    } else {
      // Create new product
      this.api.post("/products/", formData).subscribe({
        next: (response: any) => {
          this.isSaving = false;
          alert("✅ Producto creado exitosamente");
          if (response && response.meli_url) {
            window.open(response.meli_url, "_blank");
          }
          this.router.navigate(["/admin/products"]);
        },
        error: (error: any) => {
          this.isSaving = false;
          console.error("Error creating product", error);
          const errorMsg =
            error.error?.detail ||
            (error.error?.non_field_errors
              ? error.error.non_field_errors[0]
              : JSON.stringify(error.error)) ||
            error.message;
          alert("Error al crear el producto: " + errorMsg);
        },
      });
    }
  }

  predictCategory() {
    const categoryId = this.form.get("category")?.value;
    const productName = this.form.get("name")?.value;

    // 1. If the selected category already has a MeLi ID mapped, use it directly
    if (categoryId) {
      const selectedCategory = this.categories.find(
        (c) => c.id === categoryId || c.id === Number(categoryId),
      );
      if (selectedCategory && (selectedCategory as any).meli_category_id) {
        this.form.patchValue({
          meli_category_id: (selectedCategory as any).meli_category_id,
        });
        alert(
          `✅ Categoría tomada del mapeo de "${selectedCategory.name}":\nID: ${(selectedCategory as any).meli_category_id}\n\nPodés verificarla en la sección Categorías del menú.`,
        );
        return;
      }
    }

    // 2. Predict using category name (more accurate) or product name as fallback
    const selectedCat = this.categories.find(
      (c) => c.id === categoryId || c.id === Number(categoryId),
    );
    const queryTitle = selectedCat ? selectedCat.name : productName;

    if (!queryTitle) {
      alert(
        "Seleccioná una categoría o ingresá un nombre de producto para predecir.",
      );
      return;
    }

    this.api
      .get<any>(
        `/integrations/meli/predict-category/?title=${encodeURIComponent(queryTitle)}`,
      )
      .subscribe({
        next: (res: any) => {
          if (res && res.category_id) {
            this.form.patchValue({ meli_category_id: res.category_id });
            const domainLabel = res.domain_name ? ` (${res.domain_name})` : "";
            const source = selectedCat
              ? `categoría "${selectedCat.name}"`
              : `"${queryTitle}"`;
            alert(
              `✅ Categoría detectada para ${source}:\n${res.category_name}${domainLabel}\nID: ${res.category_id}`,
            );
          } else {
            alert("No se encontró una categoría. Ingresá el ID manualmente.");
          }
        },
        error: (err: any) => {
          console.error("Category prediction error:", err);
          alert(
            "No se pudo predecir la categoría. Por favor ingresa el ID manualmente.",
          );
        },
      });
  }

  searchCategories() {
    const query = prompt("Ingresá palabras clave para buscar la categoría (ej: Taladro percutor):");
    if (!query) return;

    this.api.get<any[]>(`/integrations/meli/search-category/?q=${encodeURIComponent(query)}`).subscribe({
      next: (res: any[]) => {
        if (res && res.length > 0) {
          this.categorySearchResults = res;
        } else {
          alert("No se encontraron categorías para esa búsqueda.");
        }
      },
      error: (err: any) => {
        console.error("Category search error:", err);
        alert("Error al buscar categorías.");
      }
    });
  }

  selectCategory(cat: any) {
    this.form.patchValue({ meli_category_id: cat.category_id });
    this.categorySearchResults = [];
    alert(`✅ Categoría seleccionada: ${cat.category_name}`);
  }

  openMeLiSell() {
    const query = this.form.get("name")?.value || "";
    const url = `https://www.mercadolibre.com.ar/publicar#label=sell&q=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
    alert("Se ha abierto el publicador de Mercado Libre. Una vez publicado, pega el ID del item aquí abajo para vincularlo.");
  }
}
