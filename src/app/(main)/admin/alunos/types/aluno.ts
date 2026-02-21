export type Materia = {
  id: number;
  nome: string;
  codigo: string;
};

export type AlunoMateria = {
  alunoId: number;
  materiaId: number;
  materia: Materia;
};

export type Aluno = {
  id: number;
  nome: string;
  matricula: string;
  cpf?: string | null;
  ativo?: boolean;
  materias: AlunoMateria[];
};