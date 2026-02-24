"use client"

import { useState, useEffect } from "react"

type User = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "PROFESSOR"
  status: "ATIVO" | "INATIVO"
  createdAt: string
  turmas: number
}

type Log = {
  id: number
  user: string
  action: string
  time: string
}

type Props = {
  currentUser: { id: string; name: string; email: string }
}

export default function AdminUserPanel({ currentUser }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [activeTab, setActiveTab] = useState<"usuarios" | "logs">("usuarios")
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("todos")
  const [filterStatus, setFilterStatus] = useState("todos")
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const [deleteModal, setDeleteModal] = useState<User | null>(null)
  const [editModal, setEditModal] = useState<User | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "PROFESSOR", password: "" })

  const showNotification = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3500)
  }

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      if (res.ok) setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLogs() {
    const res = await fetch("/api/logs")
    const data = await res.json()
    if (res.ok) setLogs(data)
  }

  useEffect(() => { fetchUsers(); fetchLogs() }, [])

  async function handleDelete(user: User) {
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) { showNotification(data.error || "Erro ao excluir", "error"); return }
    setUsers(prev => prev.filter(u => u.id !== user.id))
    setDeleteModal(null)
    showNotification(`Usuário "${user.name}" excluído.`, "error")
    fetchLogs()
  }

  async function handleEdit(updated: User) {
    const res = await fetch(`/api/users/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: updated.name, email: updated.email, role: updated.role }),
    })
    const data = await res.json()
    if (!res.ok) { showNotification(data.error || "Erro ao editar", "error"); return }
    setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u))
    setEditModal(null)
    showNotification("Usuário atualizado com sucesso.")
    fetchLogs()
  }

  async function handleAdd() {
    if (!newUser.name || !newUser.email || !newUser.password) {
      showNotification("Preencha todos os campos", "error"); return
    }
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
    const data = await res.json()
    if (!res.ok) { showNotification(data.error || "Erro ao criar", "error"); return }
    setAddModal(false)
    setNewUser({ name: "", email: "", role: "PROFESSOR", password: "" })
    showNotification(`Usuário "${newUser.name}" criado com sucesso.`)
    fetchUsers(); fetchLogs()
  }

  async function handleToggleStatus(user: User) {
    const res = await fetch(`/api/users/${user.id}`, { method: "PATCH" })
    const data = await res.json()
    if (!res.ok) { showNotification(data.error || "Erro ao alterar status", "error"); return }
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: data.status } : u))
    showNotification(`Usuário ${data.status === "ATIVO" ? "ativado" : "desativado"}.`)
    fetchLogs()
  }

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === "todos" || u.role === filterRole
    const matchStatus = filterStatus === "todos" || u.status === filterStatus
    return matchSearch && matchRole && matchStatus
  })

  const stats = {
    total: users.length,
    ativos: users.filter(u => u.status === "ATIVO").length,
    professores: users.filter(u => u.role === "PROFESSOR").length,
    admins: users.filter(u => u.role === "ADMIN").length,
  }

  const border = "#e2e8f0"
  const subtext = "#64748b"
  const text = "#0f172a"
  const inputBg = "#f8fafc"
  const card = "#ffffff"

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: `1px solid ${border}`,
    borderRadius: 8, background: inputBg, color: text, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", outline: "none",
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif", color: text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;900&display=swap" rel="stylesheet" />


      {/* Notificação */}
      {notification && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: notification.type === "error" ? "#fef2f2" : "#f0fdf4", border: `1px solid ${notification.type === "error" ? "#fecaca" : "#bbf7d0"}`, color: notification.type === "error" ? "#dc2626" : "#16a34a", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          {notification.type === "error" ? "✕ " : "✓ "}{notification.msg}
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 20px 32px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total de Usuários", value: stats.total, icon: "👥", iconBg: "#dbeafe" },
            { label: "Usuários Ativos", value: stats.ativos, icon: "✅", iconBg: "#dcfce7" },
            { label: "Professores", value: stats.professores, icon: "🎓", iconBg: "#ede9fe" },
            { label: "Administradores", value: stats.admins, icon: "🛡️", iconBg: "#fef3c7" },
          ].map(s => (
            <div key={s.label} style={{ background: card, borderRadius: 14, padding: "18px 20px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, background: s.iconBg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{loading ? "—" : s.value}</div>
                <div style={{ fontSize: 12, color: subtext, fontWeight: 500, marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Card principal */}
        <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, overflow: "hidden" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${border}`, padding: "0 24px" }}>
            {[{ key: "usuarios", label: "👥 Gerenciar Usuários" }, { key: "logs", label: "📋 Logs de Atividade" }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{ padding: "14px 20px", border: "none", borderBottom: activeTab === tab.key ? "2px solid #2563eb" : "2px solid transparent", background: "transparent", color: activeTab === tab.key ? "#2563eb" : subtext, fontWeight: activeTab === tab.key ? 700 : 500, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ABA USUÁRIOS */}
          {activeTab === "usuarios" && (
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                  <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
                  <input placeholder="Buscar por nome ou email..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 32 }} />
                </div>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ padding: "9px 12px", border: `1px solid ${border}`, borderRadius: 8, fontSize: 13, color: text, background: inputBg, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                  <option value="todos">Todos os cargos</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "9px 12px", border: `1px solid ${border}`, borderRadius: 8, fontSize: 13, color: text, background: inputBg, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                  <option value="todos">Todos os status</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </select>
                <button onClick={() => setAddModal(true)} style={{ padding: "9px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  + Novo Usuário
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Usuário", "Email", "Cargo", "Status", "Turmas", "Ações"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: subtext, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: subtext }}>Carregando...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: subtext }}>Nenhum usuário encontrado.</td></tr>
                    ) : filtered.map(u => (
                      <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: u.role === "ADMIN" ? "#fef3c7" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: u.role === "ADMIN" ? "#d97706" : "#2563eb", flexShrink: 0 }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                              {u.id === currentUser.id && <div style={{ fontSize: 10, color: "#2563eb", fontWeight: 700 }}>você</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13, color: subtext }}>{u.email}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: u.role === "ADMIN" ? "#fef3c7" : "#dbeafe", color: u.role === "ADMIN" ? "#d97706" : "#2563eb" }}>
                            {u.role === "ADMIN" ? "Admin" : "Professor"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: u.status === "ATIVO" ? "#dcfce7" : "#fee2e2", color: u.status === "ATIVO" ? "#16a34a" : "#dc2626" }}>
                            {u.status === "ATIVO" ? "ativo" : "inativo"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13, color: subtext, textAlign: "center" }}>{u.turmas}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setEditModal({ ...u })} title="Editar" style={{ padding: "6px 10px", background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>✏️</button>
                            {u.id !== currentUser.id && (<>
                              <button onClick={() => handleToggleStatus(u)} title={u.status === "ATIVO" ? "Desativar" : "Ativar"} style={{ padding: "6px 10px", background: u.status === "ATIVO" ? "#fffbeb" : "#f0fdf4", color: u.status === "ATIVO" ? "#d97706" : "#16a34a", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
                                {u.status === "ATIVO" ? "⏸️" : "▶️"}
                              </button>
                              <button onClick={() => setDeleteModal(u)} title="Excluir" style={{ padding: "6px 10px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>🗑️</button>
                            </>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12, color: subtext, fontSize: 13 }}>{filtered.length} usuário(s) encontrado(s)</div>
            </div>
          )}

          {/* ABA LOGS */}
          {activeTab === "logs" && (
            <div style={{ padding: 24 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Usuário", "Ação", "Data/Hora"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: subtext, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: subtext }}>Nenhum log registrado ainda.</td></tr>
                  ) : logs.map(l => (
                    <tr key={l.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 600 }}>{l.user}</td>
                      <td style={{ padding: "12px 14px", color: subtext }}>{l.action}</td>
                      <td style={{ padding: "12px 14px", color: subtext, fontSize: 13 }}>{l.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Excluir */}
      {deleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div style={{ background: card, borderRadius: 16, padding: 32, maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontSize: 40, marginBottom: 12, textAlign: "center" }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", textAlign: "center", fontSize: 17, fontWeight: 800 }}>Excluir Usuário</h3>
            <p style={{ color: subtext, textAlign: "center", margin: "0 0 24px", fontSize: 14, lineHeight: 1.6 }}>
              Tem certeza que deseja excluir <strong style={{ color: text }}>{deleteModal.name}</strong>?<br />Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: 10, background: inputBg, border: `1px solid ${border}`, borderRadius: 9, cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteModal)} style={{ flex: 1, padding: 10, background: "#dc2626", border: "none", borderRadius: 9, cursor: "pointer", color: "#fff", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div style={{ background: card, borderRadius: 16, padding: 32, maxWidth: 440, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", fontFamily: "'DM Sans', sans-serif" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 800 }}>✏️ Editar Usuário</h3>
            {(["name", "email"] as const).map(field => (
              <div key={field} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: subtext, display: "block", marginBottom: 6, textTransform: "uppercase" as const }}>{field === "name" ? "Nome" : "Email"}</label>
                <input value={editModal[field]} onChange={e => setEditModal(p => ({ ...p!, [field]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: subtext, display: "block", marginBottom: 6, textTransform: "uppercase" as const }}>Cargo</label>
              <select value={editModal.role} onChange={e => setEditModal(p => ({ ...p!, role: e.target.value as any }))} style={{ ...inputStyle }}>
                <option value="PROFESSOR">Professor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: 10, background: inputBg, border: `1px solid ${border}`, borderRadius: 9, cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
              <button onClick={() => handleEdit(editModal)} style={{ flex: 1, padding: 10, background: "#2563eb", border: "none", borderRadius: 9, cursor: "pointer", color: "#fff", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar */}
      {addModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div style={{ background: card, borderRadius: 16, padding: 32, maxWidth: 440, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", fontFamily: "'DM Sans', sans-serif" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 800 }}>➕ Novo Usuário</h3>
            {([["name", "Nome", "text"], ["email", "Email", "email"], ["password", "Senha", "password"]] as const).map(([field, label, type]) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: subtext, display: "block", marginBottom: 6, textTransform: "uppercase" as const }}>{label}</label>
                <input type={type} value={newUser[field]} placeholder={label} onChange={e => setNewUser(p => ({ ...p, [field]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: subtext, display: "block", marginBottom: 6, textTransform: "uppercase" as const }}>Cargo</label>
              <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle }}>
                <option value="PROFESSOR">Professor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: 10, background: inputBg, border: `1px solid ${border}`, borderRadius: 9, cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
              <button onClick={handleAdd} style={{ flex: 1, padding: 10, background: "#2563eb", border: "none", borderRadius: 9, cursor: "pointer", color: "#fff", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Criar Usuário</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}