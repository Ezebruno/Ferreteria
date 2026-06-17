from django_tenants.utils import get_tenant_model

class DevTenantMiddleware:
    """
    Middleware for local development to force a specific tenant 
    via the X-Tenant-ID HTTP header, bypassing domain resolution.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        tenant_id = request.headers.get('X-Tenant-ID')
        if tenant_id:
            TenantModel = get_tenant_model()
            try:
                # Buscar el tenant solicitado
                tenant = TenantModel.objects.get(schema_name=tenant_id)
                # Sobrescribir el tenant que haya detectado django_tenants
                request.tenant = tenant
                
                # ¡CRÍTICO! Cambiar la conexión de la base de datos al esquema del cliente
                from django.db import connection
                connection.set_tenant(request.tenant)
                
                # Forzar el uso de las URLs de los clientes (ferre_saas.urls)
                # en lugar de las URLs públicas (ferre_saas.urls_public)
                request.urlconf = "ferre_saas.urls"
            except TenantModel.DoesNotExist:
                pass
        
        return self.get_response(request)
