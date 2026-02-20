import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Imagem não fornecida" }, { status: 400 });
    }

    // 1. Pede o embedding da foto atual para o Python
    const pyRes = await fetch("http://localhost:5000/get-embedding", {
      method: "POST",
      body: JSON.stringify({ image }),
      headers: { "Content-Type": "application/json" }
    });

    if (!pyRes.ok) {
      const errorData = await pyRes.json();
      return NextResponse.json({ error: errorData.error || "Erro no serviço de IA" }, { status: pyRes.status });
    }

    const { embedding: currentEmbedding } = await pyRes.json();

    // 2. Busca apenas alunos que possuem embeddings cadastrados
    // O Prisma retorna um array vazio se não houver registros, o que é seguro.
    const alunos = await prisma.aluno.findMany({
      where: {
        embedding: {
          isEmpty: false // Garante que não estamos comparando com arrays vazios
        },
        ativo: true // Filtra apenas alunos ativos
      },
      select: {
        id: true,
        nome: true,
        matricula: true,
        embedding: true
      }
    });

    // 3. Lógica de comparação
    let melhorMatch = null;
    let menorDistancia = 0.6; // Threshold padrão: menor que 0.6 é considerado a mesma pessoa

    for (const aluno of alunos) {
      // Garantimos que estamos tratando como array de números
      const dist = calcularDistancia(currentEmbedding, aluno.embedding as number[]);
      
      if (dist < menorDistancia) {
        menorDistancia = dist;
        melhorMatch = {
          id: aluno.id,
          nome: aluno.nome,
          matricula: aluno.matricula
        };
      }
    }

    if (!melhorMatch) {
      return NextResponse.json({ error: "Rosto não reconhecido no sistema" }, { status: 404 });
    }

    console.log(`[FACE_RECOGNIZE] Sucesso: ${melhorMatch.nome} (Dist: ${menorDistancia.toFixed(4)})`);
    return NextResponse.json(melhorMatch);

  } catch (error) {
    console.error("[FACE_RECOGNIZE] Error:", error);
    return NextResponse.json(
      { error: "Erro interno no processamento facial" },
      { status: 500 }
    );
  }
}

function calcularDistancia(vecA: number[], vecB: number[]) {
  if (vecA.length !== vecB.length) return 1.0; // Evita erro se os tamanhos divergirem
  return Math.sqrt(vecA.reduce((sum, val, i) => sum + Math.pow(val - vecB[i], 2), 0));
}