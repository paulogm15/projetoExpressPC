import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não fornecida" },
        { status: 400 }
      );
    }

    // TEMPORÁRIO: retorna o primeiro aluno
    // TODO: implementar reconhecimento facial real
    const aluno = await prisma.aluno.findFirst({
      select: {
        id: true,
        nome: true,
        matricula: true,
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Nenhum aluno encontrado" },
        { status: 404 }
      );
    }

    console.log("[FACE_RECOGNIZE] Aluno encontrado:", aluno.nome);

    return NextResponse.json(aluno);

  } catch (error) {
    console.error("[FACE_RECOGNIZE] Error:", error);
    return NextResponse.json(
      { error: "Erro no reconhecimento facial" },
      { status: 500 }
    );
  }
}