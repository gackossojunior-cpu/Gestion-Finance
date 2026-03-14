@echo off
title Gestion Finance UCCB
color 0A

echo ========================================
echo    Lancement de Gestion Finance UCCB
echo ========================================
echo.

:: ── BACKEND DJANGO ──────────────────────────────
echo [BACKEND] Activation du virtual environment...
cd /d "C:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB"
call .venv\Scripts\activate
cd backend

echo [BACKEND] Application des migrations...
python manage.py migrate

echo [BACKEND] Lancement du serveur Django...
start "Django Backend" cmd /k "cd /d C:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB && call .venv\Scripts\activate && cd backend && python manage.py runserver"

:: ── FRONTEND REACT ──────────────────────────────
echo [FRONTEND] Lancement du serveur React...
start "React Frontend" cmd /k "cd /d C:\Users\LENOVO\PycharmProjects\Gestion_finance_UCCB\frontend && npm start"

:: ── INFOS ────────────────────────────────────────
echo.
echo ========================================
echo  Backend  : http://127.0.0.1:8000
echo  Frontend : http://localhost:3000
echo  API      : http://127.0.0.1:8000/api/students/
echo ========================================
echo.
echo  Deux terminaux ont ete ouverts.
echo  Fermez-les pour arreter les serveurs.
echo ========================================
pause