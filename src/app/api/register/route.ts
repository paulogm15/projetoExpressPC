import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prismaGetInstance } from "@/lib/prisma-pg";
import { PrismaClient, User } from "@/generated/prisma";
import { PrismaClientKnownRequestError } from "@/generated/prisma/runtime/library";

interface RegisterProps {
  email: string;
  password: string;
  password2: string;
}

export interface RegisterResponse {
  error?: string;
  user?: User; 
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, password2 } = body as RegisterProps;

    if (!email || !password || !password2) {
      return NextResponse.json(
        { error: "missing required fields" },
        { status: 400 }
      );
    }

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }

    if (password.length < 8 || password !== password2) {
      return NextResponse.json({ error: "invalid password" }, { status: 400 });
    }

    const hash = bcrypt.hashSync(password, 12);

    try {
      const prisma = prismaGetInstance();

      const user = await prisma.user.create({
        data: {
          email,
          password: hash,
        },
      });

      return NextResponse.json({ user }, { status: 200 });

    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json({ error: "user already exist" }, { status: 400 });
        }
      }
      return NextResponse.json({ error: "internal server error" }, { status: 500 });
    }

  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
