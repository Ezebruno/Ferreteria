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
import { MarketplacePublishComponent } from "../marketplace-publish/marketplace-publish.component";

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
    MarketplacePublishComponent,
  ],
  styles: [`
    @media (max-width: 768px) {
      .flex.items-center.justify-between {
        flex-wrap: wrap;
        gap: 1rem;
      }
      .flex.items-center.justify-between > :first-child {
        width: 100%;
      }
      .flex.items-center.justify-between > .max-w-md {
        order: 3;
        width: 100%;
        max-width: 100% !important;
      }
      .flex.items-center.justify-between > :last-child {
        order: 2;
        margin-left: auto;
      }
    }

    :host ::ng-deep .p-datatable-dark.p-datatable {
      background: transparent !important;
    }
    
    :host ::ng-deep .p-datatable-dark .p-datatable-wrapper {
      background: transparent !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-thead > tr > th {
      background: #f8fafc !important;
      color: #64748b !important;
      border-bottom: 2px solid #e2e8f0 !important;
      padding: 1rem 1.25rem !important;
      font-size: 0.7rem !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.08em !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr {
      background: transparent !important;
      color: #0f172a !important;
      transition: all 0.15s !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr:hover {
      background: rgba(0,0,0,0.02) !important;
    }

    :host ::ng-deep .p-datatable-dark .p-datatable-tbody > tr > td {
      border-bottom: 1px solid #e2e8f0 !important;
      padding: 1rem 1.25rem !important;
      background: transparent !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator {
      background: #f8fafc !important;
      border: none !important;
      border-top: 2px solid #e2e8f0 !important;
      color: #64748b !important;
      padding: 1rem !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page {
      color: #64748b !important;
      background: transparent !important;
      border: 1.5px solid #e2e8f0 !important;
      border-radius: 0.375rem !important;
      min-width: 2.25rem !important;
      height: 2.25rem !important;
      margin: 0 0.25rem !important;
      transition: all 0.2s !important;
      font-weight: 700 !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page:hover {
      background: rgba(255, 230, 0, 0.06) !important;
      border-color: #ffe600 !important;
      color: #a67000 !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
      background: #ffe600 !important;
      color: #1e293b !important;
      border-color: #ffe600 !important;
      font-weight: 800 !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-link {
      color: #64748b !important;
    }

    :host ::ng-deep .p-datatable-dark .p-paginator .p-paginator-current {
      color: #64748b !important;
      font-size: 0.75rem !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
    }
  `],
  template: `
    <div class="h-full flex flex-col space-y-6">
      <!-- Header Area -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6 relative">
        <div class="flex items-center justify-between gap-6">
          <!-- Left: Branding & Info -->
          <div class="flex items-center gap-4 shrink-0">
            <div class="w-14 h-14 rounded-2xl bg-ferre-50 flex items-center justify-center border border-slate-200 shrink-0">
              <lucide-icon
                [name]="PackageSearch"
                class="text-amber-700"
                size="32"
              ></lucide-icon>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight" style="font-family: Sora, sans-serif;">Inventario</h1>
                <span class="bg-ferre-50 text-amber-800 text-[10px] px-2 py-0.5 rounded-full border border-slate-200 font-bold tracking-widest">ML-READY</span>
              </div>
              <p class="text-slate-500 font-medium text-sm">
                <span class="text-slate-900 font-bold opacity-80">{{ products.length }}</span> productos activos en total.
              </p>
            </div>
          </div>

          <!-- Center: Search -->
          <div class="relative z-10 w-full max-w-md">
            <div class="relative group/search">
              <lucide-icon [name]="Search" size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-ferre-400 transition-colors"></lucide-icon>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="onSearch()"
                placeholder="Buscar producto o SKU..."
                class="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl focus:ring-2 focus:ring-ferre-400/30 focus:border-ferre-400 transition-all placeholder-slate-400 outline-none shadow-sm"
              />
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="relative z-10 flex items-center gap-3 shrink-0">
            <button
              routerLink="new"
              class="bg-ferre-400 hover:bg-ferre-500 text-slate-800 px-6 py-3.5 rounded-2xl font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 group/plus"
            >
              <lucide-icon [name]="Plus" size="20" class="group-hover/plus:rotate-90 transition-transform"></lucide-icon>
              <span>Agregar Producto</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Area -->
      <div
        class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
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
            <tr class="bg-slate-50">
              <th class="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200 w-24" style="font-family: Sora, sans-serif;">Miniatura</th>
              <th pSortableColumn="name" class="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200" style="font-family: Sora, sans-serif;">
                Producto <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th pSortableColumn="sku" class="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200" style="font-family: Sora, sans-serif;">
                SKU <p-sortIcon field="sku"></p-sortIcon>
              </th>
              <th pSortableColumn="price_retail" class="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200" style="font-family: Sora, sans-serif;">
                Precio Lista <p-sortIcon field="price_retail"></p-sortIcon>
              </th>
              <th pSortableColumn="stock_current" class="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200" style="font-family: Sora, sans-serif;">
                Stock <p-sortIcon field="stock_current"></p-sortIcon>
              </th>
              <th class="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200 text-center" style="font-family: Sora, sans-serif;">Publicar</th>
              <th class="px-6 py-4 font-extrabold text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200 text-center" style="font-family: Sora, sans-serif;">Gestión</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-product>
            <tr class="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-slate-300 transition-colors">
                  <img
                    *ngIf="product.image"
                    [src]="product.image"
                    [alt]="product.name"
                    class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <lucide-icon
                    *ngIf="!product.image"
                    [name]="PackageSearch"
                    class="text-slate-400"
                    size="24"
                  ></lucide-icon>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-bold text-slate-900 text-base group-hover:text-ferre-400 transition-colors">{{ product.name }}</span>
              </td>
              <td class="px-6 py-4 text-slate-500 font-mono text-xs uppercase tracking-tighter">
                {{ product.sku }}
              </td>
              <td class="px-6 py-4">
                <span class="font-extrabold text-amber-700 text-lg" style="font-family: Sora, sans-serif;">$ {{ product.price_retail | number: "1.0-0" }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span
                    class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                    [ngClass]="{
                      'bg-red-50 text-red-600 border-red-200': product.stock_current <= 5,
                      'bg-emerald-50 text-emerald-700 border-emerald-200': product.stock_current > 5
                    }"
                  >
                    {{ product.stock_current }} uni.
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center">
                  <app-marketplace-publish [productId]="product.id"></app-marketplace-publish>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-3">
                  <button
                    [routerLink]="['/admin/products', product.id, 'edit']"
                    class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
                    title="Editar Producto"
                  >
                    <lucide-icon [name]="Edit3" size="16"></lucide-icon>
                  </button>
                  <button
                    (click)="deleteProduct(product)"
                    class="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                  >
                    <lucide-icon [name]="Trash2" size="16"></lucide-icon>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center py-24">
                <div class="flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <div class="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                    <lucide-icon [name]="PackageSearch" size="40" class="opacity-30 text-slate-400"></lucide-icon>
                  </div>
                  <p class="text-xl font-extrabold uppercase tracking-widest text-slate-600" style="font-family: Sora, sans-serif;">Sin coincidencias</p>
                  <p class="text-sm font-medium opacity-60">Intenta con otra descripcion o codigo de barras.</p>
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

    this.api.get("/products/").subscribe(
      (response: any) => {
        const rawProducts = response.results || response;

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
          alert("Producto eliminado exitosamente");
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
    this.api.get<any>("/integrations/meli/auth-url/").subscribe({
      next: (res: any) => {
        if (!res.is_linked) {
          if (confirm("Tu cuenta de Mercado Libre no esta vinculada. Deseas vincularla ahora?")) {
            window.open(res.auth_url, "_blank");
          }
          return;
        }
        
        window.open("https://www.mercadolibre.com.ar/publicar", "_blank");
      },
      error: (err: any) => {
        console.error("Error checking MeLi status", err);
        alert("Error al verificar el estado de Mercado Libre. Intentelo de nuevo.");
      }
    });
  }
}
