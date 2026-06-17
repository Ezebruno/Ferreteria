# Rutas de integraciones con plataformas externas como MercadoLibre
# Permite sincronización de catálogos y órdenes
from django.urls import path
from apps.integrations.views import (
    MeLiSyncView, MercadoPagoPreferenceView, MercadoPagoWebhookView,
    MeLiCategoryPredictorView, MeLiAuthUrlView, MeLiAuthorizeView, MeLiConfigView,
    MercadoPagoAuthUrlView, MercadoPagoAuthorizeView
)

urlpatterns = [
    path('meli/config/', MeLiConfigView.as_view(), name='meli_config'),
    path('meli/auth-url/', MeLiAuthUrlView.as_view(), name='meli_auth_url'),
    path('meli/authorize/', MeLiAuthorizeView.as_view(), name='meli_authorize'),
    path('meli/sync/', MeLiSyncView.as_view(), name='meli_sync_all'),
    path('meli/sync/<int:product_id>/', MeLiSyncView.as_view(), name='meli_sync_item'),
    path('meli/predict-category/', MeLiCategoryPredictorView.as_view(), name='meli_predict_category'),
    path('mercadopago/auth-url/', MercadoPagoAuthUrlView.as_view(), name='mp_auth_url'),
    path('mercadopago/authorize/', MercadoPagoAuthorizeView.as_view(), name='mp_authorize'),
    path('mercadopago/preference/', MercadoPagoPreferenceView.as_view(), name='mp_preference'),
    path('mercadopago/webhook/', MercadoPagoWebhookView.as_view(), name='mp_webhook'),
]
