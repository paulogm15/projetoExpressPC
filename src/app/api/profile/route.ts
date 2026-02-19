import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return Response.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const { name, email, password } = await req.json()

    // Atualiza nome e email
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email
      }
    })

    // Atualiza senha somente se enviada
    if (password && password.trim() !== "") {

      const account = await prisma.account.findFirst({
        where: {
          userId: session.user.id,
          providerId: "credentials"
        }
      })

      if (!account) {
        return Response.json(
          { message: "Usuário não possui login por senha." },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      await prisma.account.update({
        where: { id: account.id },
        data: {
          password: hashedPassword
        }
      })
    }

    return Response.json({
      message: "Perfil atualizado com sucesso"
    })

  } catch (error) {
    console.error(error)

    return Response.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
