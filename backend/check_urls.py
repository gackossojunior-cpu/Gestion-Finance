import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.urls import get_resolver

resolver = get_resolver()
print("URL patterns:")
for url in resolver.url_patterns:
    print(f"  {url.pattern} -> {getattr(url, 'lookup_str', type(url).__name__)}")

