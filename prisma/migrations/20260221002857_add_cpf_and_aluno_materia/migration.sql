/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `Aluno` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `Aluno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "cpf" VARCHAR(14) NOT NULL;

-- CreateTable
CREATE TABLE "AlunoMateria" (
    "alunoId" INTEGER NOT NULL,
    "materiaId" INTEGER NOT NULL,

    CONSTRAINT "AlunoMateria_pkey" PRIMARY KEY ("alunoId","materiaId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_cpf_key" ON "Aluno"("cpf");
