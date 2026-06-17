// Servicio de comunicación con el backend API REST
// Maneja solicitudes HTTP a endpoints del servidor
import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.production ? environment.apiUrl : `http://${window.location.hostname}:8000/api`;

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = localStorage.getItem("access_token");
    if (token) {
      headers = headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      console.warn("Token expired or invalid. Removing from local storage.");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // Optionally reload the window to reset the application state so it can function as an anonymous user
      window.location.reload();
    }
    return throwError(() => error);
  }

  get<T>(path: string, params: any = {}): Observable<T> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get<T>(`${this.baseUrl}${path}`, {
      params: httpParams,
      headers: this.getHeaders(),
    }).pipe(catchError(this.handleError.bind(this)));
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, {
      headers: this.getHeaders(),
    }).pipe(catchError(this.handleError.bind(this)));
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body, {
      headers: this.getHeaders(),
    }).pipe(catchError(this.handleError.bind(this)));
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, {
      headers: this.getHeaders(),
    }).pipe(catchError(this.handleError.bind(this)));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
    }).pipe(catchError(this.handleError.bind(this)));
  }
}
