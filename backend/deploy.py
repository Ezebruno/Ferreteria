import os
import django
from django.core.management import execute_from_command_line

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ferre_saas.settings')
django.setup()

from django.contrib.auth import get_user_model

def run_deploy():
    print("🚀 Iniciando migraciones automáticas...")
    # 1. Correr las migraciones
    execute_from_command_line(['manage.py', 'migrate', '--noinput'])
    print("✅ Migraciones finalizadas con éxito.")

    # 2. Crear el Superusuario de forma automática si no existe
    User = get_user_model()
    
    # Podés cambiar estos 3 datos por los tuyos:
    username = 'admin' 
    email = 'tuemail@ejemplo.com'
    password = 'TuClaveSuperSecreta123!' 

    if not User.objects.filter(username=username).exists():
        print(f"👤 Creando superusuario: {username}...")
        User.objects.create_superuser(username=username, email=email, password=password)
        print("✅ Superusuario creado con éxito.")
    else:
        print("ℹ️ El superusuario ya existe, salteando paso.")

if __name__ == '__main__':
    run_deploy()