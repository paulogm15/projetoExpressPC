import { getServerSession } from "@/lib/get-session";
import { redirect, unauthorized } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel do Professor",
};

export default async function ProfessorPage() {
  // 1. Busca a sessão no servidor
  const session = await getServerSession();
  const user = session?.user;

  // 2. Protege a rota
  if (!user) {
    // Se não há usuário, manda para o login
    redirect("/sign-in");
  }

  // 3. Garante que é um professor
  // (Lembre-se de verificar se a role é "PROFESSOR" ou "professor")
  if (user.role !== "PROFESSOR") {
    // Se for outra role (como ADMIN), não autoriza
  	 unauthorized();
  }

  // 4. Se tudo estiver certo, renderiza a página
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Painel do Professor</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user.name}!
          </p>
        </div>
        
        {/* Adicione aqui seus componentes de professor */}
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold">Minhas Reservas</h2>
          <p className="mt-2 text-muted-foreground">
            Aqui você poderá ver e gerenciar suas reservas de notebooks.
          </p>
          {/* Você pode adicionar um link para o professor-form.tsx aqui */}
        </div>

      </div>
    </main>
  );
}