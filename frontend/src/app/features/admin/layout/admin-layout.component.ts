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
  Wrench,
} from "lucide-angular";


@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  styles: [`
    :host { display: block; }
    .sidebar-link {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.625rem 0.75rem; border-radius: 0.5rem;
      font-size: 0.875rem; font-weight: 500;
      color: rgba(255,255,255,0.55);
      border-left: 3px solid transparent;
      transition: all 0.15s;
    }
    .sidebar-link:hover {
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.9);
    }
    .sidebar-link.sidebar-active {
      background: rgba(212,94,8,0.12);
      color: #f09332;
      border-left-color: #d45e08;
    }
    .sidebar-link.sidebar-active lucide-icon { color: #d45e08; }
  `],
  template: `
    <div class="flex h-screen text-steel-200 font-sans" style="background: #13161c;">
      <!-- Mobile Overlay -->
      <div
        *ngIf="sidebarOpen"
        class="fixed inset-0 bg-black/50 z-30 lg:hidden"
        (click)="sidebarOpen = false"
      ></div>

      <!-- Sidebar -->
      <aside
        class="fixed lg:static inset-y-0 left-0 w-64 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen"
        [class.translate-x-0]="sidebarOpen"
        style="background: #0f1218; border-right: 3px solid #d45e08;"
      >
        <!-- Logo -->
        <div class="h-16 flex items-center gap-3 px-5" style="border-bottom: 1px solid #1e232c;">
          <div class="w-9 h-9 rounded-lg bg-ferre-600 flex items-center justify-center shadow-lg">
            <lucide-icon [name]="WrenchIcon" size="20" class="text-white"></lucide-icon>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-extrabold tracking-wider text-white uppercase" style="font-family: Sora, sans-serif;">
              Ferre<span class="text-ferre-400">Nexo</span>
            </span>
            <span class="text-[10px] font-bold text-steel-500 uppercase tracking-[0.15em]">Admin Panel</span>
          </div>
          <button (click)="sidebarOpen = false" class="lg:hidden p-1 text-steel-500 hover:text-white ml-auto">
            <lucide-icon [name]="X" size="18"></lucide-icon>
          </button>
        </div>

        <!-- Nav -->
        <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <a routerLink="/admin/dashboard" routerLinkActive="sidebar-active" [routerLinkActiveOptions]="{exact:true}"
            class="sidebar-link"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="LayoutDashboard" size="18"></lucide-icon>
            Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="sidebar-active"
            class="sidebar-link"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="Package" size="18"></lucide-icon>
            Productos
          </a>
          <a routerLink="/admin/pos" routerLinkActive="sidebar-active"
            class="sidebar-link"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="ShoppingCart" size="18"></lucide-icon>
            Generar Remitos
          </a>
          <a routerLink="/admin/orders" routerLinkActive="sidebar-active"
            class="sidebar-link"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="ClipboardList" size="18"></lucide-icon>
            Ordenes
          </a>
          <a routerLink="/admin/categories" routerLinkActive="sidebar-active"
            class="sidebar-link"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="Layers" size="18"></lucide-icon>
            Categorias
          </a>

          <div class="h-px my-3" style="background: #1e232c;"></div>

          <a routerLink="/admin/settings" routerLinkActive="sidebar-active"
            class="sidebar-link"
            (click)="closeSidebarOnMobile()">
            <lucide-icon [name]="Settings" size="18"></lucide-icon>
            Configuracion
          </a>
        </nav>

        <!-- Footer -->
        <div class="p-4" style="border-top: 1px solid #1e232c;">
          <button (click)="logout()" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-steel-500 hover:bg-white/5 hover:text-safety-red transition-all text-sm font-medium">
            <lucide-icon [name]="LogOut" size="18"></lucide-icon>
            Cerrar Sesion
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden">
        <!-- Top Header -->
        <div class="h-16 flex items-center justify-between px-4 lg:px-6 shrink-0" style="background: #1a1f27; border-bottom: 2px solid #2a2f38;">
          <div class="flex items-center gap-3">
            <button (click)="sidebarOpen = true" class="lg:hidden p-2 text-steel-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
              <lucide-icon [name]="MenuIcon" size="20"></lucide-icon>
            </button>
            <h1 class="text-xs font-bold text-steel-500 uppercase tracking-[0.18em]">
              Consola de Administracion
            </h1>
          </div>
          <div class="flex items-center gap-3">
            <a routerLink="/" class="flex items-center gap-2 px-4 py-2 rounded-lg text-steel-400 hover:bg-white/5 hover:text-ferre-400 transition-all text-sm font-bold" style="border: 1px solid #2a2f38;">
              <lucide-icon [name]="Home" size="16"></lucide-icon>
              <span class="hidden sm:inline">Ver Tienda</span>
            </a>
          </div>
        </div>
        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto w-full" style="background: #13161c;">
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
  WrenchIcon = Wrench;

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

