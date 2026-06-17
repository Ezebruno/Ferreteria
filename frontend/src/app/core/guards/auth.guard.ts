// Guard de ruta que protege el acceso a páginas autenticadas
// Valida token JWT antes de permitir navegación
import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem("access_token");
    if (!token) {
      this.router.navigate(["/auth/login"]);
      return false;
    }

    try {
      const payload: any = jwtDecode(token);
      if (payload && payload.exp && Date.now() / 1000 > payload.exp) {
        // token expired
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        this.router.navigate(["/auth/login"]);
        return false;
      }
      return true;
    } catch (err) {
      // invalid token
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      this.router.navigate(["/auth/login"]);
      return false;
    }
  }
}
