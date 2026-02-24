import type { Student, Notebook, Loan } from './types'

const STUDENTS_KEY = 'notebook_loan_students'
const NOTEBOOKS_KEY = 'notebook_loan_notebooks'
const LOANS_KEY = 'notebook_loan_loans'

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : defaultValue
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export function getStudents(): Student[] {
  return getFromStorage<Student[]>(STUDENTS_KEY, [])
}

export function saveStudent(student: Student): void {
  const students = getStudents()
  const existingIndex = students.findIndex(s => s.id === student.id)
  if (existingIndex >= 0) {
    students[existingIndex] = student
  } else {
    students.push(student)
  }
  saveToStorage(STUDENTS_KEY, students)
}

export function deleteStudent(id: string): void {
  const students = getStudents().filter(s => s.id !== id)
  saveToStorage(STUDENTS_KEY, students)
}

export function getNotebooks(): Notebook[] {
  return getFromStorage<Notebook[]>(NOTEBOOKS_KEY, [])
}

export function saveNotebook(notebook: Notebook): void {
  const notebooks = getNotebooks()
  const existingIndex = notebooks.findIndex(n => n.id === notebook.id)
  if (existingIndex >= 0) {
    notebooks[existingIndex] = notebook
  } else {
    notebooks.push(notebook)
  }
  saveToStorage(NOTEBOOKS_KEY, notebooks)
}

export function deleteNotebook(id: string): void {
  const notebooks = getNotebooks().filter(n => n.id !== id)
  saveToStorage(NOTEBOOKS_KEY, notebooks)
}

export function updateNotebookStatus(id: string, status: Notebook['status']): void {
  const notebooks = getNotebooks()
  const notebook = notebooks.find(n => n.id === id)
  if (notebook) {
    notebook.status = status
    saveToStorage(NOTEBOOKS_KEY, notebooks)
  }
}

export function getLoans(): Loan[] {
  return getFromStorage<Loan[]>(LOANS_KEY, [])
}

export function saveLoan(loan: Loan): void {
  const loans = getLoans()
  const existingIndex = loans.findIndex(l => l.id === loan.id)
  if (existingIndex >= 0) {
    loans[existingIndex] = loan
  } else {
    loans.push(loan)
  }
  saveToStorage(LOANS_KEY, loans)
}

export function getActiveLoans(): Loan[] {
  return getLoans().filter(l => l.status === 'ativo')
}

export function findActiveLoanByPatrimonio(patrimonio: string): Loan | undefined {
  return getLoans().find(l => l.patrimonio === patrimonio && l.status === 'ativo')
}

export function findNotebookByPatrimonio(patrimonio: string): Notebook | undefined {
  return getNotebooks().find(n => n.patrimonio === patrimonio)
}

export function findStudentByMatricula(matricula: string): Student | undefined {
  return getStudents().find(s => s.matricula === matricula)
}
