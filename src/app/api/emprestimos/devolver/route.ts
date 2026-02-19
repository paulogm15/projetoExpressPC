import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

/* =========================
   DEVOLVER NOTEBOOK
========================= */
export async function POST(req: Request) {
  try {
    const { alunoId } = await req.json()

    if (!alunoId) {
      return NextResponse.json(
        { error: "alunoId é obrigatório" },
        { status: 400 }
      )
    }

    const emprestimo = await prisma.emprestimo.findFirst({
      where: {
        alunoId,
        status: "ATIVO",
      },
      include: {
        notebook: true,
        aluno: true,
      },
    })

    if (!emprestimo) {
      return NextResponse.json(
        { error: "Nenhum empréstimo ativo encontrado" },
        { status: 404 }
      )
    }

    const resultado = await prisma.$transaction(async (tx) => {

      const emp = await tx.emprestimo.update({
        where: { id: emprestimo.id },
        data: {
          status: "DEVOLVIDO",
          dataDevolucao: new Date(),
        },
      })

      await tx.notebook.update({
        where: { id: emprestimo.notebookId },
        data: { status: "DISPONIVEL" },
      })

      return emp
    })

    return NextResponse.json({
      ok: true,
      mensagem: "Notebook devolvido",
      emprestimoId: resultado.id,
      patrimonio: emprestimo.notebook.patrimonio,
      aluno: emprestimo.aluno.nome,
    })

  } catch (error) {
    console.error("[DEVOLUCAO]", error)
    return NextResponse.json(
      { error: "Erro na devolução" },
      { status: 500 }
    )
  }
}
