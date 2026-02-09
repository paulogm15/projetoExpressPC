"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Loan } from "@/lib/types"

export function LoanHistory() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchLoans = async () => {
    try {
      const res = await fetch("/api/emprestimos")
      const data = await res.json()

      const ordenados = data.sort(
        (a: Loan, b: Loan) =>
          new Date(b.loanDate).getTime() -
          new Date(a.loanDate).getTime()
      )

      setLoans(ordenados)

    } catch (error) {
      console.error("Erro ao buscar empréstimos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  const filtered = loans.filter(l =>
    l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.studentMatricula.includes(searchTerm) ||
    l.patrimonio.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <p>Carregando empréstimos...</p>
  }

  if (filtered.length === 0) {
    return <p>Nenhum empréstimo encontrado.</p>
  }

  return (
    <div className="space-y-4">

      <Input
        placeholder="Buscar aluno, matrícula ou patrimônio"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filtered.map((loan) => (
        <Card key={loan.id}>
          <CardContent className="p-4 space-y-1">
            <p><strong>Aluno:</strong> {loan.studentName}</p>
            <p><strong>Matrícula:</strong> {loan.studentMatricula}</p>
            <p><strong>Notebook:</strong> {loan.patrimonio}</p>
            <p><strong>Status:</strong> {loan.status}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(loan.loanDate).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
