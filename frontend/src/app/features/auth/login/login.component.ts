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
} from "lucide-angular";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div
      class="min-h-screen bg-slate-800 flex items-center justify-center p-4 relative overflow-hidden"
    >
      <!-- Background Effects -->
      <div class="absolute inset-0 z-0">
        <div
          class="absolute -top-40 -right-40 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
        ></div>
        <div
          class="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
        ></div>
      </div>

      <!-- Back to Store Button -->
      <button
        (click)="goHome()"
        class="absolute top-8 left-8 z-20 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <lucide-icon [name]="ArrowLeft" size="20"></lucide-icon>
        Volver a la tienda
      </button>

      <!-- Login Card -->
      <div
        class="z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl"
      >
        <div class="text-center mb-8">
          <span
            class="text-3xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-500"
          >
            Ferre<span class="text-white">Nexo</span>
          </span>
          <p class="text-slate-300 mt-2 font-medium">Panel de Administración</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-300 ml-1"
              >Correo Electrónico</label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
              >
                <lucide-icon
                  [name]="Mail"
                  size="18"
                  class="text-slate-400"
                ></lucide-icon>
              </div>
              <input
                formControlName="email"
                type="email"
                class="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-red-500 focus:border-red-500 transition-all placeholder-slate-500"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-300 ml-1"
              >Contraseña</label
            >
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
              >
                <lucide-icon
                  [name]="Lock"
                  size="18"
                  class="text-slate-400"
                ></lucide-icon>
              </div>
              <input
                formControlName="password"
                type="password"
                class="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-red-500 focus:border-red-500 transition-all placeholder-slate-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div
            *ngIf="error"
            class="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center font-medium"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            (click)="onSubmit()"
            [disabled]="loading"
            class="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-black py-3.5 rounded-xl shadow-lg shadow-red-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <lucide-icon
              *ngIf="!loading"
              [name]="LogIn"
              size="20"
            ></lucide-icon>
            <div
              *ngIf="loading"
              class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></div>
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
