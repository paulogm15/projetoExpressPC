import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import ProfileForm from "./ProfileForm"

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return <div>Usuário não autenticado</div>
  }

  return (
    <ProfileForm
      user={{
        name: session.user.name,
        email: session.user.email
      }}
    />
  )
}
