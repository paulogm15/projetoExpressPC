import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import AdminMaterias from "./admin-materias";

export default async function MateriasPage() {
  const h = await headers();

  const session = await auth.api.getSession({
    headers: h,
  });

  if (!session) {
    return <p>Usuário não autenticado</p>;
  }

  if (session.user.role !== "ADMIN") {
    return <p>Acesso restrito</p>;
  }

  return <AdminMaterias />;
}
