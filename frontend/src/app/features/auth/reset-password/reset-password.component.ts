import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService } from "src/app/core/services/api.service";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { LucideAngularModule, Lock, ArrowLeft, CheckCircle, Wrench } from "lucide-angular";

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterModule],
  template: `
    <div class="min-h-screen bg-steel-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div class="absolute inset-0 opacity-[0.04]" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 3px);"></div>
      <div class="absolute top-0 left-0 right-0 h-1 bg-ferre-600"></div>

      <div class="z-10 w-full max-w-md p-8 relative" style="background: #1a1f27; border: 2px solid #2a2f38; border-radius: 0.5rem; box-shadow: 0 25px 60px rgba(0,0,0,0.7);">
        <div class="absolute top-3 left-3 screw"></div>
        <div class="absolute top-3 right-3 screw"></div>
        <div class="absolute bottom-3 left-3 screw"></div>
        <div class="absolute bottom-3 right-3 screw"></div>

        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-lg bg-ferre-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <lucide-icon [name]="LockIcon" size="28" class="text-white"></lucide-icon>
          </div>
          <span class="text-2xl font-extrabold tracking-wider uppercase text-white" style="font-family: Sora, sans-serif;">
            Ferre<span class="text-ferre-600">Nexo</span>
          </span>
          <p class="text-steel-500 mt-1 text-sm font-medium">Nueva contrasena</p>
        </div>

        <div *ngIf="success" class="text-center space-y-4">
          <div class="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg text-sm flex items-center gap-2 justify-center">
            <lucide-icon [name]="CheckCircle" size="18"></lucide-icon>
            Contrasena restablecida exitosamente
          </div>
          <button (click)="goLogin()" class="w-full bg-ferre-600 hover:bg-ferre-700 text-white font-bold py-3 rounded-lg transition-all text-sm">
            Ir al login
          </button>
        </div>

        <div *ngIf="invalid" class="text-center space-y-4">
          <div class="bg-safety-red/10 border border-safety-red/30 text-safety-red p-4 rounded-lg text-sm">
            El enlace es invalido o expiro. Solicita uno nuevo.
          </div>
          <button (click)="goLogin()" class="w-full bg-ferre-600 hover:bg-ferre-700 text-white font-bold py-3 rounded-lg transition-all text-sm">
            Volver al login
          </button>
        </div>

        <form *ngIf="!success && !invalid" [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-steel-500 uppercase tracking-wider ml-1">Nueva Contrasena</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <lucide-icon [name]="Lock" size="18" class="text-steel-400"></lucide-icon>
              </div>
              <input formControlName="new_password" type="password"
                class="w-full pl-11 pr-4 py-3 bg-[#13161c] border border-[#2a2f38] text-white rounded-lg focus:ring-2 focus:ring-ferre-500/20 focus:border-ferre-500 transition-all placeholder-steel-500 text-sm"
                placeholder="Minimo 6 caracteres" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-steel-500 uppercase tracking-wider ml-1">Confirmar Contrasena</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <lucide-icon [name]="Lock" size="18" class="text-steel-400"></lucide-icon>
              </div>
              <input formControlName="confirm_password" type="password"
                class="w-full pl-11 pr-4 py-3 bg-[#13161c] border border-[#2a2f38] text-white rounded-lg focus:ring-2 focus:ring-ferre-500/20 focus:border-ferre-500 transition-all placeholder-steel-500 text-sm"
                placeholder="Repite la contrasena" />
            </div>
          </div>

          <div *ngIf="error" class="bg-safety-red/10 border border-safety-red/30 text-safety-red p-3 rounded-lg text-sm text-center font-medium">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loading"
            class="w-full bg-ferre-600 hover:bg-ferre-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm uppercase tracking-wider">
            <div *ngIf="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {{ loading ? "Guardando..." : "Restablecer contrasena" }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  LockIcon = Wrench;
  Lock = Lock;
  CheckCircle = CheckCircle;

  form: FormGroup = this.fb.group({
    new_password: ["", [Validators.required, Validators.minLength(6)]],
    confirm_password: ["", Validators.required],
  });

  uid = "";
  token = "";
  loading = false;
  error = "";
  success = false;
  invalid = false;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.uid = params["uid"] || "";
      this.token = params["token"] || "";
      if (!this.uid || !this.token) this.invalid = true;
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const { new_password, confirm_password } = this.form.value;
    if (new_password !== confirm_password) {
      this.error = "Las contrasenas no coinciden";
      return;
    }
    this.loading = true;
    this.error = "";
    this.api.post<any>("/auth/password-reset/confirm/", {
      uid: this.uid, token: this.token, new_password,
    }).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: (err) => { this.error = err.error?.error || "Error al restablecer"; this.loading = false; },
    });
  }

  goLogin() { this.router.navigate(["/auth/login"]); }
}
