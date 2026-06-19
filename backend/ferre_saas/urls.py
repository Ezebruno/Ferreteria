# Definición de rutas (URLs) principales de la API REST y panel de administración
# Incluye endpoints para autenticación JWT, admin y todas las aplicaciones del sistema
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.inventory.views import ProductViewSet, CategoryViewSet, KitViewSet, StockMovementViewSet, DashboardViewSet
from apps.sales.views import SaleViewSet, CustomerViewSet, TicketViewSet, BudgetViewSet
from apps.users.views import CustomerRegisterView, UserProfileView, RateLimitedTokenObtainPairView, StoreSettingsView, StoreInfoView
# Importamos la vista específica para el callback de Mercado Libre
from apps.integrations.views import MeliCallbackView 

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'kits', KitViewSet, basename='kit')
router.register(r'stock-movements', StockMovementViewSet, basename='stock-movement')
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

# No 2FA
urlpatterns = [
    # path('admin/', include('admin_honeypot.urls', namespace='admin_honeypot')),  # Disabled due to Django 5 compatibility
    path('admin-secure-ferre/', admin.site.urls),
    
    # RUTA CRÍTICA: Definimos explícitamente la ruta de retorno de MeLi
    # Debe coincidir exactamente con MELI_REDIRECT_URI en settings.py
    path('admin/meli/', MeliCallbackView.as_view(), name='meli_callback'),
    
    path('api/', include(router.urls)),
    
    # Auth
    path('api/auth/login/', RateLimitedTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', CustomerRegisterView.as_view(), name='customer_register'),
    path('api/auth/profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/tenant/settings/', StoreSettingsView.as_view(), name='store_settings'),
    path('api/tenant/info/', StoreInfoView.as_view(), name='store_info'),
    
    # Ecommerce
    path('api/ecommerce/', include('apps.ecommerce.urls')),
    
    # Integrations (Mercado Pago, MeLi)
    path('api/integrations/', include('apps.integrations.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
