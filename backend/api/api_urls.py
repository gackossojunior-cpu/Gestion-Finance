from django.urls import path
from . import views

urlpatterns = [
    path('transactions/', views.TransactionListCreateView.as_view(), name='api_transactions'),
    path('transactions/<uuid:id>/', views.TransactionRetrieveUpdateDestroyAPIView.as_view(), name='api_transaction_detail'),
    path('students/', views.StudentListCreateView.as_view(), name='api_students'),
    path('students/<uuid:id>/', views.StudentRetrieveUpdateDestroyAPIView.as_view(), name='api_student_detail'),
]
