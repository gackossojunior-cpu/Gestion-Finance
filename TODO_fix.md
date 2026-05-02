# Fix Plan for TemplateDoesNotExist and Missing Views

## Issues Found:
1. `urls.py` references views that don't exist in `views.py`
2. `views.py` has wrong view names (`salaires_enseignants_view` instead of `enseignants_view`)
3. Missing `transactions.html` template
4. Missing transaction views (`transactions_view`, `add_transaction`, `delete_transaction`)
5. Missing enseignant views (`add_enseignant`, `pay_enseignant`, `delete_enseignant`)
6. Missing personnel views (`add_personnel`, `pay_personnel`, `delete_personnel`)
7. `base.html` navigation incomplete

## Steps:
- [ ] Step 1: Update `views.py` - rename views, add missing views, fix template references
- [ ] Step 2: Create `transactions.html` template
- [ ] Step 3: Update `base.html` navigation
- [ ] Step 4: Test the application

