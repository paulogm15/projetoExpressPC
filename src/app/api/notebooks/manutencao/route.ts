import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      )
    }

    const atualizado = await prisma.notebook.update({
      where: { id: Number(id) },
      data: { status: "MANUTENCAO" },
    })

    return NextResponse.json(atualizado)

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao atualizar status" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const { id } = await req.json()

    const atualizado = await prisma.notebook.update({
      where: { id: Number(id) },
      data: { status: "DISPONIVEL" },
    })

    return NextResponse.json(atualizado)

  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao liberar manutenção" },
      { status: 500 }
    )
  }
}