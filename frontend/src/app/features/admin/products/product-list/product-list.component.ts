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
      background: #f8f9fa !important; /* concrete-50 */
      color: #64748b !important; /* steel-500 */
      border-bottom: 1px solid #e5e7eb !important; /* concrete-200 */
      padding: 1.25rem 1.5rem !important;
      font-size: 0.75rem !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr {
      background: transparent !important;
      color: #334155 !important; /* steel-700 */
      transition: all 0.3s !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr:hover {
      background: rgba(13, 110, 253, 0.05) !important; /* ferre-50/50 */
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr > td {
      border-bottom: 1px solid #f1f5f9 !important; /* concrete-100 */
      padding: 1.25rem 1.5rem !important;
      background: transparent !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator {
      background: #ffffff !important;
      border: none !important;
      border-top: 1px solid #f1f5f9 !important; /* concrete-100 */
      color: #64748b !important; /* steel-500 */
      padding: 1rem !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page {
      color: #64748b !important; /* steel-500 */
      background: transparent !important;
      border: 1px solid #f1f5f9 !important; /* concrete-100 */
      border-radius: 0.75rem !important;
      min-width: 2.25rem !important;
      height: 2.25rem !important;
      margin: 0 0.25rem !important;
      transition: all 0.2s !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page:hover {
      background: rgba(13, 110, 253, 0.08) !important;
      border-color: rgba(13, 110, 253, 0.2) !important;
      color: #0d6efd !important; /* ferre-600 */
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
      background: #0d6efd !important; /* ferre-600 */
      color: #ffffff !important;
      border-color: #0d6efd !important;
      font-weight: 800 !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-link {
      color: #64748b !important; /* steel-500 */
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-current {
      color: #64748b !important; /* steel-500 */
      font-size: 0.75rem !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
    }
  `],
  template: `
    <div class="h-full flex flex-col space-y-8 animate-in">
      <!-- Header Area -->
      <div
        class="grid grid-cols-1 lg:grid-cols-3 items-center gap-8 bg-white p-8 rounded-xl border border-concrete-200 shadow-sm relative group"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-ferre-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"></div>
        
        <!-- Left: Branding & Info -->
        <div class="relative z-10 flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-ferre-50 flex items-center justify-center border border-concrete-200 shrink-0">
            <lucide-icon
              [name]="PackageSearch"
              class="text-ferre-600"
              size="32"
            ></lucide-icon>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h1 class="text-3xl font-extrabold text-steel-900 tracking-tight" style="font-family: Sora, sans-serif;">Inventario</h1>
              <span class="bg-ferre-50 text-ferre-600 text-[10px] px-2 py-0.5 rounded-full border border-concrete-200 font-bold tracking-widest">ML-READY</span>
            </div>
            <p class="text-steel-500 font-medium text-sm">
              <span class="text-steel-900 font-bold opacity-80">{{ products.length }}</span> productos activos en total.
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
              class="w-full pl-12 pr-4 py-3.5 bg-concrete-50 border border-concrete-200 text-steel-900 rounded-2xl focus:ring-2 focus:ring-ferre-600/30 focus:border-ferre-600 transition-all placeholder-steel-400 outline-none shadow-inner"
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
        class="flex-1 bg-white rounded-xl border border-concrete-200 shadow-sm overflow-hidden"
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
            <tr class="bg-concrete-50">
              <th class="px-6 py-4 font-extrabold text-steel-500 text-xs uppercase tracking-widest border-b border-concrete-200 w-24" style="font-family: Sora, sans-serif;">Miniatura</th>
              <th pSortableColumn="name" class="px-6 py-4 font-extrabold text-steel-500 text-xs uppercase tracking-widest border-b border-concrete-200" style="font-family: Sora, sans-serif;">
                Producto <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th pSortableColumn="sku" class="px-6 py-4 font-extrabold text-steel-500 text-xs uppercase tracking-widest border-b border-concrete-200" style="font-family: Sora, sans-serif;">
                SKU <p-sortIcon field="sku"></p-sortIcon>
              </th>
              <th pSortableColumn="price_retail" class="px-6 py-4 font-extrabold text-steel-500 text-xs uppercase tracking-widest border-b border-concrete-200" style="font-family: Sora, sans-serif;">
                Precio Lista <p-sortIcon field="price_retail"></p-sortIcon>
              </th>
              <th pSortableColumn="stock_current" class="px-6 py-4 font-extrabold text-steel-500 text-xs uppercase tracking-widest border-b border-concrete-200" style="font-family: Sora, sans-serif;">
                Stock <p-sortIcon field="stock_current"></p-sortIcon>
              </th>
              <th class="px-6 py-4 font-extrabold text-steel-500 text-xs uppercase tracking-widest border-b border-concrete-200 text-center" style="font-family: Sora, sans-serif;">Gestión</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-product>
            <tr class="group border-b border-concrete-100 hover:bg-concrete-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="w-14 h-14 rounded-2xl bg-concrete-50 flex items-center justify-center overflow-hidden border border-concrete-200 group-hover:border-concrete-300 transition-colors shadow-inner">
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
                <span class="font-bold text-steel-900 text-base group-hover:text-ferre-600 transition-colors">{{ product.name }}</span>
              </td>
              <td class="px-6 py-4 text-steel-500 font-mono text-xs uppercase tracking-tighter">
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
                    class="p-2 bg-concrete-100 hover:bg-concrete-200 text-steel-500 rounded-xl transition-all"
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
                  <div class="w-20 h-20 rounded-full bg-concrete-50 flex items-center justify-center">
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
