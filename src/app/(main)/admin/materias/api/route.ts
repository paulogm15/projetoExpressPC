import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const materias = await prisma.materia.findMany({
      select: { 
        id: true, 
        nome: true, 
        codigo: true 
      },
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json(materias);
  } catch (error) {
    console.error("Erro ao buscar matérias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}