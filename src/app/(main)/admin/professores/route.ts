import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const professores = await prisma.user.findMany({
    where: { role: "PROFESSOR" },
    select: { id: true, name: true }
  });

  return NextResponse.json(professores);
}
