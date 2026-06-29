// Listado de productos con filtros y opciones de edición/eliminación
// Muestra tabla con paginación, búsqueda y acciones en productos
import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "src/app/core/services/api.service";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import {
  LucideAngularModule,
  Plus,
  Search,
  Edit3,
  Trash2,
  PackageSearch,
  Globe,
  RefreshCw,
} from "lucide-angular";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    LucideAngularModule,
    RouterModule,
    FormsModule,
  ],
  styles: [`
    :host ::ng-deep .p-datatable-dark.p-datatable {
      background: transparent !important;
    }
    
    :host ::ng-deep .p-datatable-dark .p-datatable-wrapper {
      background: transparent !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-thead > tr > th {
      background: #1a1f27 !important;
      color: #8b92a0 !important;
      border-bottom: 2px solid #2a2f38 !important;
      padding: 1rem 1.25rem !important;
      font-size: 0.7rem !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.08em !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr {
      background: transparent !important;
      color: #e2e4e9 !important;
      transition: all 0.15s !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr:hover {
      background: rgba(255,255,255,0.03) !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr > td {
      border-bottom: 1px solid #2a2f38 !important;
      padding: 1rem 1.25rem !important;
      background: transparent !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator {
      background: #1a1f27 !important;
      border: none !important;
      border-top: 2px solid #2a2f38 !important;
      color: #8b92a0 !important;
      padding: 1rem !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page {
      color: #8b92a0 !important;
      background: transparent !important;
      border: 1.5px solid #2a2f38 !important;
      border-radius: 0.375rem !important;
      min-width: 2.25rem !important;
      height: 2.25rem !important;
      margin: 0 0.25rem !important;
      transition: all 0.2s !important;
      font-weight: 700 !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page:hover {
      background: rgba(212, 94, 8, 0.06) !important;
      border-color: #d45e08 !important;
      color: #d45e08 !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
      background: #d45e08 !important;
      color: #ffffff !important;
      border-color: #d45e08 !important;
      font-weight: 800 !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-link {
      color: #8b92a0 !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-current {
      color: #8b92a0 !important;
      font-size: 0.75rem !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
    }
  `],
  template: `
    <div class="h-full flex flex-col space-y-6">
      <!-- Header Area -->
      <div class="card-industrial p-6 relative">
        <!-- Left: Branding & Info -->
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-ferre-50 flex items-center justify-center border border-[#2a2f38] shrink-0">
            <lucide-icon
              [name]="PackageSearch"
              class="text-ferre-600"
              size="32"
            ></lucide-icon>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h1 class="text-3xl font-extrabold text-white tracking-tight" style="font-family: Sora, sans-serif;">Inventario</h1>
              <span class="bg-ferre-50 text-ferre-600 text-[10px] px-2 py-0.5 rounded-full border border-[#2a2f38] font-bold tracking-widest">ML-READY</span>
            </div>
            <p class="text-steel-400 font-medium text-sm">
              <span class="text-white font-bold opacity-80">{{ products.length }}</span> productos activos en total.
            </p>
          </div>
        </div>

        <!-- Center: Search -->
        <div class="relative z-10 w-full max-w-md mx-auto">
          <div class="relative group/search">
            <lucide-icon [name]="Search" size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-steel-400 group-focus-within/search:text-ferre-600 transition-colors"></lucide-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              placeholder="Buscar producto o SKU..."
              class="w-full pl-12 pr-4 py-3.5 bg-[#13161c] border border-[#2a2f38] text-white rounded-2xl focus:ring-2 focus:ring-ferre-600/30 focus:border-ferre-600 transition-all placeholder-steel-400 outline-none shadow-inner"
            />
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="relative z-10 flex items-center justify-end gap-3">
          <button
            id="btn-vender-meli"
            (click)="onVenderMeLi()"
            class="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3.5 rounded-2xl font-extrabold shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 group/meli"
            title="Sincronizar con Mercado Libre"
          >
            <lucide-icon [name]="Globe" size="20" class="group-hover/meli:rotate-12 transition-transform"></lucide-icon>
            <span>Vender en MeLi</span>
          </button>
          <button
            routerLink="new"
            class="bg-gradient-to-r from-ferre-600 to-ferre-500 hover:from-ferre-500 hover:to-ferre-400 text-white px-6 py-3.5 rounded-2xl font-extrabold shadow-lg shadow-ferre-600/20 transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 group/plus"
          >
            <lucide-icon [name]="Plus" size="20" class="group-hover/plus:rotate-90 transition-transform"></lucide-icon>
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      <!-- Table Area -->
      <div
        class="flex-1 bg-[#1a1f27] rounded-xl border border-[#2a2f38] shadow-sm overflow-hidden"
      >
        <p-table
          [value]="products"
          [paginator]="true"
          [rows]="10"
          [loading]="loading"
          paginatorTemplate="PrevPageLink PageLinks NextPageLink CurrentPageReport"
          currentPageReportTemplate="Mostrando {totalRecords} productos"
          styleClass="p-datatable-dark custom-table"
        >
          <ng-template pTemplate="header">
            <tr class="bg-[#13161c]">
              <th class="px-6 py-4 font-extrabold text-steel-400 text-xs uppercase tracking-widest border-b border-[#2a2f38] w-24" style="font-family: Sora, sans-serif;">Miniatura</th>
              <th pSortableColumn="name" class="px-6 py-4 font-extrabold text-steel-400 text-xs uppercase tracking-widest border-b border-[#2a2f38]" style="font-family: Sora, sans-serif;">
                Producto <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th pSortableColumn="sku" class="px-6 py-4 font-extrabold text-steel-400 text-xs uppercase tracking-widest border-b border-[#2a2f38]" style="font-family: Sora, sans-serif;">
                SKU <p-sortIcon field="sku"></p-sortIcon>
              </th>
              <th pSortableColumn="price_retail" class="px-6 py-4 font-extrabold text-steel-400 text-xs uppercase tracking-widest border-b border-[#2a2f38]" style="font-family: Sora, sans-serif;">
                Precio Lista <p-sortIcon field="price_retail"></p-sortIcon>
              </th>
              <th pSortableColumn="stock_current" class="px-6 py-4 font-extrabold text-steel-400 text-xs uppercase tracking-widest border-b border-[#2a2f38]" style="font-family: Sora, sans-serif;">
                Stock <p-sortIcon field="stock_current"></p-sortIcon>
              </th>
              <th class="px-6 py-4 font-extrabold text-steel-400 text-xs uppercase tracking-widest border-b border-[#2a2f38] text-center" style="font-family: Sora, sans-serif;">Gestión</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-product>
            <tr class="group border-b border-concrete-100 hover:bg-white/5 transition-colors">
              <td class="px-6 py-4">
                <div class="w-14 h-14 rounded-2xl bg-[#13161c] flex items-center justify-center overflow-hidden border border-[#2a2f38] group-hover:border-concrete-300 transition-colors shadow-inner">
                  <img
                    *ngIf="product.image"
                    [src]="product.image"
                    [alt]="product.name"
                    class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <lucide-icon
                    *ngIf="!product.image"
                    [name]="PackageSearch"
                    class="text-steel-300"
                    size="24"
                  ></lucide-icon>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-bold text-white text-base group-hover:text-ferre-600 transition-colors">{{ product.name }}</span>
              </td>
              <td class="px-6 py-4 text-steel-400 font-mono text-xs uppercase tracking-tighter">
                {{ product.sku }}
              </td>
              <td class="px-6 py-4">
                <span class="font-extrabold text-ferre-600 text-lg" style="font-family: Sora, sans-serif;">$ {{ product.price_retail | number: "1.0-0" }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span
                    class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                    [ngClass]="{
                      'bg-rose-500/20 text-rose-400 border-rose-500/30': product.stock_current <= 5,
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30': product.stock_current > 5
                    }"
                  >
                    {{ product.stock_current }} uni.
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-3">
                  <button
                    [routerLink]="['/admin/products', product.id, 'edit']"
                    class="p-2 bg-concrete-100 hover:bg-concrete-200 text-steel-400 rounded-xl transition-all"
                    title="Editar Producto"
                  >
                    <lucide-icon [name]="Edit3" size="16"></lucide-icon>
                  </button>
                  <button
                    (click)="deleteProduct(product)"
                    class="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all"
                  >
                    <lucide-icon [name]="Trash2" size="16"></lucide-icon>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-24">
                <div class="flex flex-col items-center justify-center text-steel-400 space-y-4">
                  <div class="w-20 h-20 rounded-full bg-[#13161c] flex items-center justify-center">
                    <lucide-icon [name]="PackageSearch" size="40" class="opacity-20"></lucide-icon>
                  </div>
                  <p class="text-xl font-extrabold uppercase tracking-widest" style="font-family: Sora, sans-serif;">Sin coincidencias</p>
                  <p class="text-sm font-medium opacity-60">Intenta con otra descripción o código de barras.</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  api = inject(ApiService);
  router = inject(Router);
  products: any[] = [];
  loading = true;
  searchQuery = "";
  searchTimeout: any;

  // Icons
  Plus = Plus;
  Search = Search;
  Edit3 = Edit3;
  Trash2 = Trash2;
  PackageSearch = PackageSearch;
  Globe = Globe;
  RefreshCw = RefreshCw;

  isSyncing = false;

  ngOnInit() {
    console.log("ProductListComponent initialized");
    this.loadProducts();
    this.checkMeLiStatus();
  }

  checkMeLiStatus() {
    this.api.get<any>("/integrations/meli/auth-url/").subscribe({
      next: (res) => console.log("MeLi Linked Status:", res.is_linked),
      error: (err) => console.error("Error checking MeLi status in init", err)
    });
  }

  loadProducts() {
    this.loading = true;

    // Load products from API (PostgreSQL)
    this.api.get("/products/").subscribe(
      (response: any) => {
        const rawProducts = response.results || response;

        // Normalize image URLs
        this.products = rawProducts.map((p: any) => {
          if (p.image && !p.image.startsWith("http")) {
            p.image = `http://127.0.0.1:8000${p.image}`;
          }
          return p;
        });

        this.loading = false;
      },
      (error) => {
        console.error("Error loading products", error);
        this.products = [];
        this.loading = false;
      },
    );
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loading = true;

      // Search products from API with query parameter
      const params = this.searchQuery ? { search: this.searchQuery } : {};
      this.api.get("/products/", params).subscribe(
        (response: any) => {
          this.products = response.results || response;
          this.loading = false;
        },
        (error) => {
          console.error("Error searching products", error);
          this.products = [];
          this.loading = false;
        },
      );
    }, 500);
  }

  deleteProduct(product: any) {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      this.api.delete(`/products/${product.id}/`).subscribe(
        () => {
          this.loadProducts();
          alert("✅ Producto eliminado exitosamente");
        },
        (error) => {
          console.error("Error deleting product", error);
          alert(
            "Hubo un error al intentar eliminar el producto: " +
              error.error?.detail,
          );
        },
      );
    }
  }

  onVenderMeLi() {
    // 1. Check if account is linked
    this.api.get<any>("/integrations/meli/auth-url/").subscribe({
      next: (res: any) => {
        if (!res.is_linked) {
          if (confirm("⚠️ Tu cuenta de Mercado Libre no está vinculada. ¿Deseas vincularla ahora?")) {
            window.open(res.auth_url, "_blank");
          }
          return;
        }
        
        // 2. If linked, open the native publication page
        window.open("https://www.mercadolibre.com.ar/publicar", "_blank");
      },
      error: (err: any) => {
        console.error("Error checking MeLi status", err);
        alert("Error al verificar el estado de Mercado Libre. Inténtalo de nuevo.");
      }
    });
  }
}
