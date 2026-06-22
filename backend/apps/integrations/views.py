# Vistas para integraciones externas (MercadoLibre, Stripe, etc.)
# Sincroniza productos y órdenes con plataformas terceras
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.integrations.services.meli import MeLiService
from apps.integrations.services.mercadopago import MercadoPagoService
from apps.inventory.models import Product
from apps.sales.models import Sale, SaleItem, Customer
from django.db import transaction
import mercadopago, json
from django.conf import settings

from apps.integrations.models import IntegrationConfig
from django.utils import timezone

# Agregá esta línea acá abajo:
from apps.users.models import StoreConfig

class MeLiConfigView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        config = IntegrationConfig.objects.filter(integration_type='MELI', is_active=True).first()
        return Response({
            'client_id': config.client_id if config else '',
            'client_secret': config.client_secret if config else ''
        })

    def post(self, request):
        client_id = request.data.get('client_id')
        client_secret = request.data.get('client_secret')
        if not client_id or not client_secret:
            return Response({'error': 'Client ID and Secret required'}, status=status.HTTP_400_BAD_REQUEST)
        
        config = IntegrationConfig.objects.filter(integration_type='MELI', is_active=True).first()
        if not config:
            config = IntegrationConfig(integration_type='MELI')
        
        config.client_id = client_id
        config.client_secret = client_secret
        config.save()
        return Response({'status': 'success', 'message': 'Configuración guardada'})

class MeLiAuthUrlView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        config = IntegrationConfig.objects.filter(integration_type='MELI', is_active=True).first()
        is_linked = config is not None and bool(config.access_token)
        auth_url = MeLiService.get_auth_url()
        return Response({'auth_url': auth_url, 'is_linked': is_linked})

class MeLiAuthorizeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Code required'}, status=status.HTTP_400_BAD_REQUEST)
        
        import requests as req
        # Always use the master app credentials from environment
        client_id = getattr(settings, 'MELI_CLIENT_ID', '')
        client_secret = getattr(settings, 'MELI_CLIENT_SECRET', '')
        redirect_uri = getattr(settings, 'MELI_REDIRECT_URI', '')
        
        if not client_id or not client_secret:
            return Response({'error': 'MeLi credentials not configured on server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        payload = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': redirect_uri
        }
        
        resp = req.post("https://api.mercadolibre.com/oauth/token", data=payload)
        
        if resp.status_code == 200:
            data = resp.json()
            
            # Buscamos la config o la creamos
            config = IntegrationConfig.objects.filter(integration_type='MELI').first()
            if not config:
                config = IntegrationConfig(integration_type='MELI')
            
            # CORRECCIÓN: Guardamos los identificadores de la app master junto con los tokens
            config.client_id = client_id
            config.client_secret = client_secret
            config.access_token = data.get('access_token')
            config.refresh_token = data.get('refresh_token')
            
            if 'expires_in' in data:
                config.token_expires_at = timezone.now() + timezone.timedelta(seconds=data['expires_in'])
            
            config.is_active = True
            config.save()
            return Response({'status': 'success', 'message': 'Cuenta vinculada exitosamente'})
        else:
            return Response({'error': 'Error al intercambiar token', 'details': resp.text}, status=status.HTTP_400_BAD_REQUEST)

class MeLiSyncView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, product_id=None):
        """ Triggers a sync for a specific product or for all tagged products """
        # CORRECCIÓN: Obtener el token directamente desde el servicio del backend
        access_token = MeLiService.get_token()
        
        if not access_token:
            return Response({'error': 'No hay una cuenta de Mercado Libre vinculada o el token es inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        if product_id:
            try:
                product = Product.objects.get(id=product_id)
                if product.meli_item_id:
                    result = MeLiService.sync_stock_and_price(product_id, access_token)
                    return Response({'status': 'success', 'message': result})
                else:
                    result = MeLiService.publish_product(product_id, access_token)
                    if isinstance(result, dict):
                        return Response(result)
                    return Response({'status': 'success', 'message': result})
            except Product.DoesNotExist:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Sincronización masiva
        products_to_sync = Product.objects.filter(meli_sync=True)
        count = 0
        for prod in products_to_sync:
            MeLiService.sync_stock_and_price(prod.id, access_token)
            count += 1
            
        return Response({'status': 'success', 'synced_count': count})

class MeLiCategoryPredictorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """ Predicts the MeLi category based on a product title using Domain Discovery API """
        title = request.query_params.get('title')
        if not title:
            return Response({'error': 'Title required'}, status=status.HTTP_400_BAD_REQUEST)
        
        import requests
        from urllib.parse import quote
        try:
            # Correct endpoint: Domain Discovery API (MLA = Argentina)
            url = f"https://api.mercadolibre.com/sites/MLA/domain_discovery/search?q={quote(title)}&limit=1"
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list) and len(data) > 0:
                    best_match = data[0]
                    return Response({
                        'category_id': best_match.get('category_id'),
                        'category_name': best_match.get('category_name'),
                        'domain_name': best_match.get('domain_name'),
                    })
                
            return Response({'error': 'No category found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MeLiCategorySearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """ Searches MeLi categories based on a keyword """
        q = request.query_params.get('q')
        if not q:
            return Response({'error': 'Query parameter "q" required'}, status=status.HTTP_400_BAD_REQUEST)
        
        import requests
        from urllib.parse import quote
        try:
            # Using domain discovery with more results or category search
            url = f"https://api.mercadolibre.com/sites/MLA/domain_discovery/search?q={quote(q)}&limit=5"
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                return Response(data)
                
            return Response({'error': 'No categories found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MercadoPagoPreferenceView(APIView):
    permission_classes = [permissions.AllowAny] # Allow customers to create preferences
    authentication_classes = [] # Disable auth to avoid 401 with expired tokens

    def post(self, request):
        try:
            """
            Expects a list of items: [{'id': 1, 'quantity': 2}, ...]
            Creates a PENDING sale and a Mercado Pago preference.
            """
            cart_items = request.data.get('items', [])
            if not cart_items:
                return Response({'error': 'Empty cart'}, status=status.HTTP_400_BAD_REQUEST)
                
            with transaction.atomic():
                # Create Sale
                total = 0
                items_to_create = []
                items_for_mp = []
                
                for item in cart_items:
                    try:
                        product = Product.objects.get(id=item['id'])
                        price = float(product.price_retail)
                        total += price * int(item['quantity'])
                        
                        items_for_mp.append({
                            "id": str(product.id),
                            "title": product.name,
                            "quantity": int(item['quantity']),
                            "unit_price": price,
                            "currency_id": "ARS"
                        })
                        
                        items_to_create.append({
                            'product': product,
                            'quantity': int(item['quantity']),
                            'price_at_sale': price
                        })
                    except Product.DoesNotExist:
                        continue
                
                if not items_for_mp:
                    return Response({'error': 'No valid products found'}, status=status.HTTP_400_BAD_REQUEST)

                # Safe association with authenticated user if possible
                customer = None
                try:
                    if request.user and request.user.is_authenticated:
                        customer = getattr(request.user, 'customer', None)
                except Exception as auth_err:
                    print(f"Auth check skipped due to error: {auth_err}")

                sale = Sale.objects.create(
                    customer=customer,
                    total=total,
                    payment_method='MERCADO_PAGO',
                    status='PENDING'
                )
                
                for item_data in items_to_create:
                    SaleItem.objects.create(sale=sale, **item_data)
                    
                # Use current host to build absolute URLs
                base_url = f"{request.scheme}://{request.get_host()}"
                print(f"DEBUG: base_url is {base_url}")
                
                # Get tenant specific MP credentials from StoreConfig.objects.first()
                mp_access_token = StoreConfig.objects.first().mp_access_token if StoreConfig.objects.first() else None

                try:
                    print(f"Creating preference for Sale {sale.id} with base_url {base_url}")
                    print(f"Items for MP: {json.dumps(items_for_mp, indent=2)}")
                    
                    preference = MercadoPagoService.create_preference(
                        items_for_mp, 
                        external_reference=sale.id,
                        access_token=mp_access_token,
                        base_url=base_url
                    )
                    
                    # Save preference ID for traceability
                    sale.mp_preference_id = preference.get('id')
                    sale.save()

                    print(f"Preference created successfully: {sale.mp_preference_id}")
                    return Response({
                        'preference_id': preference.get('id'),
                        'init_point': preference.get('init_point'),
                        'sale_id': sale.id
                    })
                except Exception as e:
                    # Log the error for debugging
                    print(f"!!! Mercado Pago SDK Error: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    return Response({'error': 'Error connecting to Mercado Pago API', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as global_e:
            import traceback
            print("GLOBAL ERROR IN MP PREFERENCE VIEW:")
            print(traceback.format_exc())
            return Response({'error': 'Unexpected server error', 'details': str(global_e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MercadoPagoAuthUrlView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        app_id = getattr(settings, 'MP_APP_ID', '')
        if not app_id:
            return Response({'error': 'MP_APP_ID no configurado'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # CAMBIO: Esta URL debe ser idéntica a la que registraste en el panel de Mercado Pago
        # Debe apuntar al endpoint que procesa el código (MercadoPagoAuthorizeView)
        redirect_uri = f"{request.scheme}://{request.get_host()}/api/integrations/mercadopago/authorize/"
        
        tenant_schema = 'default'
        # Construimos la URL de autorización de Mercado Pago
        url = f"https://auth.mercadopago.com/authorization?client_id={app_id}&response_type=code&platform_id=mp&redirect_uri={redirect_uri}&state={tenant_schema}"
        
        has_mp = bool(StoreConfig.objects.first().mp_access_token if StoreConfig.objects.first() else None)
        return Response({'auth_url': url, 'is_linked': has_mp})

class MercadoPagoAuthorizeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri')
        if not code:
            return Response({'error': 'Code no fue proporcionado'}, status=status.HTTP_400_BAD_REQUEST)

        client_id = getattr(settings, 'MP_APP_ID', '')
        client_secret = getattr(settings, 'MP_CLIENT_SECRET', '')
        
        if not client_id or not client_secret:
            return Response({'error': 'Credenciales maestras de MP faltantes'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        import requests as req
        payload = {
            'client_secret': client_secret,
            'client_id': client_id,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri
        }
        
        resp = req.post("https://api.mercadopago.com/oauth/token", data=payload)
        if resp.status_code == 200:
            data = resp.json()
            # Guardamos las credenciales en el Tenant actual
            from apps.users.models import StoreConfig
            tenant = StoreConfig.objects.first() or StoreConfig.objects.create()
            tenant.mp_access_token = data.get('access_token')
            tenant.mp_public_key = data.get('public_key')
            tenant.mp_refresh_token = data.get('refresh_token')
            tenant.save()
            return Response({'status': 'success', 'message': 'Cuenta de Mercado Pago vinculada exitosamente'})
        else:
            return Response({'error': 'Error al vincular MP', 'details': resp.text}, status=status.HTTP_400_BAD_REQUEST)

class MercadoPagoWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        """ Handels Mercado Pago IPN/Webhooks """
        topic = request.query_params.get('topic')
        resource_id = request.query_params.get('id')
        
        # If no topic, try data.id (newer webhooks format)
        if not topic:
            topic = request.data.get('type')
            resource_id = request.data.get('data', {}).get('id')

        if topic == 'payment' or topic == 'merchant_order':
            # Get tenant specific MP credentials
            mp_access_token = StoreConfig.objects.first().mp_access_token if StoreConfig.objects.first() else None
            
            if topic == 'payment':
                payment_data = MercadoPagoService.get_payment_info(resource_id, access_token=mp_access_token)
                external_reference = payment_data.get("external_reference")
                status_mp = payment_data.get("status")
                payment_id = payment_data.get("id")
            else:
                # For merchant_order we might need to fetch the sdk directly or expand the service
                sdk = mercadopago.SDK(mp_access_token or settings.MP_ACCESS_TOKEN)
                order_info = sdk.merchant_order().get(resource_id)
                payment_data = order_info.get("response")
                external_reference = payment_data.get("external_reference")
                status_mp = payment_data.get("status") # This is order status
                payment_id = None

            if external_reference:
                try:
                    sale = Sale.objects.get(id=external_reference)
                    
                    # Update status mapping
                    status_map = {
                        'approved': 'PAID',
                        'pending': 'PENDING',
                        'in_process': 'PENDING',
                        'rejected': 'CANCELLED',
                        'cancelled': 'CANCELLED',
                        'refunded': 'CANCELLED',
                        'charged_back': 'CANCELLED'
                    }
                    
                    new_status = status_map.get(status_mp)
                    if new_status:
                        # Prevent double processing
                        if sale.status != 'PAID' and new_status == 'PAID':
                            # Reduce stock
                            items = SaleItem.objects.filter(sale=sale)
                            for item in items:
                                if item.product:
                                    item.product.stock_current = max(0, item.product.stock_current - item.quantity)
                                    item.product.save()
                            
                            # Optional: Email notification
                            from django.core.mail import send_mail
                            from django.conf import settings
                            if sale.customer and sale.customer.email:
                                try:
                                    send_mail(
                                        "Confirmación de Pago - FerreNexo",
                                        f"Tu pago de la orden #{sale.id} ha sido procesado exitosamente y estamos preparando tu pedido.",
                                        settings.DEFAULT_FROM_EMAIL,
                                        [sale.customer.email],
                                        fail_silently=True
                                    )
                                except Exception as e:
                                    print(f"WEBHOOK MAIL ERROR: {e}")

                        sale.status = new_status
                        
                    if payment_id:
                        sale.mp_payment_id = str(payment_id)
                        
                    sale.save()
                        
                except Sale.DoesNotExist:
                    print(f"WEBHOOK ERROR: Sale {external_reference} not found")
                    
        return Response(status=status.HTTP_200_OK)
