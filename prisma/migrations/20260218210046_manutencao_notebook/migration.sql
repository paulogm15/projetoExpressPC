/*
  Warnings:

  - You are about to drop the column `turmaId` on the `Materia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Materia" DROP COLUMN "turmaId";

-- AlterTable
ALTER TABLE "Notebook" ADD COLUMN     "dataFimManutencao" TIMESTAMP(3),
ADD COLUMN     "dataInicioManutencao" TIMESTAMP(3),
ADD COLUMN     "observacaoManutencao" TEXT;

-- CreateTable
CREATE TABLE "TurmaMateria" (
    "turmaId" INTEGER NOT NULL,
    "materiaId" INTEGER NOT NULL,

    CONSTRAINT "TurmaMateria_pkey" PRIMARY KEY ("turmaId","materiaId")
);
