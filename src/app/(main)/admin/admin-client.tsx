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
  ChevronRight,
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
          <div className="space-y-8">
            {/* Welcome banner */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 px-8 py-7 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Bem-vindo ao Painel</h2>
                <p className="text-muted-foreground mt-1">
                  Selecione uma opção abaixo para gerenciar o sistema
                </p>
              </div>
              <LayoutDashboard className="h-12 w-12 text-primary/20 hidden sm:block" />
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                icon={Users}
                label="Alunos"
                description="Gerencie os alunos cadastrados"
                onClick={() => setCurrentView("alunos")}
              />
              <DashboardCard
                icon={GraduationCap}
                label="Turmas"
                description="Organize e edite as turmas"
                onClick={() => setCurrentView("turmas")}
              />
              <DashboardCard
                icon={BookOpen}
                label="Matérias"
                description="Controle as matérias do sistema"
                onClick={() => setCurrentView("materias")}
              />
              <DashboardCard
                icon={UserCheck}
                label="Empréstimos"
                description="Acompanhe os empréstimos ativos"
                onClick={() => setCurrentView("emprestimos")}
              />
              <DashboardCard
                icon={Laptop}
                label="Notebooks"
                description="Gerencie o inventário de notebooks"
                onClick={() => setCurrentView("notebooks")}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Painel Administrativo</h1>
          </div>

          {currentView !== "dashboard" && (
            <Button variant="outline" size="sm" onClick={() => setCurrentView("dashboard")}>
              ← Voltar
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

function DashboardCard({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: any;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/15 transition-colors">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </CardContent>
    </Card>
  );
}