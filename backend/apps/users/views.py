# Vistas para autenticación de usuarios: login, registro, perfiles y gestación de roles
# Maneja creación de cuentas y actualización de información de usuario
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.users.models import User
from apps.sales.models import Customer
from rest_framework import serializers
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'first_name', 'last_name', 'phone')

class RegisterCustomerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'phone')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=User.CUSTOMER,
            phone=validated_data.get('phone', '')
        )
        # Create corresponding Customer profile
        Customer.objects.create(user=user, name=f"{user.first_name} {user.last_name}")
        return user

class CustomerRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterCustomerSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        # Adjuntamos el nombre del negocio (Tenant)
        if False:
            data['tenant_name'] = 'FerreNexo'
        return Response(data)

@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='dispatch')
class RateLimitedTokenObtainPairView(TokenObtainPairView):
    """
    Login view with rate limiting (5 attempts per minute per IP).
    """
    pass

from rest_framework.views import APIView
from rest_framework.response import Response
from .models import StoreConfig

class StoreSettingsView(APIView):
    def get(self, request):
        config = StoreConfig.objects.first()
        if not config:
            return Response({})
            
        data = {
            'afip_cuit': config.afip_cuit,
            'afip_punto_venta': config.afip_punto_venta,
            'bank_cvu': config.bank_cvu,
            'bank_alias': config.bank_alias,
            'whatsapp_number': config.whatsapp_number
        }
        
        # Include file paths if they exist
        if config.afip_certificate:
            data['afip_certificate_name'] = config.afip_certificate.name.split('/')[-1]
        if config.afip_private_key:
            data['afip_private_key_name'] = config.afip_private_key.name.split('/')[-1]
            
        return Response(data)

    def post(self, request):
        """Handle FormData with file uploads"""
        config = StoreConfig.objects.first()
        if not config:
            config = StoreConfig.objects.create()
            
        # Handle text fields
        if 'afip_cuit' in request.data:
            config.afip_cuit = request.data['afip_cuit']
        if 'afip_punto_venta' in request.data:
            try:
                config.afip_punto_venta = int(request.data['afip_punto_venta'])
            except (ValueError, TypeError):
                return Response({'error': 'afip_punto_venta must be an integer'}, status=status.HTTP_400_BAD_REQUEST)
        if 'bank_cvu' in request.data:
            config.bank_cvu = request.data['bank_cvu']
        if 'bank_alias' in request.data:
            config.bank_alias = request.data['bank_alias']
        if 'whatsapp_number' in request.data:
            config.whatsapp_number = request.data['whatsapp_number']
            
        # Handle file uploads
        if 'afip_certificate' in request.FILES:
            config.afip_certificate = request.FILES['afip_certificate']
        if 'afip_private_key' in request.FILES:
            config.afip_private_key = request.FILES['afip_private_key']
            
        config.save()
        return Response({'status': 'ok', 'message': 'Configuración guardada exitosamente'})

    def patch(self, request):
        """Keep backward compatibility with PATCH"""
        config = StoreConfig.objects.first()
        if not config:
            config = StoreConfig.objects.create()
            
        if 'afip_cuit' in request.data:
            config.afip_cuit = request.data['afip_cuit']
        if 'bank_cvu' in request.data:
            config.bank_cvu = request.data['bank_cvu']
        if 'bank_alias' in request.data:
            config.bank_alias = request.data['bank_alias']
        if 'whatsapp_number' in request.data:
            config.whatsapp_number = request.data['whatsapp_number']
            
        config.save()
        return Response({'status': 'ok'})

class StoreInfoView(APIView):
    permission_classes = [] # Allow public access for checkout and home page
    
    def get(self, request):
        config = StoreConfig.objects.first()
        if not config:
            return Response({'has_mp': False, 'name': 'FerreNexo'})
            
        return Response({
            'name': config.name,
            'afip_cuit': config.afip_cuit,
            'bank_cvu': config.bank_cvu,
            'bank_alias': config.bank_alias,
            'whatsapp_number': config.whatsapp_number,
            'has_mp': bool(config.mp_access_token)
        })
