import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/* =========================
   LISTAR ALUNOS
========================= */
export async function GET() {
  try {
    // admin/alunos/route.ts
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0); // Força o início do dia em UTC

    const fimDoDia = new Date();
    fimDoDia.setUTCHours(23, 59, 59, 999); // Força o fim do dia em UTC

    const alunos = await prisma.aluno.findMany({
      orderBy: { nome: "asc" },
      include: {
        materias: {
          include: {
            materia: {
              include: {
                reservas: {
                  where: {
                    status: "ATIVA",
                    dataAula: {
                      gte: hoje,
                      lte: fimDoDia,
                    },
                  },
                  include: {
                    professor: true,
                    turma: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(alunos);
  } catch (error) {
    console.error("[GET_ALUNOS]", error);
    return NextResponse.json(
      { error: "Erro ao buscar alunos" },
      { status: 500 }
    );
  }
}

/* =========================
   CADASTRAR ALUNO
========================= */
export async function POST(req: Request) {
  try {
    const { nome, matricula, cpf, fotoBase64, materiasIds } =
      await req.json();

    if (!nome || !matricula || !cpf || !fotoBase64) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      );
    }

    /* =========================
       GERAR EMBEDDING (Python)
    ========================= */
    let embedding: number[] = [];

    try {
      const pythonRes = await fetch(
        "http://localhost:5000/get-embedding",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: fotoBase64 }),
        }
      );

      const pyData = await pythonRes.json();

      if (!pythonRes.ok) {
        return NextResponse.json(
          { error: pyData.error || "Rosto não detectado na imagem" },
          { status: 400 }
        );
      }

      embedding = pyData.embedding;
    } catch (err) {
      console.error("[PYTHON_BRIDGE_ERROR]", err);
      return NextResponse.json(
        { error: "O serviço de reconhecimento facial está offline" },
        { status: 503 }
      );
    }

    /* =========================
       CONVERTER FOTO → BUFFER
    ========================= */
    const fotoBuffer = Buffer.from(
      fotoBase64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    /* =========================
       CRIAR ALUNO + RELAÇÕES
    ========================= */
    const aluno = await prisma.aluno.create({
      data: {
        nome,
        matricula,
        cpf,
        foto: fotoBuffer,
        embedding,
        materias: materiasIds?.length
          ? {
              create: materiasIds.map((materiaId: number) => ({
                materia: { connect: { id: materiaId } },
              })),
            }
          : undefined,
      },
      include: {
        materias: {
          include: { materia: true },
        },
      },
    });

    return NextResponse.json(aluno, { status: 201 });

  } catch (error: any) {
    console.error("[POST_ALUNO_FATAL]", error);

    if (error.code === "P2002") {
      const campo = error.meta?.target?.[0];

      if (campo === "cpf") {
        return NextResponse.json(
          { error: "Este CPF já está cadastrado no sistema." },
          { status: 409 }
        );
      }

      if (campo === "matricula") {
        return NextResponse.json(
          { error: "Esta matrícula já está cadastrada no sistema." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Registro duplicado." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno ao processar cadastro" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETAR ALUNO
========================= */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { error: "ID do aluno não informado" },
        { status: 400 }
      );
    }

    const id = Number(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Remove vínculos com matérias
    await prisma.alunoMateria.deleteMany({
      where: { alunoId: id },
    });

    // Remove empréstimos
    await prisma.emprestimo.deleteMany({
      where: { alunoId: id },
    });

    // Remove aluno
    await prisma.aluno.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Aluno deletado com sucesso." },
      { status: 200 }
    );

  } catch (error) {
    console.error("[DELETE_ALUNO]", error);

    return NextResponse.json(
      { error: "Erro ao deletar aluno" },
      { status: 500 }
    );
  }
}