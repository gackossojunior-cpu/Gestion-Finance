from django.urls import path
from . import views

urlpatterns = [
    # Transactions
    path('transactions/', views.TransactionListCreateView.as_view()),
    path('transactions/<uuid:id>/', views.TransactionRetrieveUpdateDestroyAPIView.as_view()),

    # Students
    path('students/', views.StudentListCreateView.as_view()),
    path('students/<uuid:id>/', views.StudentRetrieveUpdateDestroyAPIView.as_view()),
]
