"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { FormularioEmprestimo } from "./FormularioEmprestimo"
import { ReturnForm } from "./return-form"
import { LoanHistory } from "./loan-history"

import {
  Laptop,
  ArrowRightLeft,
  RotateCcw,
  History,
  CheckCircle2,
  AlertCircle,
  Wrench
} from "lucide-react"

export default function AdminEmprestimo() {
  const [activeTab, setActiveTab] = useState("emprestimo")

  const [stats, setStats] = useState({
    total: 0,
    disponivel: 0,
    emprestado: 0,
    manutencao: 0,
    activeLoans: 0
  })

  const loadStats = async () => {
    try {
      const [nbRes, empRes] = await Promise.all([
        fetch("/api/notebooks"),
        fetch("/api/emprestimos")
      ])

      const notebooks = await nbRes.json()
      const emprestimos = await empRes.json()

      setStats({
        total: notebooks.length,
        disponivel: notebooks.filter((n:any) => n.status === "DISPONIVEL").length,
        emprestado: notebooks.filter((n:any) => n.status === "EM_USO").length,
        manutencao: notebooks.filter((n:any) => n.status === "MANUTENCAO").length,
        activeLoans: emprestimos.filter((e:any) => e.status === "ATIVO").length
      })

    } catch (e) {
      console.error("Erro ao carregar stats", e)
    }
  }

  useEffect(() => {
    loadStats()
  }, [activeTab])

  return (
    <div className="min-h-screen bg-background">

      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary">
                <Laptop className="w-6 h-6 text-primary-foreground" />
              </div>

              <div>
                <h1 className="text-xl font-bold">Sistema de Empréstimo</h1>
                <p className="text-sm text-muted-foreground">
                  Gerenciamento de Notebooks
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
                <span className="text-sm">
                  {stats.disponivel} disponíveis
                </span>
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[hsl(var(--warning))]" />
                <span className="text-sm">
                  {stats.emprestado} emprestados
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {stats.manutencao} manutenção
                </span>
              </div>

            </div>

          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">

        {/* cards mobile */}
        <div className="grid gap-4 md:grid-cols-4 mb-6 md:hidden">

          <Card>
            <CardContent className="pt-4 pb-3 px-4 flex justify-between">
              <span>Total</span>
              <Badge>{stats.total}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3 px-4 flex justify-between">
              <span>Disponíveis</span>
              <Badge>{stats.disponivel}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3 px-4 flex justify-between">
              <span>Emprestados</span>
              <Badge>{stats.emprestado}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3 px-4 flex justify-between">
              <span>Manutenção</span>
              <Badge>{stats.manutencao}</Badge>
            </CardContent>
          </Card>

        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >

          <TabsList className="grid w-full max-w-2xl grid-cols-3 mx-auto">

            <TabsTrigger value="emprestimo">
              <ArrowRightLeft className="w-4 h-4" /> Empréstimo
            </TabsTrigger>

            <TabsTrigger value="devolucao">
              <RotateCcw className="w-4 h-4" /> Devolução
            </TabsTrigger>

            <TabsTrigger value="historico">
              <History className="w-4 h-4" /> Histórico
            </TabsTrigger>

          </TabsList>

          <TabsContent value="emprestimo">
            <FormularioEmprestimo onSuccess={loadStats} />
          </TabsContent>

          <TabsContent value="devolucao">
            <ReturnForm onSuccess={loadStats} />
          </TabsContent>

          <TabsContent value="historico">
            <LoanHistory />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}
