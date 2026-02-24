import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import AdminUserPanel from "./AdminUserPanel"
import ProfileForm from "./ProfileForm"

export default async function profilePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) return <div>Usuário não autenticado</div>

  const isAdmin = session.user.role === "ADMIN"

  if (isAdmin) {
    return (
      <AdminUserPanel
        currentUser={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }}
      />
    )
  }

  return <ProfileForm user={{ name: session.user.name, email: session.user.email }} />
}