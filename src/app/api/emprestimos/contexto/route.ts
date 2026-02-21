import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const alunoIdParam = searchParams.get("alunoId");

    if (!alunoIdParam) {
      return NextResponse.json({ error: "AlunoId não informado" }, { status: 400 });
    }

    const alunoId = Number(alunoIdParam);
    const agora = new Date();

    // Normalização de data para cobrir o dia atual em UTC
    const inicioDia = new Date(agora);
    inicioDia.setUTCHours(0, 0, 0, 0);
    const fimDia = new Date(agora);
    fimDia.setUTCHours(23, 59, 59, 999);

    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      include: {
        materias: {
          include: {
            materia: {
              include: {
                reservas: {
                  where: {
                    status: "ATIVA",
                    dataAula: {
                      gte: inicioDia,
                      lte: fimDia,
                    },
                  },
                  include: {
                    professor: true,
                    turma: true,
                    materia: true, // Incluído para evitar erro de propriedade inexistente
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    const materiasFormatadas = aluno.materias.map((vinculo) => {
      const materia = vinculo.materia;
      const reservaHoje = materia.reservas[0] ?? null;

      return {
        id: materia.id,
        nome: materia.nome,
        codigo: materia.codigo,
        possuiReservaHoje: !!reservaHoje,
        reserva: reservaHoje,
      };
    });

    // Encontra a reserva ativa para o contexto principal
    const reservaAtual = materiasFormatadas.find(m => m.possuiReservaHoje)?.reserva || null;

    return NextResponse.json({
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        matricula: aluno.matricula,
        cpf: aluno.cpf,
      },
      materias: materiasFormatadas,
      // Mapeamento correto dos campos do Schema
      contextoReserva: reservaAtual ? {
        materia: reservaAtual.materia?.nome || "Matéria",
        professor: reservaAtual.professor?.name || "—", // Correção de 'nome' para 'name'
        turma: reservaAtual.turma?.nome || "—",
        horario: reservaAtual.horario
      } : null
    });
  } catch (error) {
    console.error("[GET_CONTEXTO_EMPRESTIMO]", error);
    return NextResponse.json({ error: "Erro ao buscar contexto" }, { status: 500 });
  }
}