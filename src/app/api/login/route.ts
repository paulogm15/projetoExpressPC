import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prismaGetInstance } from "@/lib/prisma-pg";
import { PrismaClient, User } from "@/generated/prisma";
import { PrismaClientKnownRequestError } from "@/generated/prisma/runtime/library";
import { Session } from "inspector/promises";

interface LoginProps {
  email: string;
  password: string;
}

export interface LoginResponse {
  session: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as LoginProps;

    if (!email || !password) {
      return NextResponse.json<LoginResponse>(
        { session: "" },
        { status: 200 }
      );
    }

    const prisma = prismaGetInstance();

    const user = await prisma.user.findFirstOrThrow({
      where: { email },
    });

    const userPassword = user.password;
    const passwordResult = bcrypt.compareSync(password, userPassword);

    if (!passwordResult) {
      return NextResponse.json<LoginResponse>(
        { session: "" },
        { status: 200 }
      );
    }

    return NextResponse.json<LoginResponse>(
      { session: "ok" },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json<LoginResponse>(
      { session: "" },
      { status: 200 }
    );
  }
}
