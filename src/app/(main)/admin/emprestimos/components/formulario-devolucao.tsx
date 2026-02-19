"use client"

import { useState } from "react"

export function FormularioDevolucao({ onReturnCreated }: any) {

  const [matricula, setMatricula] = useState("")

  async function devolver() {
    await fetch("/api/devolucao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula })
    })

    onReturnCreated?.()
    setMatricula("")
  }

  return (
    <div className="space-y-4">

      <input
        placeholder="Matrícula do aluno"
        value={matricula}
        onChange={(e) => setMatricula(e.target.value)}
        className="border p-2 w-full"
      />

      <button onClick={devolver} className="bg-green-600 text-white p-2 rounded">
        Registrar Devolução
      </button>

    </div>
  )
}
