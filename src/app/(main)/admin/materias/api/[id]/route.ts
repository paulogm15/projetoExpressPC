import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = {
  params: { id: string };
};

/* =========================
   BUSCAR MATÉRIA POR ID
========================= */
export async function GET(_: NextRequest, { params }: Params) {
  try {
    const materia = await prisma.materia.findUnique({
      where: { id: Number(params.id) },
      include: {
        turmas: {
          include: {
            turma: true,
          },
        },
      },
    });

    if (!materia) {
      return NextResponse.json(
        { error: "Matéria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...materia,
      turmas: materia.turmas.map((t) => t.turma),
    });
  } catch (error) {
    console.error("Erro ao buscar matéria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/* =========================
   ATUALIZAR MATÉRIA
========================= */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { nome, codigo } = await request.json();

    const materia = await prisma.materia.update({
      where: { id: Number(params.id) },
      data: { nome, codigo },
    });

    return NextResponse.json(materia);
  } catch (error) {
    console.error("Erro ao atualizar matéria:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar matéria" },
      { status: 500 }
    );
  }
}

/* =========================
   EXCLUIR MATÉRIA
========================= */
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const materiaId = Number(params.id);

    await prisma.materia.delete({
      where: { id: materiaId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
