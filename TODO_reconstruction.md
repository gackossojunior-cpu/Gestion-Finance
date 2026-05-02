# Plan de reconstruction des interfaces perdues

## Fichiers manquants/vides détectés
- [ ] `backend/api/templates/base.html` — SUPPRIMÉ
- [ ] `backend/api/templates/etudiants.html` — SUPPRIMÉ
- [ ] `backend/api/templates/transactions.html` — VIDE (0 octet)

## Fichiers à modifier
- [ ] `backend/api/views.py` — Aucune vue Django TemplateView
- [ ] `backend/api/urls.py` — Aucune route pour les pages HTML
- [ ] `backend/backend/urls.py` — Ne sert que les API

## Étapes
1. Recréer `base.html`
2. Recréer `etudiants.html`
3. Recréer `transactions.html`
4. Mettre à jour `views.py` (vues templates + formulaires)
5. Mettre à jour `api/urls.py`
6. Mettre à jour `backend/urls.py`

