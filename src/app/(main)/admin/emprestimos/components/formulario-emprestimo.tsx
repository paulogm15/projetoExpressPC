"use client"

import { useState } from "react"

export function FormularioEmprestimo({ onLoanCreated }: any) {

  const [matricula, setMatricula] = useState("")
  const [patrimonio, setPatrimonio] = useState("")

  async function registrar() {
    await fetch("/api/emprestimos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matricula,
        patrimonio
      })
    })

    onLoanCreated?.()
    setMatricula("")
    setPatrimonio("")
  }

  return (
    <div className="space-y-4">

      <input
        placeholder="Matrícula"
        value={matricula}
        onChange={(e) => setMatricula(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        placeholder="Patrimônio Notebook"
        value={patrimonio}
        onChange={(e) => setPatrimonio(e.target.value)}
        className="border p-2 w-full"
      />

      <button onClick={registrar} className="bg-blue-600 text-white p-2 rounded">
        Registrar Empréstimo
      </button>

    </div>
  )
}
