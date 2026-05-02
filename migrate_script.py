#!/usr/bin/env python
import os
import sys
import subprocess

# Set environment
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
sys.path.insert(0, r'c:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB\backend')

# Import Django
import django
django.setup()

# Run migrations
from django.core.management import call_command
print("Applying migrations...")
call_command('migrate', verbosity=2)
print("Migrations completed successfully!")