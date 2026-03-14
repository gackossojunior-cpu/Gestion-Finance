"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import toast from "react-hot-toast"
import api from "./api"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Transaction = {
  id: string
  text: string
  amount: number
  created_at: string
}

export type PaymentMode = "cash" | "mobile_money" | "virement" | "cheque"

export type Student = {
  id: string
  name: string
  matricule: string
  filiere: string
  niveau: string
  montant_total: number
  montant_paye: number
  mode_paiement: PaymentMode | null
  statut: "paye" | "partiel" | "non_paye"
  date_paiement: string | null
  created_at: string
}

// ─── Context ──────────────────────────────────────────────────────────────────

type FinanceContextType = {
  transactions: Transaction[]
  students: Student[]
  loadingTx: boolean
  loadingSt: boolean
  getTransactions: () => Promise<void>
  getStudents: () => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
  addTransaction: (text: string, amount: number) => Promise<void>
  addStudent: (payload: Omit<Student, "id" | "created_at" | "statut">) => Promise<void>
  /**
   * Enregistre le paiement d'un étudiant :
   *  1. Met à jour l'étudiant (montant_paye, statut, mode_paiement)
   *  2. Crée automatiquement une transaction de revenu
   */
  payStudent: (
    studentId: string,
    montantVerse: number,
    mode: PaymentMode,
    date: string
  ) => Promise<void>
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error("useFinance doit être utilisé dans <FinanceProvider>")
  return ctx
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "t1", text: "Frais de dossier - Mboungou Serge", amount: 350000, created_at: "2024-10-01T10:00:00Z" },
  { id: "t2", text: "Paiement partiel - Nzila Précieuse", amount: 150000, created_at: "2024-10-05T09:00:00Z" },
  { id: "t3", text: "Achat fournitures bureau", amount: -45000, created_at: "2024-10-06T14:00:00Z" },
]

const DEMO_STUDENTS: Student[] = [
  { id: "s1", name: "Mboungou Serge", matricule: "UCCB2024001", filiere: "Informatique", niveau: "L1", montant_total: 350000, montant_paye: 350000, mode_paiement: "mobile_money", statut: "paye", date_paiement: "2024-10-01", created_at: "2024-10-01" },
  { id: "s2", name: "Nzila Précieuse", matricule: "UCCB2024002", filiere: "Gestion", niveau: "L2", montant_total: 300000, montant_paye: 150000, mode_paiement: "cash", statut: "partiel", date_paiement: "2024-10-05", created_at: "2024-10-05" },
  { id: "s3", name: "Moukengué Armand", matricule: "UCCB2024003", filiere: "Droit", niveau: "L3", montant_total: 280000, montant_paye: 0, mode_paiement: null, statut: "non_paye", date_paiement: null, created_at: "2024-09-28" },
  { id: "s4", name: "Kaya Larissa", matricule: "UCCB2024004", filiere: "Informatique", niveau: "M1", montant_total: 420000, montant_paye: 420000, mode_paiement: "virement", statut: "paye", date_paiement: "2024-09-30", created_at: "2024-09-30" },
]

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loadingTx, setLoadingTx] = useState(false)
  const [loadingSt, setLoadingSt] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  // ── Transactions ──────────────────────────────────────────────────────────

  const getTransactions = async () => {
    setLoadingTx(true)
    try {
      const res = await api.get<Transaction[]>("transactions/")
      setTransactions(res.data)
    } catch {
      if (!demoMode) {
        setTransactions(DEMO_TRANSACTIONS)
        setDemoMode(true)
        toast("Mode démo activé", { icon: "ℹ️" })
      }
    } finally {
      setLoadingTx(false)
    }
  }

  const addTransaction = async (text: string, amount: number) => {
    try {
      const res = await api.post<Transaction>("transactions/", { text, amount })
      setTransactions(prev => [...prev, res.data])
    } catch {
      // mode local
      const tx: Transaction = {
        id: `local-${Date.now()}`,
        text,
        amount,
        created_at: new Date().toISOString(),
      }
      setTransactions(prev => [...prev, tx])
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      await api.delete(`transactions/${id}/`)
    } catch { /* local */ }
    setTransactions(prev => prev.filter(t => t.id !== id))
    toast.success("Transaction supprimée")
  }

  // ── Students ──────────────────────────────────────────────────────────────

  const getStudents = async () => {
    setLoadingSt(true)
    try {
      const res = await api.get<Student[]>("students/")
      setStudents(res.data)
    } catch {
      if (!demoMode) setStudents(DEMO_STUDENTS)
    } finally {
      setLoadingSt(false)
    }
  }

  const addStudent = async (payload: Omit<Student, "id" | "created_at" | "statut">) => {
    const statut: Student["statut"] =
      payload.montant_paye >= payload.montant_total ? "paye" :
      payload.montant_paye > 0 ? "partiel" : "non_paye"

    const full = { ...payload, statut }

    try {
      const res = await api.post<Student>("students/", full)
      setStudents(prev => [...prev, res.data])
    } catch {
      setStudents(prev => [...prev, { ...full, id: `local-${Date.now()}`, created_at: new Date().toISOString() }])
    }

    // Si un paiement initial est renseigné, créer la transaction correspondante
    if (payload.montant_paye > 0) {
      await addTransaction(
        `Inscription – ${payload.name} (${payload.matricule})`,
        payload.montant_paye
      )
    }
  }

  const deleteStudent = async (id: string) => {
    try {
      await api.delete(`students/${id}/`)
    } catch { /* local */ }
    setStudents(prev => prev.filter(s => s.id !== id))
    toast.success("Étudiant supprimé")
  }

  // ── Paiement étudiant → Transaction automatique ───────────────────────────

  const payStudent = async (
    studentId: string,
    montantVerse: number,
    mode: PaymentMode,
    date: string
  ) => {
    const student = students.find(s => s.id === studentId)
    if (!student) return

    const nouveauMontantPaye = student.montant_paye + montantVerse
    const statut: Student["statut"] =
      nouveauMontantPaye >= student.montant_total ? "paye" :
      nouveauMontantPaye > 0 ? "partiel" : "non_paye"

    const updatedStudent: Student = {
      ...student,
      montant_paye: nouveauMontantPaye,
      mode_paiement: mode,
      date_paiement: date,
      statut,
    }

    // 1. Mettre à jour l'étudiant côté API
    try {
      await api.patch(`students/${studentId}/`, {
        montant_paye: nouveauMontantPaye,
        mode_paiement: mode,
        date_paiement: date,
        statut,
      })
    } catch { /* local */ }

    setStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s))

    // 2. Créer la transaction financière automatiquement
    const modeLabel: Record<PaymentMode, string> = {
      cash: "Espèces",
      mobile_money: "Mobile Money",
      virement: "Virement",
      cheque: "Chèque",
    }
    const txText = `Paiement ${modeLabel[mode]} – ${student.name} (${student.matricule})`
    await addTransaction(txText, montantVerse)

    toast.success(`Paiement enregistré ! Transaction créée automatiquement.`)
  }

  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    getTransactions()
    getStudents()
  }, [])

  return (
    <FinanceContext.Provider value={{
      transactions, students, loadingTx, loadingSt,
      getTransactions, getStudents,
      deleteTransaction, deleteStudent,
      addTransaction, addStudent, payStudent,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}
