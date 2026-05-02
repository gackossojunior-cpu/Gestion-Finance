@echo off
cd "c:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB\backend"
echo Applying migrations...
"c:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB\backend\env\Scripts\python.exe" manage.py migrate
echo Starting server...
"c:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB\backend\env\Scripts\python.exe" manage.py runserver 0.0.0.0:8000
pause