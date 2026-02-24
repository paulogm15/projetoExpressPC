import  prisma  from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const lista = await prisma.emprestimo.findMany({
    include: {
      aluno: true,
      notebook: true,
      reserva: true
    },
    orderBy: {
      dataRetirada: "desc"
    }
  })

  return NextResponse.json(lista)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { matricula, patrimonio, reservaId } = body

    const aluno = await prisma.aluno.findUnique({
      where: { matricula }
    })

    if (!aluno)
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })

    const notebook = await prisma.notebook.findUnique({
      where: { patrimonio }
    })

    if (!notebook)
      return NextResponse.json({ error: "Notebook não encontrado" }, { status: 404 })

    if (notebook.status !== "DISPONIVEL")
      return NextResponse.json({ error: "Notebook em uso" }, { status: 400 })

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId }
    })

    if (!reserva)
      return NextResponse.json({ error: "Reserva inválida" }, { status: 404 })

    const emprestimo = await prisma.emprestimo.create({
      data: {
        alunoId: aluno.id,
        notebookId: notebook.id,
        reservaId: reserva.id,
        status: "ATIVO"
      }
    })

    await prisma.notebook.update({
      where: { id: notebook.id },
      data: { status: "EM_USO" }
    })

    return NextResponse.json(emprestimo)

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
