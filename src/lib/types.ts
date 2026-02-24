export interface Student {
  id: string
  name: string
  matricula: string
  curso: string
  faceDescriptor?: number[]
  photoUrl?: string
  createdAt: string
}

export interface Notebook {
  id: string
  patrimonio: string
  modelo: string
  status: 'disponivel' | 'emprestado' | 'manutencao'
  createdAt: string
}

export interface Loan {
  id: string
  notebookId: string
  studentId: string
  patrimonio: string
  studentName: string
  studentMatricula: string
  photoAtLoan?: string
  photoAtReturn?: string
  loanDate: string
  returnDate?: string
  status: 'ativo' | 'devolvido'
}

export type TabType = 'emprestimo' | 'devolucao' | 'historico' | 'cadastros'
