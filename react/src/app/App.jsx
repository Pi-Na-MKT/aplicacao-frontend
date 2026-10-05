import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './providers/AuthContext'
import Spinner from '../shared/components/Spinner'
import AppLayout from '../layouts/AppLayout'
import { Login, Cadastro } from '../features/auth'
import { Usuarios } from '../features/usuarios'
import { Empresas } from '../features/empresas'
import { Tarefas } from '../features/tarefas'
import { Dashboard } from '../features/dashboard'
import { Anexos } from '../features/anexos'

const PAGES = {
  EMPRESAS:         'empresas',
  TAREFAS:          'tarefas',
  DASHBOARD:        'dashboard',
  ANEXOS:           'anexos',
  USUARIOS:         'usuarios',
  CADASTRO_USUARIO: 'cadastro_usuario',
}

const AUTH_VIEWS = {
  LOGIN:    'login',
  CADASTRO: 'cadastro',
}

function AppContent() {
  const { loading } = useAuth()
  const [page, setPage] = useState(PAGES.EMPRESAS)
  const [selectedEmpresa, setSelectedEmpresa] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg"/>
          <span className="text-sm text-gray-500">Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <AuthGate
      page={page}
      setPage={setPage}
      selectedEmpresa={selectedEmpresa}
      setSelectedEmpresa={setSelectedEmpresa}
    />
  )
}

function AuthGate({ page, setPage, selectedEmpresa, setSelectedEmpresa }) {
  const { user } = useAuth()
  const [authView, setAuthView] = useState(AUTH_VIEWS.LOGIN)
  // Texto da busca da barra superior. Cada tela decide o que filtra com ele.
  const [search, setSearch] = useState('')

  // Ao trocar de página, a busca começa vazia.
  useEffect(() => { setSearch('') }, [page])

  if (!user) {
    if (authView === AUTH_VIEWS.CADASTRO) {
      return <Cadastro onGoToLogin={() => setAuthView(AUTH_VIEWS.LOGIN)} />
    }
    return <Login onGoToRegister={() => setAuthView(AUTH_VIEWS.CADASTRO)} />
  }

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'

  const goToTarefas           = (empresa) => { setSelectedEmpresa(empresa); setPage(PAGES.TAREFAS) }
  const goToDashboard         = () => { if (isAdmin) setPage(PAGES.DASHBOARD) }
  const goToDashboardGeral    = () => { if (isAdmin) { setSelectedEmpresa(null); setPage(PAGES.DASHBOARD) } }
  const goToEmpresas          = () => { setPage(PAGES.EMPRESAS); setSelectedEmpresa(null) }
  const goToUsuarios          = () => setPage(PAGES.USUARIOS)
  const goToAnexos            = () => setPage(PAGES.ANEXOS)
  const goToTarefasBack       = () => setPage(PAGES.TAREFAS)
  const goToCadastroUsuario   = () => setPage(PAGES.CADASTRO_USUARIO)

  const handleSidebarNav = (id) => {
    if (id === PAGES.EMPRESAS)  goToEmpresas()
    if (id === PAGES.USUARIOS)  goToUsuarios()
    if (id === PAGES.ANEXOS)    goToAnexos()
    if (id === PAGES.DASHBOARD) goToDashboardGeral()
  }

  const searchPlaceholder =
    page === PAGES.EMPRESAS  ? 'Buscar empresas, boards, pessoas ou informações...' :
    page === PAGES.TAREFAS   ? 'Buscar tarefas ou pessoas...' :
    page === PAGES.USUARIOS  ? 'Buscar usuários...'  :
    page === PAGES.ANEXOS    ? 'Buscar anexos, documentos, empresas ou palavras-chave...' :
    page === PAGES.DASHBOARD ? 'Buscar tarefas, pessoas ou empresas...' : 'Buscar...'

  if (page === PAGES.CADASTRO_USUARIO) {
    return <Cadastro onGoToLogin={goToUsuarios} isInternalAccess />
  }

  return (
    <AppLayout
      activePage={page}
      onNavigate={handleSidebarNav}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder={searchPlaceholder}
    >
      {page === PAGES.EMPRESAS  && <Empresas onEmpresaClick={goToTarefas} search={search} />}
      {page === PAGES.TAREFAS   && <Tarefas empresa={selectedEmpresa} onDashboard={goToDashboard} search={search} />}
      {page === PAGES.DASHBOARD && isAdmin && (
        <Dashboard
          empresaInicial={selectedEmpresa}
          onBack={selectedEmpresa ? goToTarefasBack : null}
          search={search}
        />
      )}
      {page === PAGES.USUARIOS  && <Usuarios onCadastrarNovo={goToCadastroUsuario} search={search} />}
      {page === PAGES.ANEXOS    && <Anexos search={search} />}
    </AppLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
