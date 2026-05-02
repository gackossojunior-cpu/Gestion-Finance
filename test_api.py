import requests

try:
    response = requests.get('http://localhost:8000/api/students/', timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}...")
except Exception as e:
    print(f"Error: {e}")