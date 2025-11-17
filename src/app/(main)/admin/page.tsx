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

// Import do formulário de turmas
import AdminFormTurma from "./turmas/admin-form-turma";

// Placeholder para futuras telas
const AdminMaterias = () => (
  <Card>
    <CardContent className="p-6">
      <p className="text-muted-foreground">
        Gerenciamento de matérias ainda não foi implementado.
      </p>
    </CardContent>
  </Card>
);

type AdminView =
  | "dashboard"
  | "notebooks"
  | "emprestimos"
  | "alunos"
  | "turmas"
  | "materias";

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");

  const navigationButtons = [
    {
      id: "notebooks" as AdminView,
      label: "Notebooks",
      icon: Laptop,
      description: "Gerenciar equipamentos",
    },
    {
      id: "emprestimos" as AdminView,
      label: "Empréstimos",
      icon: UserCheck,
      description: "Controle de empréstimos",
    },
    {
      id: "alunos" as AdminView,
      label: "Alunos",
      icon: Users,
      description: "Gerenciar estudantes",
    },
    {
      id: "turmas" as AdminView,
      label: "Turmas",
      icon: GraduationCap,
      description: "Administrar turmas",
    },
    {
      id: "materias" as AdminView,
      label: "Matérias",
      icon: BookOpen,
      description: "Gerenciar disciplinas",
    },
  ];

  // =============================
  // Renderização dinâmica
  // =============================
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

      case "materias":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Matérias</h2>
              <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
                Voltar ao Dashboard
              </Button>
            </div>

            <AdminMaterias />
          </div>
        );

      case "notebooks":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Notebooks</h2>
              <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
                Voltar ao Dashboard
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Funcionalidade de gerenciamento de notebooks em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "emprestimos":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Empréstimos</h2>
              <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
                Voltar ao Dashboard
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Funcionalidade de empréstimos em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "alunos":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Alunos</h2>
              <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
                Voltar ao Dashboard
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Funcionalidade de alunos em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Dashboard Administrativo</h2>
            <p className="text-muted-foreground mt-2">
              Selecione uma das opções abaixo para gerenciar o sistema
            </p>
          </div>
        );
    }
  };

  // =============================
  // Layout principal
  // =============================
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Painel Administrativo</h1>
            </div>

            <Button
              variant={currentView === "dashboard" ? "default" : "outline"}
              onClick={() => setCurrentView("dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-8">
        {/* Cards somente no dashboard */}
        {currentView === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {navigationButtons.map((btn) => (
              <Card
                key={btn.id}
                className="cursor-pointer transition-all hover:bg-accent hover:shadow-md"
                onClick={() => setCurrentView(btn.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <btn.icon className="h-6 w-6 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold">{btn.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {btn.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ÁREA DINÂMICA */}
        {renderContent()}
      </main>
    </div>
  );
}
