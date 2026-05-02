import os
import sys
import django

# Add the backend directory to the Python path
sys.path.insert(0, r'c:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB\backend')

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Setup Django
django.setup()

# Now run the migration
from django.core.management import execute_from_command_line
execute_from_command_line(['manage.py', 'migrate'])

print("Migrations applied successfully!")