import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const turma = await prisma.turma.create({
      data: {
        codigo: data.codigo,
        nome: data.nome,
        semestre: Number(data.semestre),
        ano: Number(data.ano),
        professorId: data.professorId,
      },
    });

    return NextResponse.json(turma);
  } catch (err) {
    console.error("Erro ao criar turma:", err);
    return NextResponse.json({ error: "Erro ao criar turma" }, { status: 500 });
  }
}
