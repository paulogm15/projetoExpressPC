import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// POST - CRIAR MATÉRIA COM VÍNCULOS
// ==========================================
export async function POST(req: Request) {
  try {
    const { nome, codigo, professorId, turmaIds } = await req.json();

    // 1️⃣ Validação básica de campos
    if (!nome || !codigo || !professorId) {
      return NextResponse.json(
        { error: "Nome, código e professor são obrigatórios" },
        { status: 400 }
      );
    }

    // 2️⃣ Verificar se o professor existe e tem a role correta
    const professor = await prisma.user.findFirst({
      where: { id: professorId, role: "PROFESSOR" },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "O professor selecionado não é válido" },
        { status: 400 }
      );
    }

    // 3️⃣ Criar a matéria e os vínculos na tabela intermediária TurmaMateria
    const materia = await prisma.materia.create({
      data: {
        nome,
        codigo,
        professorId,
        // Criando a relação N:N através da tabela intermediária
        turmas: {
          create: Array.isArray(turmaIds) 
            ? turmaIds.map((id: number) => ({
                turma: { connect: { id } }
              }))
            : []
        }
      },
      include: {
        turmas: { include: { turma: true } }
      }
    });

    return NextResponse.json(materia, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Já existe uma matéria com este código" }, { status: 400 });
    }
    console.error("Erro no POST Materias:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// ==========================================
// GET - LISTAR MATÉRIAS E TURMAS VINCULADAS
// ==========================================
export async function GET() {
  try {
    const materias = await prisma.materia.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        professor: {
          select: { id: true, name: true, email: true }
        },
        // Incluir as turmas para que apareçam na tabela do frontend
        turmas: {
          include: {
            turma: {
              select: { id: true, nome: true, codigo: true }
            }
          }
        }
      },
    });

    return NextResponse.json(materias);
  } catch (error) {
    console.error("Erro no GET Materias:", error);
    return NextResponse.json({ error: "Erro ao buscar matérias" }, { status: 500 });
  }
}

// ==========================================
// PUT - ATUALIZAR MATÉRIA E REFAZER VÍNCULOS
// ==========================================
export async function PUT(req: Request) {
  try {
    const { id, nome, codigo, professorId, turmaIds } = await req.json();

    if (!id) return NextResponse.json({ error: "ID da matéria é necessário" }, { status: 400 });

    // Usamos uma transação para garantir que os vínculos antigos sejam deletados 
    // e os novos criados de forma segura
    const materiaAtualizada = await prisma.$transaction(async (tx) => {
      
      // 1. Deletar vínculos antigos com turmas
      await tx.turmaMateria.deleteMany({
        where: { materiaId: id }
      });

      // 2. Atualizar dados básicos e criar novos vínculos
      return await tx.materia.update({
        where: { id },
        data: {
          nome,
          codigo,
          professorId,
          turmas: {
            create: Array.isArray(turmaIds) 
              ? turmaIds.map((tId: number) => ({
                  turma: { connect: { id: tId } }
                }))
              : []
          }
        },
        include: {
          turmas: { include: { turma: true } }
        }
      });
    });

    return NextResponse.json(materiaAtualizada);
  } catch (error) {
    console.error("Erro no PUT Materias:", error);
    return NextResponse.json({ error: "Erro ao atualizar matéria" }, { status: 500 });
  }
}

// ==========================================
// DELETE - EXCLUIR MATÉRIA
// ==========================================
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    // O Prisma deletará automaticamente os registros em TurmaMateria se estiver 
    // configurado com onDelete: Cascade no schema. Caso contrário, delete manualmente primeiro:
    await prisma.turmaMateria.deleteMany({ where: { materiaId: id } });
    
    await prisma.materia.delete({ where: { id } });
    
    return NextResponse.json({ message: "Matéria excluída" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir matéria" }, { status: 500 });
  }
}