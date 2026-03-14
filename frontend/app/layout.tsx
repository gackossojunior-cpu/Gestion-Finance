import "./globals.css"
import { FinanceProvider } from "./FinanceContext"
import { Toaster } from "react-hot-toast"
import Link from "next/link"
import { Wallet, GraduationCap } from "lucide-react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="light">
      <body className="min-h-screen bg-base-200">
        <FinanceProvider>
          <Toaster position="top-right" />

          {/* Navbar */}
          <div className="navbar bg-base-100 shadow-lg px-6 sticky top-0 z-50">
            <div className="flex-1">
              <span className="text-xl font-bold text-warning"> UCCB Finance </span>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="btn btn-ghost gap-2">
                <Wallet className="w-4 h-4" />
                Transactions
              </Link>
              <Link href="/etudiants" className="btn btn-warning gap-2">
                <GraduationCap className="w-4 h-4" />
                Étudiants
              </Link>
            </div>
          </div>

          {/* Contenu */}
          <div className="max-w-5xl mx-auto px-6 py-8">
            {children}
          </div>
        </FinanceProvider>
      </body>
    </html>
  )
}
