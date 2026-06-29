// Componente de login: formulario de autenticación de usuarios
// Valida credenciales y almacena token JWT
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "src/app/core/services/api.service";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  LucideAngularModule,
  LogIn,
  Lock,
  Mail,
  ArrowLeft,
  Wrench,
} from "lucide-angular";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-steel-950 flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Textura de fondo -->
      <div class="absolute inset-0 opacity-[0.04]" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 3px);"></div>
      <!-- Linea naranja superior -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-ferre-600"></div>
      <!-- Linea de advertencia decorativa -->
      <div class="absolute bottom-0 left-0 right-0 warning-stripe"></div>

      <!-- Back to Store Button -->
      <button
        (click)="goHome()"
        class="absolute top-6 left-6 z-20 text-steel-400 hover:text-ferre-400 flex items-center gap-2 transition-colors text-sm font-medium"
      >
        <lucide-icon [name]="ArrowLeft" size="18"></lucide-icon>
        Volver a la tienda
      </button>

      <!-- Login Card -->
      <div class="z-10 w-full max-w-md p-8 relative" style="background: white; border: 2px solid #dddbd3; border-radius: 0.5rem; box-shadow: 0 25px 60px rgba(0,0,0,0.5);">
        <!-- Tornillos decorativos -->
        <div class="absolute top-3 left-3 screw"></div>
        <div class="absolute top-3 right-3 screw"></div>
        <div class="absolute bottom-3 left-3 screw"></div>
        <div class="absolute bottom-3 right-3 screw"></div>

        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-lg bg-ferre-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <lucide-icon [name]="LockIcon" size="28" class="text-white"></lucide-icon>
          </div>
          <span
            class="text-2xl font-extrabold tracking-wider uppercase text-steel-900"
            style="font-family: Sora, sans-serif;"
          >
            Ferre<span class="text-ferre-600">Nexo</span>
          </span>
          <p class="text-steel-500 mt-1 text-sm font-medium uppercase tracking-[0.15em]">Panel de Administracion</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-steel-500 uppercase tracking-wider ml-1">Correo Electronico</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <lucide-icon [name]="Mail" size="18" class="text-steel-400"></lucide-icon>
              </div>
              <input
                formControlName="email"
                type="email"
                class="w-full pl-11 pr-4 py-3 bg-concrete-50 border border-concrete-200 text-steel-900 rounded-lg focus:ring-2 focus:ring-ferre-500/20 focus:border-ferre-500 transition-all placeholder-steel-400 text-sm"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-steel-500 uppercase tracking-wider ml-1">Contrasena</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <lucide-icon [name]="Lock" size="18" class="text-steel-400"></lucide-icon>
              </div>
              <input
                formControlName="password"
                type="password"
                class="w-full pl-11 pr-4 py-3 bg-concrete-50 border border-concrete-200 text-steel-900 rounded-lg focus:ring-2 focus:ring-ferre-500/20 focus:border-ferre-500 transition-all placeholder-steel-400 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div
            *ngIf="error"
            class="bg-safety-red/10 border border-safety-red/30 text-safety-red p-3 rounded-lg text-sm text-center font-medium"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            (click)="onSubmit()"
            [disabled]="loading"
            class="w-full bg-ferre-600 hover:bg-ferre-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm uppercase tracking-wider"
          >
            <lucide-icon *ngIf="!loading" [name]="LogIn" size="18"></lucide-icon>
            <div *ngIf="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {{ loading ? "Verificando..." : "Entrar" }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  api = inject(ApiService);
  router = inject(Router);
  fb = inject(FormBuilder);

  LogIn = LogIn;
  Lock = Lock;
  Mail = Mail;
  ArrowLeft = ArrowLeft;
  LockIcon = Wrench;

  loginForm: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required],
  });

  loading = false;
  error = "";

  onSubmit() {
    if (this.loginForm.invalid) {
      this.error = "Por favor ingresa un correo válido y tu contraseña.";
      return;
    }
    this.loading = true;
    this.error = "";

    const { email, password } = this.loginForm.value;

    this.api.post<any>("/auth/login/", { email, password }).subscribe({
      next: (response) => {
        // Guardar tokens reales devueltos por SimpleJWT
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_role", "admin"); // TODO: Obtener del perfil si es necesario

        this.loading = false;
        this.router.navigate(["/admin/products"]);
      },
      error: (err) => {
        this.loading = false;
        console.error("Login error", err);
        if (err.status === 401) {
          this.error = "Correo o contraseña incorrectos.";
        } else {
          this.error = "Error al conectar con el servidor. Intenta de nuevo.";
        }
      },
    });
  }

  goHome() {
    this.router.navigate(["/"]);
  }
}
