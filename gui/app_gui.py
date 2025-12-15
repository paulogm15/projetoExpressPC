import tkinter as tk
from tkinter import simpledialog
from app.services.face_service import cadastrar_rosto, reconhecer_rosto


def cadastrar():
    nome = simpledialog.askstring("Cadastro", "Nome da pessoa:")
    if nome:
        cadastrar_rosto(nome)


def reconhecer():
    reconhecer_rosto()


root = tk.Tk()
root.title("Reconhecimento Facial")

tk.Button(root, text="Cadastrar Rosto", width=30, command=cadastrar).pack(pady=10)
tk.Button(root, text="Reconhecer Rosto", width=30, command=reconhecer).pack(pady=10)

root.mainloop()
