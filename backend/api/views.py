from decimal import Decimal
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import generics
from django.contrib.auth.decorators import login_required

from .models import Transaction, Student, Enseignant, Personnel, Bus, AffectationTransport, Trajet, DepenseTransport
from .serializers import TransactionSerializer, StudentSerializer, BusSerializer, AffectationTransportSerializer, TrajetSerializer, DepenseTransportSerializer


# ═══════════════════════════════════════════════════════════════════════════════
# API Views (DRF)
# ═══════════════════════════════════════════════════════════════════════════════

class TransactionListCreateView(generics.ListCreateAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer


class TransactionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    lookup_field = 'id'


class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer 


class StudentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    lookup_field = 'id'


# ═══════════════════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════════════════

def get_finance_stats():
    income = Transaction.objects.filter(amount__gt=0).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    expense = Transaction.objects.filter(amount__lt=0).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    solde = income + expense
    return {
        'income': income,
        'expense': abs(expense),
        'solde': solde,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# Dashboard
# ═══════════════════════════════════════════════════════════════════════════════
@login_required
def dashboard_view(request):
    stats = get_finance_stats()

    # Students stats
    students = Student.objects.all()
    total_etu = students.count()
    nb_payes = students.filter(statut='paye').count()
    nb_partiels = students.filter(statut='partiel').count()
    nb_non_payes = students.filter(statut='non_paye').count()

    total_attendu = sum(s.montant_total for s in students)
    total_paye_etu = sum(s.montant_paye for s in students)
    pct_recouvrement = (total_paye_etu / total_attendu * 100) if total_attendu > 0 else 0

    # Retards (étudiants non payés ou partiels avec reste > 0)
    retard = []
    for s in students.filter(statut__in=['partiel', 'non_paye']):
        reste = s.montant_total - s.montant_paye
        if reste > 0:
            retard.append({
                'name': s.name,
                'matricule': s.matricule,
                'reste': reste,
            })

    # Derniers paiements (transactions)
    derniers_paiements = Transaction.objects.all()[:10]

    # Salaires
    total_salaires = (Enseignant.objects.aggregate(total=Sum('salaire'))['total'] or Decimal('0')) + \
                     (Personnel.objects.aggregate(total=Sum('salaire'))['total'] or Decimal('0'))
    total_paye_salaires = (Enseignant.objects.aggregate(total=Sum('montant_paye'))['total'] or Decimal('0')) + \
                          (Personnel.objects.aggregate(total=Sum('montant_paye'))['total'] or Decimal('0'))

    context = {
        **stats,
        'etu': {
            'total': total_etu,
            'payes': nb_payes,
            'partiels': nb_partiels,
            'non_payes': nb_non_payes,
        },
        'pct_recouvrement': pct_recouvrement,
        'total_attendu': total_attendu,
        'total_paye': total_paye_etu,
        'retard': retard,
        'derniers_paiements': derniers_paiements,
        'total_salaires': total_salaires,
        'total_paye_salaires': total_paye_salaires,
    }
    return render(request, 'dashboard.html', context)


# ═══════════════════════════════════════════════════════════════════════════════
# Étudiants
# ═══════════════════════════════════════════════════════════════════════════════
@login_required
def etudiants_view(request):
    queryset = Student.objects.all()
    search = request.GET.get('q', '')
    filter_niveau = request.GET.get('niveau', 'all')
    filter_statut = request.GET.get('statut', 'all')

    if search:
        queryset = queryset.filter(Q(name__icontains=search) | Q(matricule__icontains=search))
    if filter_niveau != 'all':
        queryset = queryset.filter(niveau=filter_niveau)
    if filter_statut != 'all':
        queryset = queryset.filter(statut=filter_statut)

    total = Student.objects.count()
    nb_payes = Student.objects.filter(statut='paye').count()
    nb_partiels = Student.objects.filter(statut='partiel').count()
    nb_non_payes = Student.objects.filter(statut='non_paye').count()

    today = timezone.now().date()
    
    for etudiant in queryset :
        etudiant.en_alerte = (
            today.day >= 5 and 
            etudiant.statut in ['non_paye', 'partiel']
        )

    context = {
        'etudiants': queryset,
        'search': search,
        'filter_niveau': filter_niveau,
        'filter_statut': filter_statut,
        'total': total,
        'nb_payes': nb_payes,
        'nb_partiels': nb_partiels,
        'nb_non_payes': nb_non_payes,
    }
    return render(request, 'etudiants.html', context)


def add_etudiant(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        matricule = request.POST.get('matricule')
        filiere = request.POST.get('filiere', '')
        niveau = request.POST.get('niveau', 'L1')
        montant_total = Decimal(request.POST.get('montant_total', 0))
        mode_paiement = request.POST.get('mode_paiement', 'cash')

        Student.objects.create(
            name=name,
            matricule=matricule,
            filiere=filiere,
            niveau=niveau,
            montant_total=montant_total,
            montant_paye=Decimal('0'),
            mode_paiement=mode_paiement,
            statut='non_paye',
        )
        messages.success(request, f"Étudiant {name} ajouté avec succès.")
    return redirect('etudiants')


def pay_etudiant(request):
    if request.method == 'POST':
        etudiant_id = request.POST.get('etudiant_id')
        montant = Decimal(request.POST.get('montant', 0))
        mode_paiement = request.POST.get('mode_paiement', 'cash')

        student = get_object_or_404(Student, id=etudiant_id)

        if student.montant_paye >= student.montant_total:
            messages.error(request, f"L'étudiant {student.name} a déjà payé la totalité de sa scolarité.")
            return redirect('etudiants')
        
        reste = student.montant_total - student.montant_paye
        if montant > reste:
            messages.error(request, f"Le montant payé dépasse le reste dû ({reste}).")
            return redirect('etudiants')
        
        student.montant_paye += montant
        student.mode_paiement = mode_paiement
        student.date_paiement = timezone.now().date()

        if student.montant_paye >= student.montant_total:
            student.statut = 'paye'
        elif student.montant_paye > 0:
            student.statut = 'partiel'

        student.save()

        # Create transaction
        Transaction.objects.create(
            text=f"Paiement scolarité - {student.name}",
            amount=montant,
        )
        messages.success(request, f"Paiement de {montant} enregistré pour {student.name}.")
    return redirect('etudiants')


def delete_etudiant(request, id):
    student = get_object_or_404(Student, id=id)
    student.delete()
    messages.success(request, f"Étudiant {student.name} supprimé.")
    return redirect('etudiants')


# ═══════════════════════════════════════════════════════════════════════════════
# Enseignants
# ═══════════════════════════════════════════════════════════════════════════════
@login_required
def enseignants_view(request):
    queryset = Enseignant.objects.all()
    search = request.GET.get('q', '')
    mois = request.GET.get('mois', '')
    filter_statut = request.GET.get('statut', 'all')

    if search:
        queryset = queryset.filter(Q(name__icontains=search) | Q(matricule__icontains=search))
    if mois:
        queryset = queryset.filter(mois_concerne=mois)
    if filter_statut != 'all':
        queryset = queryset.filter(statut=filter_statut)

    total = Enseignant.objects.count()
    nb_payes = Enseignant.objects.filter(statut='paye').count()
    nb_partiels = Enseignant.objects.filter(statut='partiel').count()
    nb_attente = Enseignant.objects.filter(statut='en_attente').count()
    total_salary = queryset.aggregate(total=Sum('salaire'))['total'] or Decimal('0')
    total_paid = queryset.aggregate(total=Sum('montant_paye'))['total'] or Decimal('0')
    total_remaining = total_salary - total_paid
    mois_courant = timezone.now().strftime('%Y-%m')

    context = {
        'enseignants': queryset,
        'search': search,
        'mois': mois,
        'filter_statut': filter_statut,
        'total': total,
        'nb_payes': nb_payes,
        'nb_partiels': nb_partiels,
        'nb_attente': nb_attente,
        'total_salary': total_salary,
        'total_paid': total_paid,
        'total_remaining': total_remaining,
        'mois_courant': mois_courant,
    }
    return render(request, 'enseignants.html', context)


def add_enseignant(request):
    if request.method == 'POST':
        enseignant = Enseignant.objects.create(
            name=request.POST.get('name'),
            email=request.POST.get('email', ''),
            departement=request.POST.get('departement', ''),
            type=request.POST.get('type', 'permanent'),
            salaire=Decimal(request.POST.get('salaire', 0)),
            mois_concerne=request.POST.get('mois_concerne', ''),
        )
        messages.success(request, f"Enseignant {enseignant.name} ajouté avec succès.")
    return redirect('enseignants')


def pay_enseignant(request):
    if request.method == 'POST':
        enseignant_id = request.POST.get('enseignant_id')
        montant = Decimal(request.POST.get('montant', 0))

        ens = get_object_or_404(Enseignant, id=enseignant_id)

        if ens.montant_paye >= ens.salaire:
            messages.error(request, f"L'enseignant {ens.name} a déjà reçu la totalité de son salaire.")
            return redirect('enseignants')

        reste = ens.salaire - ens.montant_paye

        if montant > reste :
            messages.error(request, f"paiement refusé. Il reste seulement {reste} à payer.")
            return redirect('enseignants')
        
        ens.montant_paye += montant
        ens.date_paiement = timezone.now().date()

        if ens.montant_paye >= ens.salaire:
            ens.statut = 'paye'
        elif ens.montant_paye > 0:
            ens.statut = 'partiel'

        ens.save()

        Transaction.objects.create(
            text=f"Salaire enseignant - {ens.name}",
            amount=-montant,
        )
        messages.success(request, f"Paiement de salaire de {montant} enregistré pour {ens.name}.")
    return redirect('enseignants')


def delete_enseignant(request, id):
    ens = get_object_or_404(Enseignant, id=id)
    ens.delete()
    messages.success(request, f"Enseignant {ens.name} supprimé.")
    return redirect('enseignants')


# ═══════════════════════════════════════════════════════════════════════════════
# Personnel
# ═══════════════════════════════════════════════════════════════════════════════
@login_required
def personnel_view(request):
    queryset = Personnel.objects.all()
    search = request.GET.get('q', '')
    mois = request.GET.get('mois', '')
    filter_statut = request.GET.get('statut', 'all')

    if search:
        queryset = queryset.filter(Q(name__icontains=search) | Q(matricule__icontains=search))
    if mois:
        queryset = queryset.filter(mois_concerne=mois)
    if filter_statut != 'all':
        queryset = queryset.filter(statut=filter_statut)

    total = Personnel.objects.count()
    nb_payes = Personnel.objects.filter(statut='paye').count()
    nb_partiels = Personnel.objects.filter(statut='partiel').count()
    nb_attente = Personnel.objects.filter(statut='en_attente').count()
    total_salary = queryset.aggregate(total=Sum('salaire'))['total'] or Decimal('0')
    total_paid = queryset.aggregate(total=Sum('montant_paye'))['total'] or Decimal('0')
    total_remaining = total_salary - total_paid
    mois_courant = timezone.now().strftime('%Y-%m')

    context = {
        'personnel': queryset,
        'search': search,
        'mois': mois,
        'filter_statut': filter_statut,
        'total': total,
        'nb_payes': nb_payes,
        'nb_partiels': nb_partiels,
        'nb_attente': nb_attente,
        'total_salary': total_salary,
        'total_paid': total_paid,
        'total_remaining': total_remaining,
        'mois_courant': mois_courant,
        'postes': Personnel.POSTE_CHOICES,
    }
    return render(request, 'personnel.html', context)


def add_personnel(request):
    if request.method == 'POST':
        personnel = Personnel.objects.create(
            name=request.POST.get('name'),
            email=request.POST.get('email', ''),
            poste=request.POST.get('poste', 'administratif'),
            salaire=Decimal(request.POST.get('salaire', 0)),
            mois_concerne=request.POST.get('mois_concerne', ''),
        )
        messages.success(request, f"Personnel {personnel.name} ajouté avec succès.")
    return redirect('personnel')


def pay_personnel(request):
    if request.method == 'POST':
        personnel_id = request.POST.get('personnel_id')
        montant = Decimal(request.POST.get('montant', 0))

        pers = get_object_or_404(Personnel, id=personnel_id)

        if pers.montant_paye >= pers.salaire:
            messages.error(request, f"{pers.name} a déjà reçu la totalité de son salaire")
            return redirect('personnel')
        
        reste = pers.salaire - pers.montant_paye

        if montant > reste:
            messages.error(request, f"Paiement refusé. Il reste seulement {reste} à payer.")
            return redirect('personnel')
        pers.montant_paye += montant
        pers.date_paiement = timezone.now().date()

        if pers.montant_paye >= pers.salaire:
            pers.statut = 'paye'
        elif pers.montant_paye > 0:
            pers.statut = 'partiel'

        pers.save()

        Transaction.objects.create(
            text=f"Salaire personnel - {pers.name}",
            amount=-montant,
        )
        messages.success(request, f"Paiement de salaire de {montant} enregistré pour {pers.name}.")
    return redirect('personnel')


def delete_personnel(request, id):
    pers = get_object_or_404(Personnel, id=id)
    pers.delete()
    messages.success(request, f"Personnel {pers.name} supprimé.")
    return redirect('personnel')


# ═══════════════════════════════════════════════════════════════════════════════
# Transactions
# ═══════════════════════════════════════════════════════════════════════════════
@login_required
def transactions_view(request):
    stats = get_finance_stats()
    transactions = Transaction.objects.all()

    # Filtrage par type
    filter_type = request.GET.get('type', 'all')
    if filter_type == 'revenus':
        transactions = transactions.filter(amount__gt=0)
    elif filter_type == 'depenses':
        transactions = transactions.filter(amount__lt=0)
    elif filter_type == 'salaires':
        transactions = transactions.filter(
            Q(text__startswith='Salaire enseignant') | Q(text__startswith='Salaire personnel')
        )
    elif filter_type == 'scolarite':
        transactions = transactions.filter(text__startswith='Paiement scolarité')
    elif filter_type == 'autres':
        transactions = transactions.exclude(
            Q(text__startswith='Salaire enseignant') |
            Q(text__startswith='Salaire personnel') |
            Q(text__startswith='Paiement scolarité')
        )

    context = {
        **stats,
        'transactions': transactions,
        'filter_type': filter_type,
    }
    return render(request, 'transactions.html', context)


def add_transaction(request):
    if request.method == 'POST':
        text = request.POST.get('text')
        amount = Decimal(request.POST.get('amount', 0))
        Transaction.objects.create(text=text, amount=amount)
        messages.success(request, "Transaction ajoutée avec succès.")
    return redirect('transactions')


def delete_transaction(request, id):
    transaction = get_object_or_404(Transaction, id=id)
    transaction.delete()
    messages.success(request, "Transaction supprimée avec succès.")
    return redirect('transactions')


def transaction_receipt(request, id):
    transaction = get_object_or_404(Transaction, id=id)
    receipt_type = 'Entrée' if transaction.amount > 0 else 'Sortie'
    context = {
        'transaction': transaction,
        'receipt_type': receipt_type,
        'receipt_number': str(transaction.id).split('-')[0].upper(),
    }
    return render(request, 'receipt_transaction.html', context)


def student_receipt(request, id):
    student = get_object_or_404(Student, id=id)
    payment_transaction = Transaction.objects.filter(
        text__startswith=f"Paiement scolarité - {student.name}"
    ).order_by('-created_at').first()
    payment_amount = payment_transaction.amount if payment_transaction else student.montant_paye
    payment_date = payment_transaction.created_at if payment_transaction else student.date_paiement
    if payment_date and hasattr(payment_date, 'date'):
        payment_date = payment_date.date()
    remaining_amount = student.montant_total - student.montant_paye
    context = {
        'student': student,
        'payment_transaction': payment_transaction,
        'payment_amount': payment_amount,
        'payment_date': payment_date,
        'remaining_amount': remaining_amount,
        'receipt_number': (payment_transaction and str(payment_transaction.id).split('-')[0].upper()) or str(student.id).split('-')[0].upper(),
    }
    return render(request, 'receipt_student.html', context)


# ═══════════════════════════════════════════════════════════════════════════════
# Transports
# ═══════════════════════════════════════════════════════════════════════════════
@login_required
def transports_view(request):
    """Affiche la liste des bus et trajets"""
    buses = Bus.objects.all()
    trajets = Trajet.objects.all()
    affectations = AffectationTransport.objects.filter(actif=True)
    depenses = DepenseTransport.objects.all()
    personnels = Personnel.objects.all()
    
    # Statistiques
    total_buses = buses.count()
    buses_actifs = buses.filter(statut='actif').count()
    buses_maintenance = buses.filter(statut='maintenance').count()
    buses_hors_service = buses.filter(statut='hors_service').count()
    total_trajets = trajets.count()
    active_affectations = affectations.count()
    
    # Total des dépenses
    total_depenses = depenses.aggregate(total=Sum('montant'))['total'] or Decimal('0')
    depenses_carburant = depenses.filter(type_depense='carburant').aggregate(total=Sum('montant'))['total'] or Decimal('0')
    depenses_entretien = depenses.filter(type_depense='entretien').aggregate(total=Sum('montant'))['total'] or Decimal('0')
    depenses_reparation = depenses.filter(type_depense='reparation').aggregate(total=Sum('montant'))['total'] or Decimal('0')
    
    context = {
        'buses': buses,
        'trajets': trajets,
        'affectations': affectations,
        'depenses': depenses,
        'personnels': personnels,
        'total_buses': total_buses,
        'buses_actifs': buses_actifs,
        'buses_maintenance': buses_maintenance,
        'buses_hors_service': buses_hors_service,
        'total_trajets': total_trajets,
        'active_affectations': active_affectations,
        'total_depenses': total_depenses,
        'depenses_carburant': depenses_carburant,
        'depenses_entretien': depenses_entretien,
        'depenses_reparation': depenses_reparation,
    }
    return render(request, 'transports.html', context)


def add_bus(request):
    """Ajoute un nouveau bus"""
    if request.method == 'POST':
        numero = request.POST.get('numero')
        plaque = request.POST.get('plaque')
        capacite = int(request.POST.get('capacite', 50))
        
        bus = Bus.objects.create(
            numero=numero,
            plaque=plaque,
            capacite=capacite,
            statut='actif'
        )
        messages.success(request, f"Bus {bus.numero} ajouté avec succès.")
    return redirect('transports')


def edit_bus(request, id):
    """Modifie un bus"""
    bus = get_object_or_404(Bus, id=id)
    if request.method == 'POST':
        bus.numero = request.POST.get('numero', bus.numero)
        bus.plaque = request.POST.get('plaque', bus.plaque)
        bus.capacite = int(request.POST.get('capacite', bus.capacite))
        bus.statut = request.POST.get('statut', bus.statut)
        bus.save()
        messages.success(request, f"Bus {bus.numero} modifié avec succès.")
    return redirect('transports')


def delete_bus(request, id):
    """Supprime un bus"""
    bus = get_object_or_404(Bus, id=id)
    bus.delete()
    messages.success(request, f"Bus {bus.numero} supprimé avec succès.")
    return redirect('transports')


def add_trajet(request):
    """Ajoute un nouveau trajet"""
    if request.method == 'POST':
        nom = request.POST.get('nom')
        depart = request.POST.get('depart')
        destination = request.POST.get('destination')
        heure_depart = request.POST.get('heure_depart')
        heure_arrivee = request.POST.get('heure_arrivee')
        
        trajet = Trajet.objects.create(
            nom=nom,
            depart=depart,
            destination=destination,
            heure_depart=heure_depart,
            heure_arrivee=heure_arrivee
        )
        messages.success(request, f"Trajet {trajet.nom} ajouté avec succès.")
    return redirect('transports')


def delete_trajet(request, id):
    """Supprime un trajet"""
    trajet = get_object_or_404(Trajet, id=id)
    trajet.delete()
    messages.success(request, f"Trajet {trajet.nom} supprimé avec succès.")
    return redirect('transports')


def add_affectation(request):
    """Ajoute une affectation de bus à un chauffeur"""
    if request.method == 'POST':
        bus_id = request.POST.get('bus_id')
        chauffeur_id = request.POST.get('chauffeur_id')
        trajet_id = request.POST.get('trajet_id')
        date_debut = request.POST.get('date_debut')
        
        bus = get_object_or_404(Bus, id=bus_id)
        chauffeur = get_object_or_404(Personnel, id=chauffeur_id) if chauffeur_id else None
        trajet = get_object_or_404(Trajet, id=trajet_id)
        
        affectation = AffectationTransport.objects.create(
            bus=bus,
            chauffeur=chauffeur,
            trajet=trajet,
            date_debut=date_debut,
            actif=True
        )
        messages.success(request, f"Affectation de transport {affectation.id} créée avec succès.")
    return redirect('transports')


def end_affectation(request, id):
    """Termine une affectation"""
    affectation = get_object_or_404(AffectationTransport, id=id)
    affectation.date_fin = timezone.now().date()
    affectation.actif = False
    affectation.save()
    messages.success(request, f"Affectation {affectation.id} terminée.")
    return redirect('transports')


def add_depense_transport(request):
    """Ajoute une dépense de transport"""
    if request.method == 'POST':
        bus_id = request.POST.get('bus_id')
        type_depense = request.POST.get('type_depense')
        montant = Decimal(request.POST.get('montant', 0))
        description = request.POST.get('description', '')
        
        bus = get_object_or_404(Bus, id=bus_id)
        
        depense = DepenseTransport.objects.create(
            bus=bus,
            type_depense=type_depense,
            montant=montant,
            description=description
        )
        
        # Enregistrer la transaction
        Transaction.objects.create(
            text=f"Dépense transport - {bus.numero} ({type_depense})",
            amount=-montant,
        )
        messages.success(request, f"Dépense de transport de {montant} ajoutée pour le bus {bus.numero}.")
    return redirect('transports')


def delete_depense_transport(request, id):
    """Supprime une dépense de transport"""
    depense = get_object_or_404(DepenseTransport, id=id)
    depense.delete()
    messages.success(request, "Dépense de transport supprimée avec succès.")
    return redirect('transports')
