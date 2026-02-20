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

    // 1. Validação básica de entrada
    if (!nome || !matricula || !fotoBase64) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      );
    }

    // 2. Chamada obrigatória à API Python para gerar biometria facial
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
        // Interrompe o cadastro se a IA não detectar um rosto válido
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

    // 3. Conversão da foto para Buffer (armazenamento otimizado)
    const fotoBuffer = Buffer.from(
      fotoBase64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    // 4. Persistência no banco de dados com Prisma
    const aluno = await prisma.aluno.create({
      data: {
        nome,
        matricula,
        foto: fotoBuffer,
        embedding: embedding, // Vetor de 128 números para comparação futura
      },
    });

    console.log(`[POST_ALUNO] Sucesso: Aluno ${nome} cadastrado com biometria.`);
    
    return NextResponse.json(aluno, { status: 201 });

  } catch (error: any) {
    console.error("[POST_ALUNO_FATAL]", error);

    // Tratamento de erro de unicidade (Matrícula)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Esta matrícula já está cadastrada no sistema." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno ao processar cadastro" },
      { status: 500 }
    );
  }
}