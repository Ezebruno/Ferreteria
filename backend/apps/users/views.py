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
            'store_address': config.store_address or '',
            'bank_cvu': config.bank_cvu,
            'bank_alias': config.bank_alias,
            'whatsapp_number': config.whatsapp_number,
            'instagram_url': config.instagram_url or '',
            'facebook_url': config.facebook_url or ''
        }
            
        return Response(data)

    def post(self, request):
        """Handle FormData with file uploads"""
        config = StoreConfig.objects.first()
        if not config:
            config = StoreConfig.objects.create()
            
        # Handle text fields
        if 'store_address' in request.data:
            config.store_address = request.data['store_address']
        if 'bank_cvu' in request.data:
            config.bank_cvu = request.data['bank_cvu']
        if 'bank_alias' in request.data:
            config.bank_alias = request.data['bank_alias']
        if 'whatsapp_number' in request.data:
            config.whatsapp_number = request.data['whatsapp_number']
        if 'instagram_url' in request.data:
            config.instagram_url = request.data['instagram_url']
        if 'facebook_url' in request.data:
            config.facebook_url = request.data['facebook_url']
            
        config.save()
        return Response({'status': 'ok', 'message': 'Configuración guardada exitosamente'})

    def patch(self, request):
        """Keep backward compatibility with PATCH"""
        config = StoreConfig.objects.first()
        if not config:
            config = StoreConfig.objects.create()
            
        if 'store_address' in request.data:
            config.store_address = request.data['store_address']
        if 'bank_cvu' in request.data:
            config.bank_cvu = request.data['bank_cvu']
        if 'bank_alias' in request.data:
            config.bank_alias = request.data['bank_alias']
        if 'whatsapp_number' in request.data:
            config.whatsapp_number = request.data['whatsapp_number']
        if 'instagram_url' in request.data:
            config.instagram_url = request.data['instagram_url']
        if 'facebook_url' in request.data:
            config.facebook_url = request.data['facebook_url']
            
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
            'store_address': config.store_address or '',
            'bank_cvu': config.bank_cvu,
            'bank_alias': config.bank_alias,
            'whatsapp_number': config.whatsapp_number,
            'instagram_url': config.instagram_url or '',
            'facebook_url': config.facebook_url or '',
            'has_mp': bool(config.mp_access_token)
        })
