import React, { useState } from 'react'
import { useAuth } from '../app/providers/AuthContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'

// "Beatriz Pereira Lima" -> "Beatriz L."
function nomeCurto(nome) {
  const partes = (nome || '').trim().split(/\s+/).filter(Boolean)
  if (partes.length < 2) return partes[0] || ''
  return `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`
}

export default function AppLayout({ children, activePage, onNavigate, search = '', onSearchChange, searchPlaceholder = 'Buscar...' }) {
  const { user, logout, registeredUsers } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'

  // O usuário logado só guarda id, nome e perfil de acesso. Cargo e foto vêm
  // da lista de usuários, quando ela já foi carregada.
  const cadastro = registeredUsers.find(u => String(u.id) === String(user?.id))
  const nome = user?.nome || user?.name || ''
  const perfil = {
    nome,
    nomeCurto: nomeCurto(nome),
    cargo:     cadastro?.cargo || user?.role || 'Membro',
    avatarUrl: cadastro?.avatarUrl || user?.avatar || '',
  }

  const handleNavigate = (id) => {
    onNavigate?.(id)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-pina-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        open={sidebarOpen}
        activePage={activePage}
        isAdmin={isAdmin}
        perfil={perfil}
        onNavigate={handleNavigate}
        onLogout={logout}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          perfil={perfil}
          onLogout={logout}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}
