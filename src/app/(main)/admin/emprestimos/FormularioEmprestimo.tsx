"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FormularioEmprestimo({ onSuccess }: any) {
  const [matricula, setMatricula] = useState("")
  const [patrimonio, setPatrimonio] = useState("")
  const [reservaId, setReservaId] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)

    const res = await fetch("/api/emprestimos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matricula,
        patrimonio,
        reservaId: Number(reservaId)
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
      setLoading(false)
      return
    }

    alert("Empréstimo criado")

    setMatricula("")
    setPatrimonio("")
    setReservaId("")

    onSuccess?.()
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Empréstimo</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        <div>
          <Label>Matrícula</Label>
          <Input value={matricula} onChange={e => setMatricula(e.target.value)} />
        </div>

        <div>
          <Label>Patrimônio</Label>
          <Input value={patrimonio} onChange={e => setPatrimonio(e.target.value)} />
        </div>

        <div>
          <Label>Reserva ID</Label>
          <Input value={reservaId} onChange={e => setReservaId(e.target.value)} />
        </div>

        <Button onClick={submit} disabled={loading}>
          Registrar
        </Button>

      </CardContent>
    </Card>
  )
}
