import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService } from "src/app/core/services/api.service";
import { Router, RouterModule } from "@angular/router";
import { LucideAngularModule, User, Mail, Phone, Lock, Save, ArrowLeft, LogOut } from "lucide-angular";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterModule],
  template: `
    <div class="min-h-screen bg-steel-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div class="absolute inset-0 opacity-[0.04]" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 3px);"></div>
      <div class="absolute top-0 left-0 right-0 h-1 bg-ferre-600"></div>

      <button (click)="goBack()" class="absolute top-6 left-6 z-20 text-steel-400 hover:text-ferre-400 flex items-center gap-2 transition-colors text-sm font-medium">
        <lucide-icon [name]="ArrowLeft" size="18"></lucide-icon>
        Volver
      </button>

      <div class="z-10 w-full max-w-md p-8 relative" style="background: #1a1f27; border: 2px solid #2a2f38; border-radius: 0.5rem; box-shadow: 0 25px 60px rgba(0,0,0,0.7);">
        <div class="absolute top-3 left-3 screw"></div>
        <div class="absolute top-3 right-3 screw"></div>
        <div class="absolute bottom-3 left-3 screw"></div>
        <div class="absolute bottom-3 right-3 screw"></div>

        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-lg bg-ferre-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <lucide-icon [name]="UserIcon" size="28" class="text-white"></lucide-icon>
          </div>
          <span class="text-2xl font-extrabold tracking-wider uppercase text-white" style="font-family: Sora, sans-serif;">
            Mi Perfil
          </span>
          <p class="text-steel-500 mt-1 text-sm font-medium">{{ email }}</p>
        </div>

        <div *ngIf="success" class="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm text-center font-medium mb-4">
          Perfil actualizado exitosamente
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-steel-500 uppercase tracking-wider ml-1">Nombre</label>
              <input formControlName="first_name" type="text"
                class="w-full px-4 py-3 bg-[#13161c] border border-[#2a2f38] text-white rounded-lg focus:ring-2 focus:ring-ferre-500/20 focus:border-ferre-500 transition-all text-sm" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-steel-500 uppercase tracking-wider ml-1">Apellido</label>
              <input formControlName="last_name" type="text"
                class="w-full px-4 py-3 bg-[#13161c] border border-[#2a2f38] text-white rounded-lg focus:ring-2 focus:ring-ferre-500/20 focus:border-ferre-500 transition-all text-sm" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-steel-500 uppercase tracking-wider ml-1">Correo Electronico</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <lucide-icon [name]="Mail" size="18" class="text-steel-400"></lucide-icon>
              </div>
              <input [value]="email" type="email" disabled
                class="w-full pl-11 pr-4 py-3 bg-[#0d0f13] border border-[#2a2f38] text-steel-500 rounded-lg text-sm cursor-not-allowed" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-steel-500 uppercase tracking-wider ml-1">Telefono</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <lucide-icon [name]="Phone" size="18" class="text-steel-400"></lucide-icon>
              </div>
              <input formControlName="phone" type="tel"
                class="w-full pl-11 pr-4 py-3 bg-[#13161c] border border-[#2a2f38] text-white rounded-lg focus:ring-2 focus:ring-ferre-500/20 focus:border-ferre-500 transition-all text-sm"
                placeholder="1123456789" />
            </div>
          </div>

          <div *ngIf="error" class="bg-safety-red/10 border border-safety-red/30 text-safety-red p-3 rounded-lg text-sm text-center font-medium">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loading"
            class="w-full bg-ferre-600 hover:bg-ferre-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm uppercase tracking-wider">
            <lucide-icon *ngIf="!loading" [name]="Save" size="18"></lucide-icon>
            <div *ngIf="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {{ loading ? "Guardando..." : "Guardar cambios" }}
          </button>
        </form>

        <button (click)="logout()"
          class="w-full mt-4 bg-[#2a2f38] hover:bg-[#3a404a] text-steel-400 hover:text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
          <lucide-icon [name]="LogOut" size="18"></lucide-icon>
          Cerrar sesion
        </button>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  UserIcon = User;
  Mail = Mail;
  Phone = Phone;
  Save = Save;
  ArrowLeft = ArrowLeft;
  LogOut = LogOut;

  form: FormGroup = this.fb.group({
    first_name: [""],
    last_name: [""],
    phone: [""],
  });

  email = "";
  loading = false;
  error = "";
  success = false;

  ngOnInit() {
    this.api.get<any>("/auth/profile/").subscribe({
      next: (data) => {
        this.email = data.email || "";
        this.form.patchValue({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
        });
      },
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = "";
    this.success = false;
    this.api.patch<any>("/auth/profile/", this.form.value).subscribe({
      next: () => { this.success = true; this.loading = false; setTimeout(() => (this.success = false), 3000); },
      error: () => { this.error = "Error al guardar"; this.loading = false; },
    });
  }

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_email");
    this.router.navigate(["/"]);
  }

  goBack() { this.router.navigate(["/"]); }
}
