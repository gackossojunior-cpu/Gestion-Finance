import subprocess
import sys
import os

# Set the working directory
os.chdir(r'c:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB\backend')

# Run the migrate command
result = subprocess.run([
    r'c:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB\backend\env\Scripts\python.exe',
    'manage.py',
    'migrate'
], capture_output=True, text=True)

print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("Return code:", result.returncode)