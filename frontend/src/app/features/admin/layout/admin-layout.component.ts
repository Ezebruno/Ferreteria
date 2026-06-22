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
  styles: [
    `
    .bg-grid-pattern {
      background-image: linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.03) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.03) 75%, rgba(255, 255, 255, 0.03) 76%, transparent 77%, transparent),
                        linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.03) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.03) 75%, rgba(255, 255, 255, 0.03) 76%, transparent 77%, transparent);
      background-size: 40px 40px;
    }

    @keyframes blob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }

    .animate-blob {
      animation: blob 7s infinite;
    }

    .animation-delay-2000 {
      animation-delay: 2s;
    }
    `
  ],
  template: `
    <div class="flex h-screen bg-slate-900 text-slate-100 font-sans relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <div class="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] animate-blob"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      <!-- Mobile Overlay -->
      <div
        *ngIf="sidebarOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        (click)="sidebarOpen = false"
      ></div>

      <!-- Sidebar -->
      <aside
        class="fixed lg:static inset-y-0 left-0 w-64 bg-slate-800/80 backdrop-blur-2xl text-slate-400 flex flex-col border-r border-red-500/20 z-40 transition-transform duration-300 lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen"
        [class.translate-x-0]="sidebarOpen"
      >
        <div
          class="h-16 lg:h-20 flex items-center justify-between px-6 lg:px-8 border-b border-red-500/20"
        >
          <span
            class="text-xl font-black text-white tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-500"
          >
            {{ tenantName }}
          </span>
          <button
            (click)="sidebarOpen = false"
            class="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <lucide-icon [name]="X" size="20"></lucide-icon>
          </button>
        </div>

        <nav class="flex-1 py-6 lg:py-8 px-4 space-y-2 overflow-y-auto">
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]"
            class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 hover:text-white group relative overflow-hidden"
            (click)="closeSidebarOnMobile()"
          >
            <lucide-icon
              [name]="LayoutDashboard"
              size="20"
              class="group-hover:scale-110 transition-transform"
            ></lucide-icon>
            <span class="font-bold">Dashboard</span>
          </a>

          <a
            routerLink="/admin/products"
            routerLinkActive="bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]"
            class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 hover:text-white group relative overflow-hidden"
            (click)="closeSidebarOnMobile()"
          >
            <lucide-icon
              [name]="Package"
              size="20"
              class="group-hover:scale-110 transition-transform"
            ></lucide-icon>
            <span class="font-bold">Productos</span>
          </a>

          <a
            routerLink="/admin/pos"
            routerLinkActive="bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]"
            class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 hover:text-white group relative overflow-hidden"
            (click)="closeSidebarOnMobile()"
          >
            <lucide-icon
              [name]="ShoppingCart"
              size="20"
              class="group-hover:scale-110 transition-transform"
            ></lucide-icon>
            <span class="font-bold">Generar Remitos</span>
          </a>

          <a
            routerLink="/admin/orders"
            routerLinkActive="bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]"
            class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 hover:text-white group relative overflow-hidden"
            (click)="closeSidebarOnMobile()"
          >
            <lucide-icon
              [name]="ClipboardList"
              size="20"
              class="group-hover:scale-110 transition-transform"
            ></lucide-icon>
            <span class="font-bold">Órdenes</span>
          </a>
          <a
            routerLink="/admin/categories"
            routerLinkActive="bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]"
            class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 hover:text-white group relative overflow-hidden"
            (click)="closeSidebarOnMobile()"
          >
            <lucide-icon
              [name]="Layers"
              size="20"
              class="group-hover:scale-110 transition-transform"
            ></lucide-icon>
            <span class="font-bold">Categorías</span>
          </a>

          <div class="h-px w-full bg-white/5 my-2"></div>

          <a
            routerLink="/admin/settings"
            routerLinkActive="bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]"
            class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 hover:text-white group relative overflow-hidden"
            (click)="closeSidebarOnMobile()"
          >
            <lucide-icon
              [name]="Settings"
              size="20"
              class="group-hover:scale-110 transition-transform text-slate-400"
            ></lucide-icon>
            <span class="font-bold">Configuración</span>
          </a>
        </nav>


        <div class="p-4 lg:p-6 border-t border-red-500/20 text-xs text-slate-500">
          <p>© 2026 FerreNexo Admin - Powered by VectraWeb</p>
        </div>
      </aside>

      <!-- Main Content -->
      <main
        class="flex-1 flex flex-col h-screen overflow-hidden z-10"
      >
        <!-- Top Header -->
        <div
          class="h-16 lg:h-20 bg-slate-800/40 backdrop-blur-md border-b border-red-500/20 flex items-center justify-between px-4 lg:px-8"
        >
          <div class="flex items-center gap-3">
            <button
              (click)="sidebarOpen = true"
              class="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <lucide-icon [name]="MenuIcon" size="24"></lucide-icon>
            </button>
            <h1 class="text-sm lg:text-xl font-black text-white uppercase tracking-wider">
              Consola de Administración
            </h1>
          </div>
          <div class="flex items-center gap-4">
            <button
              (click)="logout()"
              class="flex items-center gap-2 px-4 lg:px-8 py-2 lg:py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-black font-black hover:from-red-400 hover:to-red-500 transition-all shadow-lg shadow-red-500/30 transform hover:scale-105 active:scale-95 group text-sm lg:text-base"
            >
              <lucide-icon [name]="LogOut" size="20" class="group-hover:rotate-12 transition-transform"></lucide-icon>
              <span class="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div class="max-w-7xl mx-auto p-4 lg:p-8">
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

  tenantName: string = "Cargando...";
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

