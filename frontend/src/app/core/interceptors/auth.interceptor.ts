import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';
import { ApiService } from '../services/api.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const api = inject(ApiService);
  const router = inject(Router);

  const token = localStorage.getItem('access_token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token && !isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          return api.post<any>('/token/refresh/', { refresh: refreshToken }).pipe(
            switchMap((res: any) => {
              isRefreshing = false;
              localStorage.setItem('access_token', res.access);
              if (res.refresh) {
                localStorage.setItem('refresh_token', res.refresh);
              }
              const newReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.access}` }
              });
              return next(newReq);
            }),
            catchError(() => {
              isRefreshing = false;
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              router.navigate(['/login']);
              return throwError(() => error);
            })
          );
        } else {
          isRefreshing = false;
          localStorage.removeItem('access_token');
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
