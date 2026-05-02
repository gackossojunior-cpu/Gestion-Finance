from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),

    path('etudiants/', views.etudiants_view, name='etudiants'),
    path('etudiants/add/', views.add_etudiant, name='add_etudiant'),
    path('etudiants/pay/', views.pay_etudiant, name='pay_etudiant'),
    path('etudiants/delete/<uuid:id>/', views.delete_etudiant, name='delete_etudiant'),

    path('enseignants/', views.enseignants_view, name='enseignants'),
    path('enseignants/add/', views.add_enseignant, name='add_enseignant'),
    path('enseignants/pay/', views.pay_enseignant, name='pay_enseignant'),
    path('enseignants/delete/<uuid:id>/', views.delete_enseignant, name='delete_enseignant'),

    path('personnel/', views.personnel_view, name='personnel'),
    path('personnel/add/', views.add_personnel, name='add_personnel'),
    path('personnel/pay/', views.pay_personnel, name='pay_personnel'),
    path('personnel/delete/<uuid:id>/', views.delete_personnel, name='delete_personnel'),

    path('transactions/', views.transactions_view, name='transactions'),
    path('transactions/add/', views.add_transaction, name='add_transaction'),
    path('transactions/delete/<uuid:id>/', views.delete_transaction, name='delete_transaction'),
    path('transactions/<uuid:id>/receipt/', views.transaction_receipt, name='transaction_receipt'),
    path('etudiants/<uuid:id>/receipt/', views.student_receipt, name='student_receipt'),
]
