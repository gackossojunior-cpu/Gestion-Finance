@echo off
cd "c:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB"
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "SELECT User, Host FROM mysql.user;"
pause