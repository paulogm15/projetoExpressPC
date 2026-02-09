import prisma  from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)

  const emp = await prisma.emprestimo.findUnique({
    where: { id }
  })

  if (!emp)
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  const atualizado = await prisma.emprestimo.update({
    where: { id },
    data: {
      status: "DEVOLVIDO",
      dataDevolucao: new Date()
    }
  })

  await prisma.notebook.update({
    where: { id: emp.notebookId },
    data: { status: "DISPONIVEL" }
  })

  return NextResponse.json(atualizado)
}
