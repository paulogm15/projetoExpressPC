import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();
  const user = session?.user;
if (user) {
  if (user.role === "ADMIN") {
     redirect("/dashboard");
  }

  if (user.role === "PROFESSOR") {
   // Você informou que a rota é /professor
     redirect("/professor");
  }
      // Fallback de segurança: se o usuário está logado
      // mas (por algum erro) não tem role, o dashboard/page.tsx
      // já trata isso (com unauthorized()), então podemos
      // apenas mandar para lá.
      // Mas, como já sabemos que só há 2 roles, podemos
      // chamar unauthorized() aqui também.
      redirect("/dashboard");
  }
  // ▲▲▲ FIM DO BLOCO ▲▲▲

  // Se o 'user' for undefined (não logado),
  // o 'if' é pulado e o 'children' (página de login) é retornado
  return children;
}