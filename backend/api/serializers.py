from rest_framework import serializers
from .models import Transaction, Student


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "text", "amount", "created_at"]
        read_only_fields = ["id", "created_at"]


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            "id", "name", "matricule", "filiere", "niveau",
            "montant_total", "montant_paye", "mode_paiement",
            "statut", "date_paiement", "created_at"
        ]
        read_only_fields = ["id", "created_at"]
