"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Laptop,
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";

import AlunosView from "./alunos/alunos-view";
import AdminFormTurma from "./turmas/admin-form-turma";
import AdminMaterias from "./materias/admin-materias";
import AdminNotebooks from "./notebooks/admin-notebooks";
import EmprestimoForm from "./emprestimos/emprestimos-view";

type AdminView =
  | "dashboard"
  | "notebooks"
  | "emprestimos"
  | "alunos"
  | "turmas"
  | "materias";

export function AdminClient() {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");

    const renderContent = () => {
      switch (currentView) {
        case "alunos":
          return <AlunosView onBack={() => setCurrentView("dashboard")} />;

        case "turmas":
          return <AdminFormTurma />;

        case "materias":
          return <AdminMaterias />; 

        case "emprestimos":
          return <EmprestimoForm />;

        case "notebooks":
          return <AdminNotebooks />;

        default:
          return (
            <div className="text-center">
              <h2 className="text-2xl font-bold">Pagina Administrativa</h2>
              <p className="text-muted-foreground mt-2">
                Selecione uma opção para gerenciar o sistema
              </p>
            </div>
          );
      }
    };
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Painel Administrativo</h1>
          </div>

          {currentView !== "dashboard" && (
            <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
              Voltar
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
            {currentView === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <DashboardCard
                  icon={Users}
                  label="Alunos"
                  onClick={() => setCurrentView("alunos")}
                />

                <DashboardCard
                  icon={GraduationCap}
                  label="Turmas"
                  onClick={() => setCurrentView("turmas")}
                />

                <DashboardCard
                  icon={BookOpen}
                  label="Matérias"
                  onClick={() => setCurrentView("materias")}
                />

                <DashboardCard
                  icon={UserCheck}
                  label="Empréstimos"
                  onClick={() => setCurrentView("emprestimos")}
                />

                <DashboardCard
                  icon={Laptop}
                  label="Notebooks"
                  onClick={() => setCurrentView("notebooks")}
                />
              </div>
            )}
        {renderContent()}
      </main>
    </div>
  );
}

function DashboardCard({ icon: Icon, label, onClick }: any) {
  return (
    <Card
      className="cursor-pointer hover:bg-accent"
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center space-x-4">
        <Icon className="h-6 w-6" />
        <span className="font-semibold">{label}</span>
      </CardContent>
    </Card>
  );
}
