"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ReturnForm({ onSuccess }: any){
  const [matricula, setMatricula] = useState("")
  const [patrimonio, setPatrimonio] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!matricula || !patrimonio) {
      alert("Preencha todos os campos")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/emprestimos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentMatricula: matricula,
          patrimonio: patrimonio
        })
      })

      if (!res.ok) {
        throw new Error("Erro ao registrar empréstimo")
      }

      alert("Empréstimo registrado com sucesso!")

      setMatricula("")
      setPatrimonio("")

      onSuccess?.()

    } catch (error) {
      console.error(error)
      alert("Erro ao salvar empréstimo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Empréstimo</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        <div>
          <Label>Matrícula do Aluno</Label>
          <Input
            value={matricula}
            onChange={e => setMatricula(e.target.value)}
          />
        </div>

        <div>
          <Label>Patrimônio do Notebook</Label>
          <Input
            value={patrimonio}
            onChange={e => setPatrimonio(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrar Empréstimo"}
        </Button>

      </CardContent>
    </Card>
  )
}
