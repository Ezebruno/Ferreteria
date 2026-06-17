# Rutas públicas accesibles sin autenticación (login, registro, home)
# URLs para funcionalidad de e-commerce accesible al público general
from django.contrib import admin
from django.urls import path, include

# No 2FA imports
urlpatterns = [
    # Trampa para hackers (Honeypot): registra IPs que intentan entrar aquí
    path('admin/', include('admin_honeypot.urls', namespace='admin_honeypot')),
    
    # Tu panel de Super Administrador real (URL secreta)
    path('admin-secure-ferre/', admin.site.urls),
    
    path('api/saas/', include('apps.tenants.urls')),
    # Public views for landing page if needed
]
