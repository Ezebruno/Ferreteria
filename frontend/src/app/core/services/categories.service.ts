import { Injectable, inject } from "@angular/core";
import { BehaviorSubject, Observable, catchError, of } from "rxjs";
import { ApiService } from "./api.service";
import { tap } from "rxjs/operators";

export interface Category {
  id: number | string;
  name: string;
}

@Injectable({
  providedIn: "root",
})
export class CategoriesService {
  private api = inject(ApiService);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  // Fallback hardcoded categories
  private hardcodedCategories: Category[] = [
    { id: "1", name: "Herramientas Eléctricas" },
    { id: "2", name: "Herramientas Manuales" },
    { id: "3", name: "Materiales de Construcción" },
    { id: "4", name: "Pinturas y Acabados" },
    { id: "5", name: "Tuberías" },
    { id: "6", name: "Tornillos y Clavos" },
    { id: "7", name: "Equipamiento" },
    { id: "8", name: "Suministros" },
    { id: "9", name: "Jardín y Exterior" },
  ];

  constructor() {
    this.loadCategories();
  }

  loadCategories(): Observable<Category[]> {
    return this.api.get<Category[]>("/api/categories/").pipe(
      tap((categories: any) => {
        // Handle both paginated and non-paginated responses
        const data = categories.results || categories;
        this.categoriesSubject.next(data);
      }),
      catchError((error) => {
        console.warn(
          "Failed to load categories from API, using fallback",
          error,
        );
        this.categoriesSubject.next(this.hardcodedCategories);
        return of(this.hardcodedCategories);
      }),
    );
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  getCategoriesArray(): Category[] {
    const current = this.categoriesSubject.getValue();
    return current.length > 0 ? current : this.hardcodedCategories;
  }

  getCategoryName(id: number | string): string {
    const categories = this.categoriesSubject.getValue();
    const category = categories.find((c) => c.id === id || c.id === String(id));
    return category ? category.name : String(id);
  }
}
