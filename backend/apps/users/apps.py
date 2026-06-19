from django.apps import AppConfig
from django.db.models.signals import post_migrate

def crear_superusuario_automatico(sender, **kwargs):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Datos para tu inicio de sesión en producción
    email_admin = "admin@ferre.com"
    password_admin = "FerreAdmin2026!" # Cambiala si querés
    
    # Al no usar 'username', filtramos y creamos solo con el email
    if not User.objects.filter(email=email_admin).exists():
        print("Creando superusuario personalizado por código...")
        User.objects.create_superuser(
            email=email_admin,
            password=password_admin
        )
        print("¡Superusuario personalizado creado con éxito!")

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core' # Asegurate de que sea el nombre de tu carpeta de app

    def ready(self):
        post_migrate.connect(crear_superusuario_automatico, sender=self)
