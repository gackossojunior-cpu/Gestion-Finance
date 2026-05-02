@echo off
cd "c:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB\backend"
"c:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB\backend\env\Scripts\python.exe" manage.py migrate
echo Migrations applied. Press any key to continue...
pause >nul