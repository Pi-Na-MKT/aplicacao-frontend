import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Spinner from './components/Spinner'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Usuarios from './pages/Usuarios'
import AppLayout from './layouts/AppLayout'
import Empresas from './pages/Empresas'
import Tarefas from './pages/Tarefas'
import Dashboard from './pages/Dashboard'
import Anexos from './pages/Anexos'

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

  const handleEmpresaNavDashboard = (empresa) => { setSelectedEmpresa(empresa); setPage(PAGES.DASHBOARD) }
  const handleEmpresaNavTarefas   = (empresa) => { setSelectedEmpresa(empresa); setPage(PAGES.TAREFAS) }

  const searchPlaceholder =
    page === PAGES.EMPRESAS  ? 'Buscar empresas...'  :
    page === PAGES.TAREFAS   ? 'Buscar tarefas...'   :
    page === PAGES.USUARIOS  ? 'Buscar usuários...'  : 'Buscar...'

  if (page === PAGES.CADASTRO_USUARIO) {
    return <Cadastro onGoToLogin={goToUsuarios} isInternalAccess />
  }

  return (
    <AppLayout
      activePage={page}
      selectedEmpresa={selectedEmpresa}
      onNavigate={handleSidebarNav}
      onEmpresaTarefas={handleEmpresaNavTarefas}
      onEmpresaDashboard={handleEmpresaNavDashboard}
      searchPlaceholder={searchPlaceholder}
    >
      {page === PAGES.EMPRESAS  && <Empresas onEmpresaClick={goToTarefas} />}
      {page === PAGES.TAREFAS   && <Tarefas empresa={selectedEmpresa} onBack={goToEmpresas} onDashboard={goToDashboard} />}
      {page === PAGES.DASHBOARD && isAdmin && (
        <Dashboard
          empresaInicial={selectedEmpresa}
          onBack={selectedEmpresa ? goToTarefasBack : null}
        />
      )}
      {page === PAGES.USUARIOS  && <Usuarios onCadastrarNovo={goToCadastroUsuario} />}
      {page === PAGES.ANEXOS    && <Anexos />}
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
