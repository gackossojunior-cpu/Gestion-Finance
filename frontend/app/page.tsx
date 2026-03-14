"use client"
import toast from "react-hot-toast"
import { useState } from "react"
import { Wallet, ArrowUp, ArrowDown, Activity, TrendingUp, TrendingDown, Trash, PlusCircle } from "lucide-react"
import { useFinance } from "./FinanceContext"

export default function Home() {
  const { transactions, loadingTx, deleteTransaction, addTransaction } = useFinance()
  const [text, setText] = useState("")
  const [amount, setAmount] = useState<number | "">("")
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!text || amount === "" || isNaN(Number(amount))) {
      toast.error("Merci de remplir texte et montant valides")
      return
    }
    setLoading(true)
    try {
      await addTransaction(text, Number(amount))
      toast.success("Transaction ajoutée avec succès")
      setText("")
      setAmount("")
      const modal = document.getElementById("my_modal_3") as HTMLDialogElement
      modal?.close()
    } finally {
      setLoading(false)
    }
  }

  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = income + expense

  const ratio = income > 0 ? Math.min((Math.abs(expense) / income) * 100, 100) : 0

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return "Date invalide"
    return d.toLocaleDateString("fr-FR", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Cartes solde / revenus / dépenses */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow-md p-5 flex flex-col gap-2">
          <div className="badge badge-outline gap-1">
            <Wallet className="w-3 h-3" /> Solde
          </div>
          <div className="text-3xl font-bold">{balance.toFixed(2)}</div>
          <div className="text-sm text-base-content/50">FCFA</div>
        </div>

        <div className="card bg-success/10 shadow-md p-5 flex flex-col gap-2 border border-success/30">
          <div className="badge badge-success gap-1">
            <ArrowUp className="w-3 h-3" /> Revenus
          </div>
          <div className="text-3xl font-bold text-success">{income.toFixed(2)}</div>
          <div className="text-sm text-base-content/50">FCFA</div>
        </div>

        <div className="card bg-error/10 shadow-md p-5 flex flex-col gap-2 border border-error/30">
          <div className="badge badge-error gap-1">
            <ArrowDown className="w-3 h-3" /> Dépenses
          </div>
          <div className="text-3xl font-bold text-error">{Math.abs(expense).toFixed(2)}</div>
          <div className="text-sm text-base-content/50">FCFA</div>
        </div>
      </div>

      {/* Barre ratio */}
      <div className="card bg-base-100 shadow-md p-5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="badge badge-warning gap-1">
            <Activity className="w-3 h-3" /> Dépenses vs Revenus
          </div>
          <span className="font-bold text-warning">{ratio.toFixed(0)}%</span>
        </div>
        <progress className="progress progress-warning w-full h-3" value={ratio} max="100"></progress>
        <div className="flex justify-between text-xs text-base-content/40">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Bouton ajouter */}
      <button
        className="btn btn-warning w-full"
        onClick={() => (document.getElementById("my_modal_3") as HTMLDialogElement)?.showModal()}
      >
        <PlusCircle className="w-4 h-4" /> Ajouter une transaction
      </button>

      {/* Table */}
      <div className="card bg-base-100 shadow-md overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Montant</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loadingTx ? (
              <tr><td colSpan={5} className="text-center py-8"><span className="loading loading-spinner loading-md"></span></td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-base-content/40">Aucune transaction pour le moment</td></tr>
            ) : transactions.map((t, index) => (
              <tr key={t.id}>
                <th className="text-base-content/40">{index + 1}</th>
                <td>{t.text}</td>
                <td>
                  <div className="flex items-center gap-2 font-semibold">
                    {t.amount > 0
                      ? <TrendingUp className="text-success w-5 h-5" />
                      : <TrendingDown className="text-error w-5 h-5" />}
                    <span className={t.amount > 0 ? "text-success" : "text-error"}>
                      {t.amount > 0 ? `+${t.amount}` : `-${Math.abs(t.amount)}`} FCFA
                    </span>
                  </div>
                </td>
                <td className="text-sm text-base-content/60">{formatDate(t.created_at)}</td>
                <td>
                  <button onClick={() => deleteTransaction(t.id)} className="btn btn-sm btn-error btn-ghost">
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <dialog id="my_modal_3" className="modal backdrop-blur">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-4">Ajouter une transaction</h3>
          <div className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Description</span></label>
              <input type="text" value={text} onChange={e => setText(e.target.value)}
                placeholder="Ex: Salaire, Loyer..." className="input input-bordered w-full" />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Montant</span>
                <span className="label-text-alt text-base-content/40">négatif = dépense</span>
              </label>
              <input type="number" value={amount}
                onChange={e => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ex: 50000 ou -15000" className="input input-bordered w-full" />
            </div>
            <button className="btn btn-warning w-full" onClick={handleAdd} disabled={loading}>
              <PlusCircle className="w-4 h-4" />
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "Ajouter"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
