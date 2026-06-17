import os
import django
import psycopg

# 1. Leer la URL de Neon directo desde las variables de Render
db_url = os.environ.get('DATABASE_URL')

if db_url:
    # Desarmamos la URL para extraerte los datos limpios de conexión
    from psycopg.engine import ConnectionInfo
    from psycopg.conninfo import ConnectionInfo
    
    # Configuramos Django antes de que inicialice sus modelos
    from django.conf import settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ferre_saas.settings')
    django.setup()
    
    # Le pisamos la base de datos local e inyectamos Neon a la fuerza
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': info.dbname,
        'USER': info.user,
        'PASSWORD': info.password,
        'HOST': info.host,
        'PORT': info.port or '5432',
    }
else:
    # Si no encuentra la variable (desarrollo local), corre normal
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ferre_saas.settings')
    django.setup()

from django.core.management import execute_from_command_line
from django.contrib.auth import get_user_model

def run_deploy():
    print("🚀 Conectando a Neon e iniciando migraciones...")
    # Correr las migraciones de tus tablas
    execute_from_command_line(['manage.py', 'migrate', '--noinput'])
    print("✅ Migraciones finalizadas con éxito.")

    # Crear el Superusuario automático
    User = get_user_model()
    username = 'admin' 
    email = 'tuemail@ejemplo.com'
    password = 'TuClaveSuperSecreta123!'  # Poné la contraseña que vos quieras acá

    if not User.objects.filter(username=username).exists():
        print(f"👤 Creando superusuario: {username}...")
        User.objects.create_superuser(username=username, email=email, password=password)
        print("✅ Superusuario creado con éxito.")
    else:
        print("ℹ️ El superusuario ya existe, salteando paso.")

if __name__ == '__main__':
    run_deploy()
