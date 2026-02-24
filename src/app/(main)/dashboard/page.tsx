import { getServerSession } from "@/lib/get-session";
// IMPORTANTE: Adicione "redirect"
import { redirect, unauthorized } from "next/navigation";
import type { Metadata } from "next";

// Como esta página só redireciona, o título não é tão importante
export const metadata: Metadata = {
  title: "Carregando seu painel...",
};

export default async function DashboardPage() {
  const session = await getServerSession();
  const user = session?.user;

  // 1. Garante que há um usuário logado
  if (!user) {
    // Se não há, manda para o login
  	 redirect("/sign-in");
  }

  // 2. Se o usuário existe, verifica a role
  // (Lembre-se de checar se é "PROFESSOR" ou "professor" no seu banco)
  if (user.role === "ADMIN") {
  	 redirect("/admin");
  }

  if (user.role === "PROFESSOR") {
  	 redirect("/professor");
  }

  // 3. Se o usuário está logado mas não tem role (erro),
  //    chama a página "unauthorized".
  unauthorized();

  // Esta página NUNCA retorna JSX.
  // Ela *sempre* redireciona.
}