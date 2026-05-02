import uuid
from django.db import models


class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.CharField(max_length=250)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.text} ({self.amount})"


class Student(models.Model):

    PAYMENT_MODE_CHOICES = [
        ('cash', 'Espèces'),
        ('mobile_money', 'Mobile Money'),
        ('virement', 'Virement bancaire'),
        ('cheque', 'Chèque'),
    ]

    STATUT_CHOICES = [
        ('paye', 'Payé'),
        ('partiel', 'Partiel'),
        ('non_paye', 'Non payé'),
    ]

    NIVEAU_CHOICES = [
        ('L1', 'Licence 1'), ('L2', 'Licence 2'), ('L3', 'Licence 3'),
        ('M1', 'Master 1'), ('M2', 'Master 2'),
        ('D1', 'Doctorat 1'), ('D2', 'Doctorat 2'), ('D3', 'Doctorat 3'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    matricule = models.CharField(max_length=50, unique=True)
    filiere = models.CharField(max_length=100, blank=True)
    niveau = models.CharField(max_length=10, choices=NIVEAU_CHOICES, default='L1')
    montant_total = models.DecimalField(max_digits=12, decimal_places=2)
    montant_paye = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mode_paiement = models.CharField(max_length=20, choices=PAYMENT_MODE_CHOICES, null=True, blank=True)
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='non_paye')
    date_paiement = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.matricule}) - {self.statut}"


class Enseignant(models.Model):
    TYPE_CHOICES = [
        ('permanent', 'Permanent'),
        ('vacataire', 'Vacataire'),
    ]

    STATUT_CHOICES = [
        ('paye', 'Payé'),
        ('partiel', 'Partiel'),
        ('en_attente', 'En attente'),
    ]

    MODE_PAIEMENT_CHOICES = [
        ('cash', 'Espèces'),
        ('mobile_money', 'Mobile Money'),
        ('virement', 'Virement bancaire'),
        ('cheque', 'Chèque'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    matricule = models.CharField(max_length=50, blank=True, default='')
    departement = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='permanent')
    salaire = models.DecimalField(max_digits=12, decimal_places=2)
    montant_paye = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mode_paiement = models.CharField(max_length=20, choices=MODE_PAIEMENT_CHOICES, null=True, blank=True)
    statut = models.CharField(max_length=15, choices=STATUT_CHOICES, default='en_attente')
    date_paiement = models.DateField(null=True, blank=True)
    mois_concerne = models.CharField(max_length=7, blank=True, help_text='Format : 2026-04')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.get_type_display()}"


class Personnel(models.Model):
    POSTE_CHOICES = [
        ('administratif', 'Administratif'),
        ('technique', 'Technique'),
        ('securite', 'Sécurité'),
        ('entretien', 'Entretien'),
        ('autre', 'Autre'),
    ]

    STATUT_CHOICES = [
        ('paye', 'Payé'),
        ('partiel', 'Partiel'),
        ('en_attente', 'En attente'),
    ]

    MODE_PAIEMENT_CHOICES = [
        ('cash', 'Espèces'),
        ('mobile_money', 'Mobile Money'),
        ('virement', 'Virement bancaire'),
        ('cheque', 'Chèque'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    matricule = models.CharField(max_length=50, blank=True, default='')
    poste = models.CharField(max_length=20, choices=POSTE_CHOICES, default='administratif')
    salaire = models.DecimalField(max_digits=12, decimal_places=2)
    montant_paye = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mode_paiement = models.CharField(max_length=20, choices=MODE_PAIEMENT_CHOICES, null=True, blank=True)
    statut = models.CharField(max_length=15, choices=STATUT_CHOICES, default='en_attente')
    date_paiement = models.DateField(null=True, blank=True)
    mois_concerne = models.CharField(max_length=7, blank=True, help_text='Format : 2025-04')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.get_poste_display()}"

