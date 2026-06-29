import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  LucideAngularModule,
  Tag,
  Globe,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  FolderOpen,
  ImagePlus,
  ArrowUp,
  ArrowDown
} from "lucide-angular";
import { ApiService } from "../../../core/services/api.service";

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  display_order: number;
  meli_category_id: string | null;
  created_at: string;
  // UI state
  meli_saving?: boolean;
  meli_saved?: boolean;
  meli_error?: boolean;
  meli_predicting?: boolean;
  editing?: boolean;
  editName?: string;
  deleting?: boolean;
  productCount?: number;
}

@Component({
  selector: "app-categories",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .animate-scale-in {
        animation: scaleIn 0.25s ease-out;
      }
    `,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-white uppercase tracking-wider" style="font-family: Sora, sans-serif;">
            Categorias
          </h1>
          <p class="text-steel-400 text-sm mt-1">
            Gestioná las categorias de tu catalogo de productos.
          </p>
        </div>
        <button
          (click)="openNewForm()"
          class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ferre-600 text-white font-bold text-sm hover:bg-ferre-700 transition-all shadow-lg"
        >
          <lucide-icon [name]="Plus" size="18"></lucide-icon>
          Nueva Categoria
        </button>
      </div>

      <!-- New Category Form -->
      <div
        *ngIf="showNewForm"
        class="card-industrial p-6 animate-scale-in"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-ferre-600/10 flex items-center justify-center" style="border: 1.5px solid #f9d7a5;">
            <lucide-icon [name]="FolderOpen" size="18" class="text-ferre-600"></lucide-icon>
          </div>
          <h2 class="text-lg font-extrabold text-white uppercase tracking-wider" style="font-family: Sora, sans-serif;">Crear Nueva Categoria</h2>
        </div>
        <div class="flex items-end gap-4">
          <div class="flex-1">
            <label class="block text-xs font-bold text-steel-400 uppercase tracking-wider mb-1.5">Nombre de la categoria</label>
            <input
              type="text"
              [(ngModel)]="newCategoryName"
              placeholder="Ej. Herramientas Electricas, Plomeria, Pinturas..."
              class="w-full px-4 py-2.5 rounded-lg bg-[#13161c] border border-[#2a2f38] text-white text-sm focus:outline-none focus:ring-2 focus:ring-ferre-400 focus:border-ferre-500 transition-all placeholder:text-steel-600"
              (keydown.enter)="createCategory()"
              autofocus
            />
          </div>
          <button
            (click)="createCategory()"
            [disabled]="!newCategoryName.trim() || creatingCategory"
            class="px-5 py-2.5 rounded-lg bg-ferre-600 text-white font-bold text-sm hover:bg-ferre-600/100 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <div *ngIf="creatingCategory" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <lucide-icon *ngIf="!creatingCategory" [name]="Save" size="16"></lucide-icon>
            {{ creatingCategory ? "Creando..." : "Crear" }}
          </button>
          <button (click)="showNewForm = false" class="p-2.5 rounded-lg bg-[#2a2f38] hover:bg-[#3a404a] text-steel-400 hover:text-white transition-all">
            <lucide-icon [name]="X" size="18"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-20">
        <div class="w-8 h-8 border-2 border-[#2a2f38] border-t-ferre-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-steel-500 text-sm">Cargando categorias...</p>
      </div>

      <!-- Category Cards -->
      <div *ngIf="!loading" class="grid gap-3">
        <div
          *ngFor="let cat of categories; let i = index"
          class="card-industrial group animate-fade-in"
          [style.animation-delay]="i * 40 + 'ms'"
        >
          <div class="p-4 flex items-center gap-4">
            <!-- Icon -->
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-ferre-600/10" style="border: 1.5px solid #f9d7a5;">
              <lucide-icon [name]="Tag" size="18" class="text-ferre-600"></lucide-icon>
            </div>

            <!-- Name / Edit -->
            <div class="flex-1 min-w-0" *ngIf="!cat.editing">
              <p class="font-bold text-white truncate">{{ cat.name }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] bg-[#2a2f38] text-steel-400 px-2 py-0.5 rounded font-bold">
                  slug: {{ cat.slug }}
                </span>
                <span *ngIf="cat.meli_category_id" class="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded font-bold">
                  MeLi: {{ cat.meli_category_id }}
                </span>
              </div>
            </div>

            <!-- Inline Edit Mode -->
            <div class="flex-1 min-w-0" *ngIf="cat.editing">
              <input
                type="text"
                [(ngModel)]="cat.editName"
                class="w-full px-4 py-2 rounded-lg bg-[#13161c] border border-[#2a2f38] text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-ferre-400 transition-all"
                (keydown.enter)="saveEdit(cat)"
                (keydown.escape)="cancelEdit(cat)"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2" *ngIf="!cat.editing">
              <!-- Reorder controls -->
              <div class="flex flex-col gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="moveCategory(cat, -1)" class="p-1 rounded bg-[#2a2f38] hover:bg-[#3a404a] text-steel-400 hover:text-white transition-all disabled:opacity-30" [disabled]="i === 0">
                  <lucide-icon [name]="ArrowUp" size="14"></lucide-icon>
                </button>
                <button (click)="moveCategory(cat, 1)" class="p-1 rounded bg-[#2a2f38] hover:bg-[#3a404a] text-steel-400 hover:text-white transition-all disabled:opacity-30" [disabled]="i === categories.length - 1">
                  <lucide-icon [name]="ArrowDown" size="14"></lucide-icon>
                </button>
              </div>

              <button
                (click)="startEdit(cat)"
                title="Editar nombre"
                class="p-2.5 rounded-lg bg-[#2a2f38] hover:bg-[#3a404a] text-steel-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <lucide-icon [name]="Pencil" size="16"></lucide-icon>
              </button>
              <button
                (click)="confirmDelete(cat)"
                title="Eliminar categoría"
                class="p-2.5 rounded-lg bg-[#2a2f38] hover:bg-ferre-600/10 text-steel-400 hover:text-ferre-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <lucide-icon [name]="Trash2" size="16"></lucide-icon>
              </button>
            </div>

            <!-- Edit Mode Buttons -->
            <div class="flex items-center gap-2" *ngIf="cat.editing">
              <button
                (click)="saveEdit(cat)"
                class="px-4 py-2 rounded-lg bg-ferre-600 text-black font-extrabold text-xs hover:bg-ferre-600/100 transition-all flex items-center gap-1.5"
              >
                <lucide-icon [name]="CheckCircle" size="14"></lucide-icon>
                Guardar
              </button>
              <button
                (click)="cancelEdit(cat)"
                class="p-2 rounded-lg bg-[#2a2f38] hover:bg-[#3a404a] text-steel-400 hover:text-white transition-all"
              >
                <lucide-icon [name]="X" size="16"></lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && categories.length === 0" class="text-center py-20">
        <div class="w-16 h-16 rounded-lg bg-[#2a2f38] flex items-center justify-center mx-auto mb-4" style="border: 2px dashed #dddbd3;">
          <lucide-icon [name]="FolderOpen" size="28" class="text-steel-600"></lucide-icon>
        </div>
        <p class="text-steel-500 font-bold">No hay categorias aun</p>
        <p class="text-steel-600 text-sm mt-1">Crea tu primera categoria para organizar tus productos.</p>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="deletingCategory" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" (click)="deletingCategory = null">
        <div class="bg-[#1a1f27] border-2 border-[#2a2f38] rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in relative" (click)="$event.stopPropagation()">
          <!-- Tornillos -->
          <div class="absolute top-3 left-3 screw"></div>
          <div class="absolute top-3 right-3 screw"></div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-safety-red/10 flex items-center justify-center" style="border: 1.5px solid #fecaca;">
              <lucide-icon [name]="AlertCircle" size="20" class="text-safety-red"></lucide-icon>
            </div>
            <h3 class="text-lg font-extrabold text-white uppercase tracking-wider" style="font-family: Sora, sans-serif;">Eliminar categoria?</h3>
          </div>
          <p class="text-steel-400 text-sm mb-6">
            Estas por eliminar la categoria
            <strong class="text-white">"{{ deletingCategory?.name }}"</strong>.
            Los productos asociados quedaran sin categoria. Esta accion no se puede deshacer.
          </p>
          <div class="flex justify-end gap-3">
            <button (click)="deletingCategory = null" class="px-5 py-2.5 rounded-lg bg-[#2a2f38] hover:bg-[#3a404a] text-white font-bold text-sm transition-all">
              Cancelar
            </button>
            <button (click)="deleteCategory()" class="px-5 py-2.5 rounded-lg bg-safety-red hover:bg-red-600 text-white font-bold text-sm transition-all flex items-center gap-2">
              <lucide-icon [name]="Trash2" size="14"></lucide-icon>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  api = inject(ApiService);

  // Icons
  Tag = Tag;
  Globe = Globe;
  Save = Save;
  CheckCircle = CheckCircle;
  AlertCircle = AlertCircle;
  Plus = Plus;
  Pencil = Pencil;
  Trash2 = Trash2;
  X = X;
  FolderOpen = FolderOpen;
  ImagePlus = ImagePlus;
  ArrowUp = ArrowUp;
  ArrowDown = ArrowDown;

  categories: Category[] = [];
  loading = true;

  // New category form
  showNewForm = false;
  newCategoryName = "";
  creatingCategory = false;

  // Delete confirmation
  deletingCategory: Category | null = null;

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.api.get<any>("/categories/").subscribe({
      next: (res) => {
        const data = res.results || res;
        this.categories = data.map((c: any) => ({ ...c }));
        // Ensure sorted by display_order locally as fallback, though API should handle it
        this.categories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openNewForm() {
    this.showNewForm = true;
    this.newCategoryName = "";
  }

  createCategory() {
    const name = this.newCategoryName.trim();
    if (!name) return;

    this.creatingCategory = true;
    this.api.post<any>("/categories/", { name }).subscribe({
      next: (created) => {
        this.categories.unshift({ ...created });
        this.newCategoryName = "";
        this.showNewForm = false;
        this.creatingCategory = false;
      },
      error: () => {
        this.creatingCategory = false;
        alert("Error al crear la categoría. Intentá de nuevo.");
      },
    });
  }

  startEdit(cat: Category) {
    // Cancel any other editing
    this.categories.forEach((c) => (c.editing = false));
    cat.editing = true;
    cat.editName = cat.name;
  }

  cancelEdit(cat: Category) {
    cat.editing = false;
    cat.editName = undefined;
  }

  saveEdit(cat: Category) {
    const newName = cat.editName?.trim();
    if (!newName || newName === cat.name) {
      this.cancelEdit(cat);
      return;
    }

    this.api.patch<any>(`/categories/${cat.id}/`, { name: newName }).subscribe({
      next: (updated) => {
        cat.name = updated.name;
        cat.slug = updated.slug;
        cat.editing = false;
        cat.editName = undefined;
      },
      error: () => {
        alert("Error al actualizar la categoría.");
      },
    });
  }

  confirmDelete(cat: Category) {
    this.deletingCategory = cat;
  }

  deleteCategory() {
    if (!this.deletingCategory) return;
    const cat = this.deletingCategory;

    this.api.delete<any>(`/categories/${cat.id}/`).subscribe({
      next: () => {
        this.categories = this.categories.filter((c) => c.id !== cat.id);
        this.deletingCategory = null;
      },
      error: () => {
        alert(
          "Error al eliminar la categoría. Puede que tenga productos asociados."
        );
        this.deletingCategory = null;
      },
    });
  }

  moveCategory(cat: Category, direction: -1 | 1) {
    const index = this.categories.findIndex(c => c.id === cat.id);
    if (index === -1) return;
    
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.categories.length) return;

    // Swap locally
    const temp = this.categories[index];
    this.categories[index] = this.categories[newIndex];
    this.categories[newIndex] = temp;

    // Update display_order for all to ensure sequence is correct
    this.categories.forEach((c, i) => {
      c.display_order = i;
      this.api.patch<any>(`/categories/${c.id}/`, { display_order: i }).subscribe();
    });
  }
}

