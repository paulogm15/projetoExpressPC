<<<<<<< HEAD
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/* =========================
   LISTAR ALUNOS
========================= */
export async function GET() {
  try {
    const alunos = await prisma.aluno.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        matricula: true,
        ativo: true,
        createdAt: true,
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
    const { nome, matricula, fotoBase64 } = await req.json();

    // Validação básica
    if (!nome || !matricula || !fotoBase64) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      );
    }

    // Converte base64 para Buffer
    const fotoBuffer = Buffer.from(
      fotoBase64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const aluno = await prisma.aluno.create({
      data: {
        nome,
        matricula,
        foto: fotoBuffer,
        embedding: [], // pronto para reconhecimento futuro
      },
    });

    return NextResponse.json(aluno, { status: 201 });

  } catch (error: any) {
    console.error("[POST_ALUNO]", error);

    // Matrícula duplicada
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Matrícula já cadastrada" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao cadastrar aluno" },
      { status: 500 }
    );
  }
}
=======
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/* =========================
   LISTAR ALUNOS
========================= */
export async function GET() {
  try {
    const alunos = await prisma.aluno.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        matricula: true,
        ativo: true,
        createdAt: true,
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
    const { nome, matricula, fotoBase64 } = await req.json();

    // Validação básica
    if (!nome || !matricula || !fotoBase64) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      );
    }

    // Converte base64 para Buffer
    const fotoBuffer = Buffer.from(
      fotoBase64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const aluno = await prisma.aluno.create({
      data: {
        nome,
        matricula,
        foto: fotoBuffer,
        embedding: [], // pronto para reconhecimento futuro
      },
    });

    return NextResponse.json(aluno, { status: 201 });

  } catch (error: any) {
    console.error("[POST_ALUNO]", error);

    // Matrícula duplicada
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Matrícula já cadastrada" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao cadastrar aluno" },
      { status: 500 }
    );
  }
}
>>>>>>> origin/main
