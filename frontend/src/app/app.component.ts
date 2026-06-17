// Componente raíz de la aplicación Angular
// Contiene el layout principal y router outlet para navegación
import { Component, OnInit, inject } from "@angular/core";
import { Router, RouterOutlet, NavigationEnd } from "@angular/router";
import { HeaderComponent } from "./shared/components/header/header.component";
import { CartDrawerComponent } from "./shared/components/cart-drawer/cart-drawer.component";
import { CommonModule } from "@angular/common";
import { filter } from "rxjs/operators";
import { ApiService } from "./core/services/api.service";
import { whatsappConfig } from "../environments/environment";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CartDrawerComponent, CommonModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  title = "ferre-saas-frontend";
  showLayout = true;
  whatsappHref = `https://wa.me/${whatsappConfig.number}?text=${encodeURIComponent(whatsappConfig.defaultMessage)}`;
  private api = inject(ApiService);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showLayout = !event.url.includes("/admin");
      });
  }

  ngOnInit() {
    this.loadTenantInfo();
  }

  loadTenantInfo() {
    this.api.get<any>('/tenant/info/').subscribe({
      next: (data) => {
        if (data.whatsapp_number) {
          // Clean the number from non-numeric characters for the href
          const cleanNumber = data.whatsapp_number.replace(/\D/g, '');
          this.whatsappHref = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappConfig.defaultMessage)}`;
        }
      },
      error: (err) => {
        console.error('Error loading tenant info for WhatsApp', err);
      }
    });
  }
}
