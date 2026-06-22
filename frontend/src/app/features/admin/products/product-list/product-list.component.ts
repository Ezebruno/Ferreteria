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
      background: rgba(15, 23, 42, 0.6) !important; /* slate-950/60 */
      color: #94a3b8 !important; /* slate-400 */
      border-bottom: 1px solid rgba(239, 68, 68, 0.2) !important; /* red-500/20 */
      padding: 1.25rem 1.5rem !important;
      font-size: 0.75rem !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr {
      background: transparent !important;
      color: #cbd5e1 !important; /* slate-300 */
      transition: all 0.3s !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr:hover {
      background: rgba(239, 68, 68, 0.03) !important; /* light red highlight on hover */
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr > td {
      border-bottom: 1px solid rgba(239, 68, 68, 0.1) !important; /* red-500/10 */
      padding: 1.25rem 1.5rem !important;
      background: transparent !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator {
      background: rgba(15, 23, 42, 0.4) !important;
      border: none !important;
      border-top: 1px solid rgba(239, 68, 68, 0.15) !important;
      color: #94a3b8 !important;
      padding: 1rem !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page {
      color: #94a3b8 !important;
      background: transparent !important;
      border: 1px solid rgba(239, 68, 68, 0.1) !important;
      border-radius: 0.75rem !important;
      min-width: 2.25rem !important;
      height: 2.25rem !important;
      margin: 0 0.25rem !important;
      transition: all 0.2s !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page:hover {
      background: rgba(239, 68, 68, 0.1) !important;
      border-color: rgba(239, 68, 68, 0.3) !important;
      color: white !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
      background: #ef4444 !important; /* red-500 */
      color: #000000 !important;
      border-color: #ef4444 !important;
      font-weight: 900 !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-link {
      color: #94a3b8 !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-current {
      color: #64748b !important; /* slate-500 */
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
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-800/40 backdrop-blur-xl p-8 rounded-3xl border border-red-500/20 shadow-2xl relative overflow-hidden group"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        
        <div class="relative z-10 flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <lucide-icon
              [name]="PackageSearch"
              class="text-red-500"
              size="32"
            ></lucide-icon>
          </div>
          <div>
            <h1 class="text-3xl font-black text-white tracking-tight">Inventario Global</h1>
            <p class="text-slate-400 font-medium mt-1">
              Control total sobre {{ products.length }} productos activos.
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
          <div class="relative group/search flex-1">
            <lucide-icon [name]="Search" size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-red-500 transition-colors"></lucide-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              placeholder="Buscar producto o SKU..."
              class="w-full md:w-80 pl-12 pr-4 py-3.5 bg-slate-800/50 border border-red-500/30 text-white rounded-2xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-slate-600 outline-none"
            />
          </div>
          <button
            routerLink="new"
            class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-black px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
          >
            <lucide-icon [name]="Plus" size="20"></lucide-icon>
            Nuevo Producto
          </button>
        </div>
      </div>

      <!-- Table Area -->
      <div
        class="flex-1 bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-red-500/20 shadow-2xl overflow-hidden"
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
            <tr class="bg-white/5">
              <th class="px-6 py-4 font-black text-slate-400 text-xs uppercase tracking-widest border-b border-red-500/20 w-24">Miniatura</th>
              <th pSortableColumn="name" class="px-6 py-4 font-black text-slate-400 text-xs uppercase tracking-widest border-b border-red-500/20">
                Producto <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th pSortableColumn="sku" class="px-6 py-4 font-black text-slate-400 text-xs uppercase tracking-widest border-b border-red-500/20">
                SKU <p-sortIcon field="sku"></p-sortIcon>
              </th>
              <th pSortableColumn="price_retail" class="px-6 py-4 font-black text-slate-400 text-xs uppercase tracking-widest border-b border-red-500/20">
                Precio Lista <p-sortIcon field="price_retail"></p-sortIcon>
              </th>
              <th pSortableColumn="stock_current" class="px-6 py-4 font-black text-slate-400 text-xs uppercase tracking-widest border-b border-red-500/20">
                Stock <p-sortIcon field="stock_current"></p-sortIcon>
              </th>
              <th class="px-6 py-4 font-black text-slate-400 text-xs uppercase tracking-widest border-b border-red-500/20 text-center">Gestión</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-product>
            <tr class="group border-b border-red-500/20 hover:bg-white/[0.02] transition-colors">
              <td class="px-6 py-4">
                <div class="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center overflow-hidden border border-red-500/20 group-hover:border-red-500/30 transition-colors shadow-inner">
                  <img
                    *ngIf="product.image"
                    [src]="product.image"
                    [alt]="product.name"
                    class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <lucide-icon
                    *ngIf="!product.image"
                    [name]="PackageSearch"
                    class="text-slate-700"
                    size="24"
                  ></lucide-icon>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-bold text-white text-base group-hover:text-red-400 transition-colors">{{ product.name }}</span>
              </td>
              <td class="px-6 py-4 text-slate-500 font-mono text-xs uppercase tracking-tighter">
                {{ product.sku }}
              </td>
              <td class="px-6 py-4">
                <span class="font-black text-red-500 text-lg">$ {{ product.price_retail | number: "1.0-0" }}</span>
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
                    (click)="syncWithMeLi(product)"
                    class="w-10 h-10 rounded-xl bg-white/5 border transition-all flex items-center justify-center p-0"
                    [ngClass]="{
                      'border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white': !product.meli_item_id,
                      'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white': product.meli_item_id
                    }"
                    [title]="product.meli_item_id ? 'Sincronizar Stock/Precio' : 'Publicar en MeLi'"
                  >
                    <lucide-icon [name]="product.meli_item_id ? RefreshCw : Globe" size="18"></lucide-icon>
                  </button>
                  <button
                    [routerLink]="[product.id, 'edit']"
                    class="w-10 h-10 rounded-xl bg-white/5 border border-red-500/20 text-slate-300 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all flex items-center justify-center"
                    title="Editar"
                  >
                    <lucide-icon [name]="Edit3" size="18"></lucide-icon>
                  </button>
                  <button
                    (click)="deleteProduct(product.id)"
                    class="w-10 h-10 rounded-xl bg-white/5 border border-red-500/20 text-slate-300 hover:text-white hover:bg-rose-600 hover:border-rose-600 transition-all flex items-center justify-center"
                    title="Eliminar"
                  >
                    <lucide-icon [name]="Trash2" size="18"></lucide-icon>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-24">
                <div class="flex flex-col items-center justify-center text-slate-600 space-y-4">
                  <div class="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <lucide-icon [name]="PackageSearch" size="40" class="opacity-20"></lucide-icon>
                  </div>
                  <p class="text-xl font-black uppercase tracking-widest">Sin coincidencias</p>
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
    this.loadProducts();
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

  deleteProduct(id: number) {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      this.api.delete(`/products/${id}/`).subscribe(
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

  syncWithMeLi(product: any) {
    if (this.isSyncing) return;

    if (!product.meli_item_id && !product.meli_category_id) {
      alert("⚠️ Falta configurar la Categoría MeLi para este producto. Por favor edítalo primero.");
      this.router.navigate(['/admin/products', product.id, 'edit']);
      return;
    }

    this.isSyncing = true;
    this.api.post(`/integrations/meli/sync/${product.id}/`, {}).subscribe({
      next: (res: any) => {
        this.isSyncing = false;
        alert(`✅ ${res.message || 'Sincronización exitosa'}`);
        if (res.url) {
          window.open(res.url, '_blank');
        }
        this.loadProducts();
      },
      error: (err) => {
        this.isSyncing = false;
        const msg = err.error?.detail || JSON.stringify(err.error) || 'Error desconocido';
        alert(`❌ Error al sincronizar: ${msg}`);
      }
    });
  }
}
