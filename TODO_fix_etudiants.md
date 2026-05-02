# Plan de correction - Interface Étudiants + Dashboard accueil

## Information Gathered
- `etudiants.html` a des balises non fermées, pas de recherche/filtres, pas de boutons ajouter/supprimer
- `base.html` a des conditions `request.path` incorrectes (Dashboard jamais surligné, Transactions mal lié)
- `dashboard_view` ne passe pas les variables `retard` et `derniers_paiements` au template
- Le dashboard est déjà l'accueil côté URLs, seule la navigation est à corriger

## Plan

### Étape 1 : Réparer `etudiants.html` ✅
- Corriger toutes les balises non fermées
- Ajouter barre de recherche + filtres statut/niveau
- Ajouter bouton "Ajouter étudiant" avec modal
- Ajouter bouton "Supprimer" par ligne
- Uniformiser le style avec `enseignants.html`

### Étape 2 : Corriger `base.html` ✅
- Dashboard actif sur `request.path == '/'`
- Transactions actif sur `request.path == '/transactions/'`

### Étape 3 : Compléter `dashboard_view` dans `views.py` ✅
- Ajouter `retard` = étudiants non payés / partiels avec reste > 0
- Ajouter `derniers_paiements` = 10 dernières transactions

### Étape 4 : Ajouter filtre niveau dans `etudiants_view` ✅
- Gérer le paramètre `niveau` dans la requête GET

## Dependent Files
- `backend/api/templates/etudiants.html`
- `backend/api/templates/base.html`
- `backend/api/views.py`

## Followup Steps
- Redémarrer le serveur Django
- Vider le cache navigateur
- Tester les pages /, /etudiants/, /transactions/

