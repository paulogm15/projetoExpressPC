"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export default function ProfileForm({ user }: any) {
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        // Verifica se a API mandou 'error' ou 'message'
        alert(data.error || data.message || "Erro ao atualizar")
        return
      }

      alert(data.message)
      setPassword("") // Limpa o campo de senha após sucesso
    } catch (err) {
      alert("Erro na conexão com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Perfil</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Nome</label>
          <input
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium"
        >
          {loading ? "Atualizando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  )
}