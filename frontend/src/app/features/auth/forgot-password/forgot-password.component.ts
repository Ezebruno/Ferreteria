import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService } from "src/app/core/services/api.service";
import { Router, RouterModule } from "@angular/router";
import { LucideAngularModule, Mail, ArrowLeft, Send, Wrench } from "lucide-angular";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterModule],
  template: `
    <div class="min-h-screen bg-steel-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div class="absolute inset-0 opacity-[0.04]" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 3px);"></div>
      <div class="absolute top-0 left-0 right-0 h-1 bg-ferre-600"></div>

      <button (click)="goBack()" class="absolute top-6 left-6 z-20 text-steel-400 hover:text-ferre-400 flex items-center gap-2 transition-colors text-sm font-medium">
        <lucide-icon [name]="ArrowLeft" size="18"></lucide-icon>
        Volver al login
      </button>

      <div class="z-10 w-full max-w-md p-8 relative" style="background: #1a1f27; border: 2px solid #2a2f38; border-radius: 0.5rem; box-shadow: 0 25px 60px rgba(0,0,0,0.7);">
        <div class="absolute top-3 left-3 screw"></div>
        <div class="absolute top-3 right-3 screw"></div>
        <div class="absolute bottom-3 left-3 screw"></div>
        <div class="absolute bottom-3 right-3 screw"></div>

        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-lg bg-ferre-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <lucide-icon [name]="Mail" size="28" class="text-white"></lucide-icon>
          </div>
          <span class="text-2xl font-extrabold tracking-wider uppercase text-white" style="font-family: Sora, sans-serif;">
            Ferre<span class="text-ferre-600">Nexo</span>
          </span>
          <p class="text-steel-500 mt-1 text-sm font-medium">Recupera tu contrasena</p>
        </div>

        <div *ngIf="sent" class="text-center space-y-4">
          <div class="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg text-sm">
            Si el correo esta registrado, recibiras un enlace para restablecer tu contrasena.
          </div>
          <button (click)="goBack()" class="w-full bg-ferre-600 hover:bg-ferre-700 text-white font-bold py-3 rounded-lg transition-all text-sm">
            Volver al login
          </button>
        </div>

        <form *ngIf="!sent" [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-steel-500 uppercase tracking-wider ml-1">Correo Electronico</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <lucide-icon [name]="Mail" size="18" class="text-steel-400"></lucide-icon>
              </div>
              <input formControlName="email" type="email"
                class="w-full pl-11 pr-4 py-3 bg-[#13161c] border border-[#2a2f38] text-white rounded-lg focus:ring-2 focus:ring-ferre-500/20 focus:border-ferre-500 transition-all placeholder-steel-500 text-sm"
                placeholder="correo@ejemplo.com" />
            </div>
          </div>

          <div *ngIf="error" class="bg-safety-red/10 border border-safety-red/30 text-safety-red p-3 rounded-lg text-sm text-center font-medium">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loading"
            class="w-full bg-ferre-600 hover:bg-ferre-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm uppercase tracking-wider">
            <lucide-icon *ngIf="!loading" [name]="Send" size="18"></lucide-icon>
            <div *ngIf="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {{ loading ? "Enviando..." : "Enviar enlace" }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  Mail = Mail;
  ArrowLeft = ArrowLeft;
  Send = Send;

  form: FormGroup = this.fb.group({ email: ["", [Validators.required, Validators.email]] });
  loading = false;
  error = "";
  sent = false;

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = "";
    this.api.post<any>("/auth/password-reset/", {
      email: this.form.value.email,
      frontend_url: window.location.origin,
    }).subscribe({
      next: () => { this.sent = true; this.loading = false; },
      error: () => { this.error = "Error al enviar. Intenta de nuevo."; this.loading = false; },
    });
  }

  goBack() { this.router.navigate(["/auth/login"]); }
}
