<<<<<<< HEAD
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createId } from "@paralleldrive/cuid2"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role")

  try {
    const users = await prisma.user.findMany({
      where: { role: role ? (role as any) : undefined },
=======
<<<<<<< HEAD
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  try {
    const users = await prisma.user.findMany({
      where: {
        // Se houver um role na URL, filtra. Caso contrário, traz todos.
        role: role ? (role as any) : undefined,
      },
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
      select: {
        id: true,
        name: true,
        email: true,
<<<<<<< HEAD
        role: true,
        status: true,
        createdAt: true,
        materias: { select: { id: true } },
      },
      orderBy: { name: "asc" },
    })

    const mapped = users.map(u => ({
      ...u,
      turmas: u.materias.length,
      materias: undefined,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const { name, email, role, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { name }] } })
    if (exists) {
      return NextResponse.json({ error: "Já existe um usuário com esse nome ou email" }, { status: 409 })
    }

    // Hash da senha com bcrypt (mesmo padrão do better-auth)
    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = createId()

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        role: role || "PROFESSOR",
        emailVerified: false,
        accounts: {
          create: {
            id: createId(),
            accountId: userId,
            providerId: "credential",
            password: hashedPassword,
          },
        },
      },
    })

    await prisma.log.create({
      data: {
        userId: session.user.id,
        action: `Criou usuário "${name}"`,
      },
    })

    return NextResponse.json({ message: `Usuário "${name}" criado com sucesso`, user: newUser })
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
=======
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
=======
// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  try {
    const users = await prisma.user.findMany({
      where: {
        // Se houver um role na URL, filtra. Caso contrário, traz todos.
        role: role ? (role as any) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
>>>>>>> origin/main
>>>>>>> d9ee6f5df357af25cf887058b7dcc15312449d0a
}