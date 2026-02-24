import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// PUT — editar nome, email, cargo
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const { name, email, role } = await request.json()

    const target = await prisma.user.findUnique({ where: { id: params.id } })
    if (!target) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { name, email, role },
    })

    await prisma.log.create({
      data: {
        userId: session.user.id,
        action: `Editou usuário "${target.name}"`,
      },
    })

    return NextResponse.json({ message: "Usuário atualizado", user: updated })
  } catch (error) {
    console.error("Erro ao editar usuário:", error)
    return NextResponse.json({ error: "Erro ao editar usuário" }, { status: 500 })
  }
}

// PATCH — toggle status ATIVO/INATIVO
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Você não pode alterar seu próprio status" }, { status: 400 })
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: params.id } })
    if (!target) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    const newStatus = target.status === "ATIVO" ? "INATIVO" : "ATIVO"

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { status: newStatus },
    })

    await prisma.log.create({
      data: {
        userId: session.user.id,
        action: `${newStatus === "ATIVO" ? "Ativou" : "Desativou"} usuário "${target.name}"`,
        ip: request.headers.get("x-forwarded-for") || undefined,
      },
    })

    return NextResponse.json({ message: `Usuário ${newStatus === "ATIVO" ? "ativado" : "desativado"}`, status: newStatus })
  } catch (error) {
    console.error("Erro ao alterar status:", error)
    return NextResponse.json({ error: "Erro ao alterar status" }, { status: 500 })
  }
}

// DELETE — excluir usuário
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta" }, { status: 400 })
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: params.id } })
    if (!target) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    await prisma.user.delete({ where: { id: params.id } })

    // Registra o log com o admin que fez a ação (não o deletado)
    await prisma.log.create({
      data: {
        userId: session.user.id,
        action: `Excluiu usuário "${target.name}"`,
        ip: request.headers.get("x-forwarded-for") || undefined,
      },
    })

    return NextResponse.json({ message: `Usuário "${target.name}" excluído com sucesso` })
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 })
  }
}