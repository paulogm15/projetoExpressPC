"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminFormTurma from "./turmas/admin-form-turma";
import {
  Laptop,
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";

export function AdminClient() {
  const [currentView, setCurrentView] = useState("dashboard");

  const navigationButtons = [
    {
      id: "notebooks",
      label: "Notebooks",
      icon: Laptop,
      description: "Gerenciar equipamentos",
    },
    {
      id: "emprestimos",
      label: "Empréstimos",
      icon: UserCheck,
      description: "Controle de empréstimos",
    },
    {
      id: "alunos",
      label: "Alunos",
      icon: Users,
      description: "Gerenciar estudantes",
    },
    {
      id: "turmas",
      label: "Turmas",
      icon: GraduationCap,
      description: "Administrar turmas",
    },
    {
      id: "materias",
      label: "Matérias",
      icon: BookOpen,
      description: "Gerenciar disciplinas",
    },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "turmas":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Turmas</h2>
              <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
                Voltar ao Dashboard
              </Button>
            </div>
            <AdminFormTurma />
          </div>
        );
      default:
        return <p>Dashboard</p>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Painel Administrativo</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{renderContent()}</main>
    </div>
  );
}
