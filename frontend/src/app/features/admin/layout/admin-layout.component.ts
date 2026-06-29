// Layout principal del panel admin: header, sidebar y contenido
// Navegón entre secciónes del administrador (dashboard, productos, pos)
import { Component, inject, OnInit } from "@angular/core";
import { ApiService } from "src/app/core/services/api.service";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import {
  LucideAngularModule,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Settings,
  LogOut,
  Home,
  Layers,
  Globe,
  Menu,
  X,
} from "lucide-angular";


@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  styles: [`
    :host { display: block; }
  `],
  template: `
    <div class="flex h-screen bg-concrete-50 text-steel-800 font-sans">
      <!-- Mobile Overlay -->
      <div
        *ngIf="sidebarOpen"
        class="fixed inset-0 bg-black/30 z-30 lg:hidden"
        (click)="sidebarOpen = false"
      ></div>

      <!-- Sidebar -->
      <aside
        class="fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-concrete-200 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen"
        [class.translate-x-0]="sidebarOpen"
      >
        <div class="h-16 flex items-center justify-between px-5 border-b border-concrete-100">
          <span class="text-lg font-extrabold tracking-tight text-steel-900" style="font-family: Sora, sans-serif;">
            Ferre<span class="text-ferre-600">Nexo</span>
          </span>
          <button (click)="sidebarOpen = false" class="lg:hidden p-1 text-steel-400 hover:text-steel-700">
            <lucide-icon [name]="X" size="18"></lucide-icon>
          </button>
        </div>

        <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-ferre-50 text-ferre-700 border-ferre-200" [routerLinkActiveOptions]="{exact:true}"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent transition-all hover:bg-concrete-50 hover:text-steel-900 text-sm font-medium"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="LayoutDashboard" size="18"></lucide-icon>
            Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="bg-ferre-50 text-ferre-700 border-ferre-200"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent transition-all hover:bg-concrete-50 hover:text-steel-900 text-sm font-medium"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="Package" size="18"></lucide-icon>
            Productos
          </a>
          <a routerLink="/admin/pos" routerLinkActive="bg-ferre-50 text-ferre-700 border-ferre-200"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent transition-all hover:bg-concrete-50 hover:text-steel-900 text-sm font-medium"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="ShoppingCart" size="18"></lucide-icon>
            Generar Remitos
          </a>
          <a routerLink="/admin/orders" routerLinkActive="bg-ferre-50 text-ferre-700 border-ferre-200"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent transition-all hover:bg-concrete-50 hover:text-steel-900 text-sm font-medium"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="ClipboardList" size="18"></lucide-icon>
            Ordenes
          </a>
          <a routerLink="/admin/categories" routerLinkActive="bg-ferre-50 text-ferre-700 border-ferre-200"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent transition-all hover:bg-concrete-50 hover:text-steel-900 text-sm font-medium"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="Layers" size="18"></lucide-icon>
            Categorias
          </a>

          <div class="h-px bg-concrete-100 my-2"></div>

          <a routerLink="/admin/settings" routerLinkActive="bg-ferre-50 text-ferre-700 border-ferre-200"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent transition-all hover:bg-concrete-50 hover:text-steel-900 text-sm font-medium"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="Settings" size="18"></lucide-icon>
            Configuracion
          </a>
        </nav>

        <div class="p-4 border-t border-concrete-100">
          <button (click)="logout()" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-steel-500 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium">
            <lucide-icon [name]="LogOut" size="18"></lucide-icon>
            Cerrar Sesion
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden">
        <!-- Top Header -->
        <div class="h-16 bg-white border-b border-concrete-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div class="flex items-center gap-3">
            <button (click)="sidebarOpen = true" class="lg:hidden p-2 text-steel-500 hover:text-steel-900 rounded-lg hover:bg-concrete-50 transition-all">
              <lucide-icon [name]="MenuIcon" size="20"></lucide-icon>
            </button>
            <h1 class="text-sm font-bold text-steel-600 uppercase tracking-wide">
              Consola de Administracion
            </h1>
          </div>
          <div class="flex items-center gap-3">
            <a routerLink="/" class="flex items-center gap-2 px-3 py-2 rounded-lg text-steel-500 hover:bg-concrete-50 hover:text-steel-900 transition-all text-sm font-medium">
              <lucide-icon [name]="Home" size="16"></lucide-icon>
              <span class="hidden sm:inline">Ver Tienda</span>
            </a>
          </div>
        </div>
        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto w-full">
          <div class="max-w-7xl mx-auto p-4 lg:p-6">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  router = inject(Router);
  api = inject(ApiService);

  tenantName: string = "FerreNexo";
  sidebarOpen = false;

  LayoutDashboard = LayoutDashboard;
  Package = Package;
  ShoppingCart = ShoppingCart;
  ClipboardList = ClipboardList;
  Settings = Settings;
  Layers = Layers;
  Globe = Globe;
  LogOut = LogOut;
  MenuIcon = Menu;
  X = X;

  Home = Home;

  ngOnInit() {
    this.api.get<any>('/auth/profile/').subscribe({
      next: (res) => {
        this.tenantName = res.tenant_name || "FerreNexo";
      },
      error: () => {
        this.tenantName = "FerreNexo";
      }
    });
  }

  closeSidebarOnMobile(): void {
    // Close sidebar only on mobile (< lg breakpoint = 1024px)
    if (window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
  }

  logout(): void {
    // Clear the auth token from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // Navigate to store home instead of login
    this.router.navigate(["/"]);
  }
}

