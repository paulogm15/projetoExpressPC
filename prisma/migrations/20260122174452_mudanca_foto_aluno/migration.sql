/*
  Warnings:

  - You are about to drop the column `fotoPath` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `professorId` on the `Turma` table. All the data in the column will be lost.
  - Added the required column `foto` to the `Aluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horario` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materiaId` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turno` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('MANHA', 'TARDE', 'NOITE');

-- DropForeignKey
ALTER TABLE "Emprestimo" DROP CONSTRAINT "Emprestimo_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "Emprestimo" DROP CONSTRAINT "Emprestimo_notebookId_fkey";

-- DropForeignKey
ALTER TABLE "Emprestimo" DROP CONSTRAINT "Emprestimo_reservaId_fkey";

-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_professorId_fkey";

-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_turmaId_fkey";

-- DropForeignKey
ALTER TABLE "Turma" DROP CONSTRAINT "Turma_professorId_fkey";

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";

-- AlterTable
ALTER TABLE "Aluno" DROP COLUMN "fotoPath",
ADD COLUMN     "embedding" DOUBLE PRECISION[],
ADD COLUMN     "foto" BYTEA NOT NULL;

-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "horario" TEXT NOT NULL,
ADD COLUMN     "materiaId" INTEGER NOT NULL,
ADD COLUMN     "turno" "Turno" NOT NULL;

-- AlterTable
ALTER TABLE "Turma" DROP COLUMN "professorId";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "emailVerified" SET DEFAULT false;

-- CreateTable
CREATE TABLE "Materia" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "turmaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Materia_codigo_key" ON "Materia"("codigo");

-- CreateIndex
CREATE INDEX "Aluno_ativo_idx" ON "Aluno"("ativo");
