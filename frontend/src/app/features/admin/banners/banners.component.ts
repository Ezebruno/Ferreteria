import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  LucideAngularModule,
  Image,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
} from "lucide-angular";
import { ApiService } from "../../../core/services/api.service";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  imageFile?: File;
  imagePreview?: string;
  link: string;
  position: number;
  is_active: boolean;
  created_at: string;
  editing?: boolean;
  editTitle?: string;
  editSubtitle?: string;
  editLink?: string;
  editIsActive?: boolean;
  deleting?: boolean;
}

@Component({
  selector: "app-banners",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  styles: [
    `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-scale-in { animation: scaleIn 0.25s ease-out; }
    `,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-white uppercase tracking-wider" style="font-family: Sora, sans-serif;">
            Banners
          </h1>
          <p class="text-steel-400 text-sm mt-1">
            Gestioná los banners del carrusel de tu tienda.
          </p>
        </div>
        <button
          (click)="openNewForm()"
          class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ferre-600 text-white font-bold text-sm hover:bg-ferre-700 transition-all shadow-lg self-start"
        >
          <lucide-icon [name]="Plus" size="18"></lucide-icon>
          Nuevo Banner
        </button>
      </div>

      <!-- New Banner Form -->
      <div
        *ngIf="showNewForm"
        class="card-industrial p-6 animate-scale-in"
      >
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-lg bg-ferre-600/10 flex items-center justify-center" style="border: 1.5px solid #f9d7a5;">
            <lucide-icon [name]="Image" size="18" class="text-ferre-600"></lucide-icon>
          </div>
          <h2 class="text-lg font-extrabold text-white uppercase tracking-wider" style="font-family: Sora, sans-serif;">Crear Nuevo Banner</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-steel-400 uppercase tracking-wider mb-1.5">Titulo</label>
            <input
              type="text"
              [(ngModel)]="newBanner.title"
              placeholder="Ej. Herramientas Profesionales"
              class="w-full px-4 py-2.5 rounded-lg bg-[#13161c] border border-[#2a2f38] text-white text-sm focus:outline-none focus:ring-2 focus:ring-ferre-400 transition-all placeholder:text-steel-600"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-steel-400 uppercase tracking-wider mb-1.5">Subtitulo</label>
            <input
              type="text"
              [(ngModel)]="newBanner.subtitle"
              placeholder="Descripcion corta del banner"
              class="w-full px-4 py-2.5 rounded-lg bg-[#13161c] border border-[#2a2f38] text-white text-sm focus:outline-none focus:ring-2 focus:ring-ferre-400 transition-all placeholder:text-steel-600"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-steel-400 uppercase tracking-wider mb-1.5">Imagen</label>
            <label class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#13161c] border border-dashed border-[#2a2f38] text-steel-400 hover:border-ferre-400 hover:text-ferre-400 transition-all cursor-pointer text-sm">
              <lucide-icon [name]="Upload" size="16"></lucide-icon>
              {{ newBanner.imageFile ? newBanner.imageFile.name : 'Seleccionar imagen...' }}
              <input type="file" accept="image/*" class="hidden" (change)="onNewImageSelected($event)"/>
            </label>
          </div>
          <div>
            <label class="block text-xs font-bold text-steel-400 uppercase tracking-wider mb-1.5">Link (opcional)</label>
            <input
              type="url"
              [(ngModel)]="newBanner.link"
              placeholder="https://ejemplo.com/promo"
              class="w-full px-4 py-2.5 rounded-lg bg-[#13161c] border border-[#2a2f38] text-white text-sm focus:outline-none focus:ring-2 focus:ring-ferre-400 transition-all placeholder:text-steel-600"
            />
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" [(ngModel)]="newBanner.is_active" class="w-4 h-4 rounded bg-[#13161c] border-[#2a2f38] text-ferre-600 focus:ring-ferre-400"/>
            <span class="text-sm text-steel-300 font-medium">Activo</span>
          </label>
          <div class="flex items-center gap-3">
            <button (click)="showNewForm = false" class="px-4 py-2.5 rounded-lg bg-[#2a2f38] hover:bg-[#3a404a] text-steel-400 hover:text-white transition-all text-sm font-medium">
              Cancelar
            </button>
            <button
              (click)="createBanner()"
              [disabled]="!newBanner.title.trim() || !newBanner.imageFile || creatingBanner"
              class="px-5 py-2.5 rounded-lg bg-ferre-600 text-white font-bold text-sm hover:bg-ferre-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <div *ngIf="creatingBanner" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <lucide-icon *ngIf="!creatingBanner" [name]="Save" size="16"></lucide-icon>
              {{ creatingBanner ? 'Creando...' : 'Crear Banner' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-20">
        <div class="w-8 h-8 border-2 border-[#2a2f38] border-t-ferre-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-steel-500 text-sm">Cargando banners...</p>
      </div>

      <!-- Banner Cards -->
      <div *ngIf="!loading" class="grid gap-3">
        <div
          *ngFor="let banner of banners; let i = index"
          class="card-industrial group animate-fade-in"
          [style.animation-delay]="i * 40 + 'ms'"
        >
          <!-- View Mode -->
          <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-4" *ngIf="!banner.editing">
            <!-- Banner Preview -->
            <div class="w-full sm:w-40 h-24 rounded-lg overflow-hidden bg-[#13161c] flex-shrink-0 border border-[#2a2f38]">
              <img *ngIf="banner.image" [src]="banner.image" [alt]="banner.title" class="w-full h-full object-cover"/>
              <div *ngIf="!banner.image" class="w-full h-full flex items-center justify-center">
                <lucide-icon [name]="Image" size="24" class="text-steel-600"></lucide-icon>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-bold text-white truncate">{{ banner.title }}</p>
                <span *ngIf="!banner.is_active" class="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <lucide-icon [name]="EyeOff" size="10"></lucide-icon> Inactivo
                </span>
                <span *ngIf="banner.is_active" class="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <lucide-icon [name]="Eye" size="10"></lucide-icon> Activo
                </span>
              </div>
              <p class="text-steel-400 text-sm truncate mt-0.5">{{ banner.subtitle || 'Sin subtitulo' }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] bg-[#2a2f38] text-steel-400 px-2 py-0.5 rounded font-bold">
                  Pos: {{ banner.position }}
                </span>
                <span *ngIf="banner.link" class="text-[10px] bg-ferre-600/10 text-ferre-400 px-2 py-0.5 rounded font-bold truncate max-w-[200px]">
                  {{ banner.link }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <div class="flex flex-col gap-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="moveBanner(banner, -1)" class="p-1 rounded bg-[#2a2f38] hover:bg-[#3a404a] text-steel-400 hover:text-white transition-all disabled:opacity-30" [disabled]="i === 0">
                  <lucide-icon [name]="ArrowUp" size="14"></lucide-icon>
                </button>
                <button (click)="moveBanner(banner, 1)" class="p-1 rounded bg-[#2a2f38] hover:bg-[#3a404a] text-steel-400 hover:text-white transition-all disabled:opacity-30" [disabled]="i === banners.length - 1">
                  <lucide-icon [name]="ArrowDown" size="14"></lucide-icon>
                </button>
              </div>
              <button
                (click)="startEdit(banner)"
                title="Editar banner"
                class="p-2.5 rounded-lg bg-[#2a2f38] hover:bg-[#3a404a] text-steel-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <lucide-icon [name]="Pencil" size="16"></lucide-icon>
              </button>
              <button
                (click)="confirmDelete(banner)"
                title="Eliminar banner"
                class="p-2.5 rounded-lg bg-[#2a2f38] hover:bg-ferre-600/10 text-steel-400 hover:text-ferre-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <lucide-icon [name]="Trash2" size="16"></lucide-icon>
              </button>
            </div>
          </div>

          <!-- Edit Mode -->
          <div class="p-4 animate-scale-in" *ngIf="banner.editing">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-steel-400 uppercase tracking-wider mb-1.5">Titulo</label>
                <input type="text" [(ngModel)]="banner.editTitle" class="w-full px-4 py-2 rounded-lg bg-[#13161c] border border-[#2a2f38] text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-ferre-400 transition-all"/>
              </div>
              <div>
                <label class="block text-xs font-bold text-steel-400 uppercase tracking-wider mb-1.5">Subtitulo</label>
                <input type="text" [(ngModel)]="banner.editSubtitle" class="w-full px-4 py-2 rounded-lg bg-[#13161c] border border-[#2a2f38] text-white text-sm focus:outline-none focus:ring-2 focus:ring-ferre-400 transition-all"/>
              </div>
              <div>
                <label class="block text-xs font-bold text-steel-400 uppercase tracking-wider mb-1.5">Link (opcional)</label>
                <input type="url" [(ngModel)]="banner.editLink" class="w-full px-4 py-2 rounded-lg bg-[#13161c] border border-[#2a2f38] text-white text-sm focus:outline-none focus:ring-2 focus:ring-ferre-400 transition-all"/>
              </div>
              <div>
                <label class="block text-xs font-bold text-steel-400 uppercase tracking-wider mb-1.5">Nueva imagen (opcional)</label>
                <label class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#13161c] border border-dashed border-[#2a2f38] text-steel-400 hover:border-ferre-400 hover:text-ferre-400 transition-all cursor-pointer text-sm">
                  <lucide-icon [name]="Upload" size="16"></lucide-icon>
                  {{ banner.imageFile ? banner.imageFile.name : 'Cambiar imagen...' }}
                  <input type="file" accept="image/*" class="hidden" (change)="onEditImageSelected($event, banner)"/>
                </label>
              </div>
            </div>
            <div class="flex items-center justify-between mt-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="banner.editIsActive" class="w-4 h-4 rounded bg-[#13161c] border-[#2a2f38] text-ferre-600 focus:ring-ferre-400"/>
                <span class="text-sm text-steel-300 font-medium">Activo</span>
              </label>
              <div class="flex items-center gap-3">
                <button (click)="cancelEdit(banner)" class="px-4 py-2 rounded-lg bg-[#2a2f38] hover:bg-[#3a404a] text-steel-400 hover:text-white transition-all text-sm font-medium">
                  Cancelar
                </button>
                <button
                  (click)="saveEdit(banner)"
                  [disabled]="savingEdit"
                  class="px-5 py-2 rounded-lg bg-ferre-600 text-white font-bold text-sm hover:bg-ferre-700 transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  <div *ngIf="savingEdit" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <lucide-icon *ngIf="!savingEdit" [name]="CheckCircle" size="14"></lucide-icon>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && banners.length === 0" class="text-center py-20">
        <div class="w-16 h-16 rounded-lg bg-[#2a2f38] flex items-center justify-center mx-auto mb-4" style="border: 2px dashed #dddbd3;">
          <lucide-icon [name]="Image" size="28" class="text-steel-600"></lucide-icon>
        </div>
        <p class="text-steel-500 font-bold">No hay banners aun</p>
        <p class="text-steel-600 text-sm mt-1">Crea tu primer banner para mostrar en el carrusel de la tienda.</p>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="deletingBanner" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" (click)="deletingBanner = null">
        <div class="bg-[#1a1f27] border-2 border-[#2a2f38] rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in relative" (click)="$event.stopPropagation()">
          <div class="absolute top-3 left-3 screw"></div>
          <div class="absolute top-3 right-3 screw"></div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-safety-red/10 flex items-center justify-center" style="border: 1.5px solid #fecaca;">
              <lucide-icon [name]="AlertCircle" size="20" class="text-safety-red"></lucide-icon>
            </div>
            <h3 class="text-lg font-extrabold text-white uppercase tracking-wider" style="font-family: Sora, sans-serif;">Eliminar banner?</h3>
          </div>
          <p class="text-steel-400 text-sm mb-6">
            Estas por eliminar el banner
            <strong class="text-white">"{{ deletingBanner?.title }}"</strong>.
            Esta accion no se puede deshacer.
          </p>
          <div class="flex justify-end gap-3">
            <button (click)="deletingBanner = null" class="px-5 py-2.5 rounded-lg bg-[#2a2f38] hover:bg-[#3a404a] text-white font-bold text-sm transition-all">
              Cancelar
            </button>
            <button (click)="deleteBanner()" class="px-5 py-2.5 rounded-lg bg-safety-red hover:bg-red-600 text-white font-bold text-sm transition-all flex items-center gap-2">
              <lucide-icon [name]="Trash2" size="14"></lucide-icon>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BannersComponent implements OnInit {
  api = inject(ApiService);

  Image = Image;
  Save = Save;
  CheckCircle = CheckCircle;
  AlertCircle = AlertCircle;
  Plus = Plus;
  Pencil = Pencil;
  Trash2 = Trash2;
  X = X;
  Eye = Eye;
  EyeOff = EyeOff;
  ArrowUp = ArrowUp;
  ArrowDown = ArrowDown;
  Upload = Upload;

  banners: Banner[] = [];
  loading = true;

  showNewForm = false;
  newBanner = {
    title: "",
    subtitle: "",
    imageFile: null as File | null,
    link: "",
    is_active: true,
  };
  creatingBanner = false;

  savingEdit = false;
  deletingBanner: Banner | null = null;

  ngOnInit() {
    this.loadBanners();
  }

  loadBanners() {
    this.loading = true;
    this.api.get<any>("/ecommerce/banners/").subscribe({
      next: (res) => {
        const data = res.results || res;
        this.banners = data.map((b: any) => ({ ...b }));
        this.banners.sort((a, b) => (a.position || 0) - (b.position || 0));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openNewForm() {
    this.showNewForm = true;
    this.newBanner = { title: "", subtitle: "", imageFile: null, link: "", is_active: true };
  }

  onNewImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newBanner.imageFile = input.files[0];
    }
  }

  onEditImageSelected(event: Event, banner: Banner) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      banner.imageFile = input.files[0];
    }
  }

  createBanner() {
    if (!this.newBanner.title.trim() || !this.newBanner.imageFile) return;

    this.creatingBanner = true;
    const formData = new FormData();
    formData.append("title", this.newBanner.title.trim());
    formData.append("subtitle", this.newBanner.subtitle.trim());
    formData.append("image", this.newBanner.imageFile);
    formData.append("link", this.newBanner.link.trim());
    formData.append("is_active", String(this.newBanner.is_active));
    formData.append("position", String(this.banners.length));

    this.api.post<any>("/ecommerce/banners/", formData).subscribe({
      next: (created) => {
        this.banners.push({ ...created });
        this.showNewForm = false;
        this.creatingBanner = false;
      },
      error: () => {
        this.creatingBanner = false;
        alert("Error al crear el banner. Intentá de nuevo.");
      },
    });
  }

  startEdit(banner: Banner) {
    this.banners.forEach((b) => (b.editing = false));
    banner.editing = true;
    banner.editTitle = banner.title;
    banner.editSubtitle = banner.subtitle;
    banner.editLink = banner.link;
    banner.editIsActive = banner.is_active;
  }

  cancelEdit(banner: Banner) {
    banner.editing = false;
    banner.imageFile = undefined;
  }

  saveEdit(banner: Banner) {
    this.savingEdit = true;
    const formData = new FormData();
    formData.append("title", banner.editTitle || banner.title);
    formData.append("subtitle", banner.editSubtitle || "");
    formData.append("link", banner.editLink || "");
    formData.append("is_active", String(banner.editIsActive));
    formData.append("position", String(banner.position));
    if (banner.imageFile) {
      formData.append("image", banner.imageFile);
    }

    this.api.patch<any>(`/ecommerce/banners/${banner.id}/`, formData).subscribe({
      next: (updated) => {
        Object.assign(banner, updated);
        banner.editing = false;
        banner.imageFile = undefined;
        this.savingEdit = false;
      },
      error: () => {
        this.savingEdit = false;
        alert("Error al actualizar el banner.");
      },
    });
  }

  confirmDelete(banner: Banner) {
    this.deletingBanner = banner;
  }

  deleteBanner() {
    if (!this.deletingBanner) return;
    const banner = this.deletingBanner;

    this.api.delete<any>(`/ecommerce/banners/${banner.id}/`).subscribe({
      next: () => {
        this.banners = this.banners.filter((b) => b.id !== banner.id);
        this.deletingBanner = null;
      },
      error: () => {
        alert("Error al eliminar el banner.");
        this.deletingBanner = null;
      },
    });
  }

  moveBanner(banner: Banner, direction: -1 | 1) {
    const index = this.banners.findIndex((b) => b.id === banner.id);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.banners.length) return;

    const temp = this.banners[index];
    this.banners[index] = this.banners[newIndex];
    this.banners[newIndex] = temp;

    this.banners.forEach((b, i) => {
      b.position = i;
      this.api.patch<any>(`/ecommerce/banners/${b.id}/`, { position: i }).subscribe();
    });
  }
}
