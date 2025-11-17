// app/admin/turmas/api/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codigo, nome, semestre, ano, materiaIds } = body;

    console.log('Dados recebidos:', body);

    // Validação
    if (!codigo || !nome || !semestre || !ano) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      );
    }

    if (!materiaIds || !Array.isArray(materiaIds) || materiaIds.length === 0) {
      return NextResponse.json(
        { error: 'Selecione pelo menos uma matéria' },
        { status: 400 }
      );
    }

    // Verifica se código já existe
    const turmaExistente = await prisma.turma.findUnique({
      where: { codigo },
    });

    if (turmaExistente) {
      return NextResponse.json(
        { error: 'Já existe uma turma com este código' },
        { status: 400 }
      );
    }

    // Cria a turma
    const turma = await prisma.turma.create({
      data: {
        codigo,
        nome,
        semestre: Number(semestre),
        ano: Number(ano),
        materias: {
          connect: materiaIds.map((id: number) => ({ id })),
        },
      },
      include: {
        materias: true,
      },
    });

    return NextResponse.json(turma, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar turma:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}