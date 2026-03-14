"use client"
import toast from "react-hot-toast"
import { useState, useEffect } from "react"
import {
  GraduationCap, CreditCard, CheckCircle, XCircle,
  Search, PlusCircle, Trash, Eye, Banknote
} from "lucide-react"
import { useFinance, Student, PaymentMode } from "../FinanceContext"

const PAYMENT_LABELS: Record<PaymentMode, string> = {
  cash: "Espèces",
  mobile_money: "Mobile Money",
  virement: "Virement bancaire",
  cheque: "Chèque",
}

const PAYMENT_COLORS: Record<PaymentMode, string> = {
  cash: "badge-success",
  mobile_money: "badge-info",
  virement: "badge-primary",
  cheque: "badge-secondary",
}

export default function StudentPayments() {
  const { students, loadingSt, addStudent, deleteStudent, payStudent } = useFinance()

  const [filtered, setFiltered] = useState<Student[]>([])
  const [search, setSearch] = useState("")
  const [filterStatut, setFilterStatut] = useState("all")
  const [loading, setLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Form ajout étudiant
  const [form, setForm] = useState({
    name: "", matricule: "", filiere: "", niveau: "L1",
    montant_total: "" as number | "",
    montant_paye: "" as number | "",
    mode_paiement: "cash" as PaymentMode,
    date_paiement: "",
  })

  // Form paiement
  const [payForm, setPayForm] = useState({
    montant: "" as number | "",
    mode: "cash" as PaymentMode,
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    let list = students
    if (search) list = list.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matricule.toLowerCase().includes(search.toLowerCase())
    )
    if (filterStatut !== "all") list = list.filter(s => s.statut === filterStatut)
    setFiltered(list)
  }, [search, filterStatut, students])

  const handleAddStudent = async () => {
    if (!form.name || !form.matricule || form.montant_total === "") {
      toast.error("Merci de remplir tous les champs obligatoires")
      return
    }
    setLoading(true)
    try {
      await addStudent({
        name: form.name,
        matricule: form.matricule,
        filiere: form.filiere,
        niveau: form.niveau,
        montant_total: Number(form.montant_total),
        montant_paye: Number(form.montant_paye) || 0,
        mode_paiement: Number(form.montant_paye) > 0 ? form.mode_paiement : null,
        date_paiement: form.date_paiement || null,
      })
      toast.success("Étudiant ajouté avec succès")
      ;(document.getElementById("modal_add") as HTMLDialogElement)?.close()
      setForm({ name: "", matricule: "", filiere: "", niveau: "L1", montant_total: "", montant_paye: "", mode_paiement: "cash", date_paiement: "" })
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    if (!selectedStudent || payForm.montant === "" || Number(payForm.montant) <= 0) {
      toast.error("Entrez un montant valide")
      return
    }
    const reste = selectedStudent.montant_total - selectedStudent.montant_paye
    if (Number(payForm.montant) > reste) {
      toast.error(`Le montant dépasse le reste à payer (${formatMontant(reste)})`)
      return
    }
    setLoading(true)
    try {
      await payStudent(selectedStudent.id, Number(payForm.montant), payForm.mode, payForm.date)
      ;(document.getElementById("modal_pay") as HTMLDialogElement)?.close()
      setPayForm({ montant: "", mode: "cash", date: new Date().toISOString().split("T")[0] })
    } finally {
      setLoading(false)
    }
  }

  const openPayModal = (s: Student) => {
    setSelectedStudent(s)
    setPayForm({ montant: "", mode: "cash", date: new Date().toISOString().split("T")[0] })
    ;(document.getElementById("modal_pay") as HTMLDialogElement)?.showModal()
  }

  const openDetailModal = (s: Student) => {
    setSelectedStudent(s)
    ;(document.getElementById("modal_detail") as HTMLDialogElement)?.showModal()
  }

  const total = students.length
  const payes = students.filter(s => s.statut === "paye").length
  const partiels = students.filter(s => s.statut === "partiel").length
  const nonPayes = students.filter(s => s.statut === "non_paye").length
  const totalCollecte = students.reduce((s, e) => s + Number(e.montant_paye), 0)
  const totalAttendu = students.reduce((s, e) => s + Number(e.montant_total), 0)

  const statutBadge = (statut: Student["statut"]) => {
    if (statut === "paye") return <span className="badge badge-success badge-soft gap-1"><CheckCircle className="w-3 h-3" /> Payé</span>
    if (statut === "partiel") return <span className="badge badge-warning badge-soft gap-1"><CreditCard className="w-3 h-3" /> Partiel</span>
    return <span className="badge badge-error badge-soft gap-1"><XCircle className="w-3 h-3" /> Non payé</span>
  }

  const formatMontant = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA"
  const formatDate = (d: string | null) => {
    if (!d) return "—"
    const date = new Date(d)
    return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="w-full flex flex-col gap-4 p-4">

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-warning" />
          <h1 className="text-2xl font-bold">Gestion des Paiements Étudiants</h1>
        </div>
        <button className="btn btn-warning" onClick={() => (document.getElementById("modal_add") as HTMLDialogElement)?.showModal()}>
          <PlusCircle className="w-4 h-4" /> Ajouter un étudiant
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border-2 border-dashed border-base-300 bg-base-100 p-4 flex flex-col gap-1">
          <span className="text-sm text-base-content/60">Total étudiants</span>
          <span className="text-3xl font-bold">{total}</span>
        </div>
        <div className="rounded-2xl border-2 border-dashed border-success/30 bg-success/5 p-4 flex flex-col gap-1">
          <span className="text-sm text-success/80 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Payés</span>
          <span className="text-3xl font-bold text-success">{payes}</span>
        </div>
        <div className="rounded-2xl border-2 border-dashed border-warning/30 bg-warning/5 p-4 flex flex-col gap-1">
          <span className="text-sm text-warning/80 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Partiels</span>
          <span className="text-3xl font-bold text-warning">{partiels}</span>
        </div>
        <div className="rounded-2xl border-2 border-dashed border-error/30 bg-error/5 p-4 flex flex-col gap-1">
          <span className="text-sm text-error/80 flex items-center gap-1"><XCircle className="w-3 h-3" /> Non payés</span>
          <span className="text-3xl font-bold text-error">{nonPayes}</span>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-warning/20 bg-warning/5 p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="badge badge-warning badge-soft">Collecte globale</span>
          <span className="font-semibold">{totalAttendu > 0 ? ((totalCollecte / totalAttendu) * 100).toFixed(1) : 0}%</span>
        </div>
        <progress className="progress progress-warning w-full" value={totalAttendu > 0 ? (totalCollecte / totalAttendu) * 100 : 0} max="100" />
        <div className="flex justify-between text-sm mt-1 text-base-content/60">
          <span>Collecté : {formatMontant(totalCollecte)}</span>
          <span>Attendu : {formatMontant(totalAttendu)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input type="text" placeholder="Rechercher par nom ou matricule..." className="input input-bordered w-full pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select select-bordered" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="paye">Payé</option>
          <option value="partiel">Partiel</option>
          <option value="non_paye">Non payé</option>
        </select>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-base-300 overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50">
              <th>#</th><th>Étudiant</th><th>Filière / Niveau</th>
              <th>Mode de paiement</th><th>Montant payé</th>
              <th>Statut</th><th>Date paiement</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingSt ? (
              <tr><td colSpan={8} className="text-center py-8">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 opacity-40">Aucun étudiant trouvé</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} className="hover">
                <th>{i + 1}</th>
                <td><div className="font-semibold">{s.name}</div><div className="text-xs text-base-content/50">{s.matricule}</div></td>
                <td><div>{s.filiere}</div><div className="text-xs text-base-content/50">{s.niveau}</div></td>
                <td>
                  {s.mode_paiement
                    ? <span className={`badge badge-soft ${PAYMENT_COLORS[s.mode_paiement]}`}>{PAYMENT_LABELS[s.mode_paiement]}</span>
                    : <span className="text-base-content/30 text-sm">—</span>}
                </td>
                <td>
                  <div className="font-semibold">{formatMontant(s.montant_paye)}</div>
                  <div className="text-xs text-base-content/50">/ {formatMontant(s.montant_total)}</div>
                </td>
                <td>{statutBadge(s.statut)}</td>
                <td className="text-sm">{formatDate(s.date_paiement)}</td>
                <td>
                  <div className="flex gap-1">
                    {s.statut !== "paye" && (
                      <button className="btn btn-sm btn-success btn-soft" title="Enregistrer un paiement" onClick={() => openPayModal(s)}>
                        <Banknote className="w-4 h-4" />
                      </button>
                    )}
                    <button className="btn btn-sm btn-info btn-soft" title="Voir détails" onClick={() => openDetailModal(s)}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="btn btn-sm btn-error btn-soft" title="Supprimer" onClick={() => deleteStudent(s.id)}>
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Paiement */}
      <dialog id="modal_pay" className="modal backdrop-blur">
        <div className="modal-box border-2 border-dashed border-success/30">
          <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><Banknote className="w-5 h-5 text-success" /> Enregistrer un paiement</h3>
          {selectedStudent && (
            <p className="text-sm text-base-content/60 mb-4">
              {selectedStudent.name} — Reste : <strong>{formatMontant(selectedStudent.montant_total - selectedStudent.montant_paye)}</strong>
            </p>
          )}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="label label-text">Montant versé (FCFA) *</label>
              <input type="number" className="input input-bordered w-full" placeholder="Ex: 50000" value={payForm.montant} onChange={e => setPayForm({ ...payForm, montant: e.target.value === "" ? "" : Number(e.target.value) })} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label label-text">Mode de paiement</label>
              <select className="select select-bordered w-full" value={payForm.mode} onChange={e => setPayForm({ ...payForm, mode: e.target.value as PaymentMode })}>
                {Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="label label-text">Date du paiement</label>
              <input type="date" className="input input-bordered w-full" value={payForm.date} onChange={e => setPayForm({ ...payForm, date: e.target.value })} />
            </div>
            <button className="btn btn-success w-full mt-2" onClick={handlePay} disabled={loading}>
              <Banknote className="w-4 h-4" /> {loading ? "Enregistrement…" : "Confirmer le paiement"}
            </button>
          </div>
        </div>
      </dialog>

      {/* Modal Détail */}
      <dialog id="modal_detail" className="modal backdrop-blur">
        <div className="modal-box border-2 border-dashed border-info/20">
          <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
          {selectedStudent && (
            <>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Eye className="w-5 h-5 text-info" /> Détail du paiement</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between"><span className="text-base-content/60">Nom</span><span className="font-semibold">{selectedStudent.name}</span></div>
                <div className="flex justify-between"><span className="text-base-content/60">Matricule</span><span className="font-mono">{selectedStudent.matricule}</span></div>
                <div className="fléex justify-between"><span className="text-base-content/60">Filière / Niveau</span><span>{selectedStudent.filiere} — {selectedStudent.niveau}</span></div>
                <div className="divider my-0"></div>
                <div className="flex justify-between"><span className="text-base-content/60">Montant total</span><span className="font-semibold">{formatMontant(selectedStudent.montant_total)}</span></div>
                <div className="flex justify-between"><span className="text-base-content/60">Montant payé</span><span className="font-semibold text-success">{formatMontant(selectedStudent.montant_paye)}</span></div>
                <div className="flex justify-between"><span className="text-base-content/60">Reste à payer</span><span className="font-semibold text-error">{formatMontant(selectedStudent.montant_total - selectedStudent.montant_paye)}</span></div>
                <progress className="progress progress-success w-full" value={selectedStudent.montant_total > 0 ? (selectedStudent.montant_paye / selectedStudent.montant_total) * 100 : 0} max="100" />
                <div className="divider my-0"></div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Mode de paiement</span>
                  {selectedStudent.mode_paiement
                    ? <span className={`badge badge-soft ${PAYMENT_COLORS[selectedStudent.mode_paiement]}`}>{PAYMENT_LABELS[selectedStudent.mode_paiement]}</span>
                    : <span className="text-base-content/30">—</span>}
                </div>
                <div className="flex justify-between"><span className="text-base-content/60">Date paiement</span><span>{formatDate(selectedStudent.date_paiement)}</span></div>
                <div className="flex justify-between"><span className="text-base-content/60">Statut</span>{statutBadge(selectedStudent.statut)}</div>
              </div>
            </>
          )}
        </div>
      </dialog>

      {/* Modal Ajout étudiant */}
      <dialog id="modal_add" className="modal backdrop-blur">
        <div className="modal-box border-2 border-dashed border-warning/20">
          <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-warning" /> Ajouter un étudiant</h3>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1"><label className="label label-text">Nom complet *</label><input type="text" className="input input-bordered w-full" placeholder="Nom de l'étudiant" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="flex flex-col gap-1"><label className="label label-text">Matricule *</label><input type="text" className="input input-bordered w-full" placeholder="UCCB2024001" value={form.matricule} onChange={e => setForm({ ...form, matricule: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1"><label className="label label-text">Filière</label><input type="text" className="input input-bordered w-full" placeholder="Informatique" value={form.filiere} onChange={e => setForm({ ...form, filiere: e.target.value })} /></div>
              <div className="flex flex-col gap-1">
                <label className="label label-text">Niveau</label>
                <select className="select select-bordered w-full" value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}>
                  {["L1","L2","L3","M1","M2","D1","D2","D3"].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1"><label className="label label-text">Montant total dû *</label><input type="number" className="input input-bordered w-full" placeholder="300000" value={form.montant_total} onChange={e => setForm({ ...form, montant_total: e.target.value === "" ? "" : Number(e.target.value) })} /></div>
              <div className="flex flex-col gap-1"><label className="label label-text">Montant initial payé</label><input type="number" className="input input-bordered w-full" placeholder="0" value={form.montant_paye} onChange={e => setForm({ ...form, montant_paye: e.target.value === "" ? "" : Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="label label-text">Mode de paiement</label>
                <select className="select select-bordered w-full" value={form.mode_paiement} onChange={e => setForm({ ...form, mode_paiement: e.target.value as PaymentMode })}>
                  {Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1"><label className="label label-text">Date de paiement</label><input type="date" className="input input-bordered w-full" value={form.date_paiement} onChange={e => setForm({ ...form, date_paiement: e.target.value })} /></div>
            </div>
            <button className="btn btn-warning w-full mt-2" onClick={handleAddStudent} disabled={loading}>
              <PlusCircle className="w-4 h-4" /> {loading ? "Ajout…" : "Ajouter l'étudiant"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
