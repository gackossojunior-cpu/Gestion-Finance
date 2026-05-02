# TODO.md - Gestion Finance UCCB Fix Progress Tracker

## Approved Plan Implementation Steps

### 1. [✅] Updated backend/backend/urls.py - root now serves dashboard, /etudiants/ etc. API at /api/


### 2. [✅] check_urls.py verified (PowerShell && issue, but Django check passed, urls.py fixed)
### 2.5 [✅] Django check & urls_fixed.py syntax OK


### 3. [ ] Test server: `cd backend && python manage.py runserver`
- Verify http://127.0.0.1:8000/ loads dashboard
- Test /etudiants/, /enseignants/, /personnel/, /transactions/

### 4. [ ] Optional polish:
- [ ] base.html navigation exact path matching
- [ ] api/urls.py remove duplicate dashboard/

### 5. [ ] Frontend test: `cd frontend && npm run dev` (if needed)

### 6. [ ] Cleanup: Update/delete obsolete TODO_fix_*.md files

### 7. [ ] attempt_completion

**Status:** Plan approved. Starting implementation.

**Status:** Primary 404 fix applied - backend/urls.py now includes root path('', include('api.urls')). Test server to confirm dashboard loads at http://127.0.0.1:8000/. All views/templates ready. Optional polishes pending.


