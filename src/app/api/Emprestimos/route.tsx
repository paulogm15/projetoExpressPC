import prisma  from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const nb = await prisma.notebook.findUnique({
      where: { id: body.notebookId }
    })

    if (!nb || nb.status !== "DISPONIVEL") {
      return NextResponse.json(
        { erro: "Notebook indisponível" },
        { status: 400 }
      )
    }

    const ativo = await prisma.emprestimo.findFirst({
      where: {
        alunoId: body.alunoId,
        status: "ATIVO"
      }
    })

    if (ativo) {
      return NextResponse.json(
        { erro: "Aluno já tem empréstimo ativo" },
        { status: 400 }
      )
    }


    const emprestimo = await prisma.emprestimo.create({
      data: {
        alunoId: body.alunoId,
        notebookId: body.notebookId,
        reservaId: body.reservaId
      },
      include: {
        aluno: true,
        notebook: true,
        reserva: true
      }
    })

   

    await prisma.notebook.update({
      where: { id: body.notebookId },
      data: { status: "EM_USO" }
    })

    return NextResponse.json(emprestimo)

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { erro: "Erro ao criar empréstimo" },
      { status: 500 }
    )
  }
}
