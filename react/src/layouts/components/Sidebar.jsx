import React from 'react'
import PinaLogo from '../../shared/components/PinaLogo'
import UserMenu from './UserMenu'

// Itens do menu. "id" é o identificador da página usado em app/App.jsx.
// "paginas" lista as páginas em que o item aparece como ativo.
const NAV_ITEMS = [
  {
    id: 'empresas', label: 'Início', paginas: ['empresas', 'tarefas'],
    icon: 'M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75',
  },
  {
    id: 'dashboard', label: 'Dashboards', paginas: ['dashboard'], adminOnly: true,
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
  {
    id: 'usuarios', label: 'Usuários', paginas: ['usuarios'], adminOnly: true,
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
  {
    id: 'anexos', label: 'Anexos', paginas: ['anexos'],
    icon: 'M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13',
  },
]

export default function Sidebar({ open, activePage, isAdmin, perfil, onNavigate, onLogout }) {
  const itens = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col bg-pina-primary font-poppins transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex-shrink-0 px-7 pb-6 pt-6">
        <PinaLogo variant="onDark" size="sm" label="Pina" />
      </div>

      <nav aria-label="Menu principal" className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4">
        {itens.map(item => {
          const ativo = item.paginas.includes(activePage)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={ativo ? 'page' : undefined}
              className={`flex h-[52px] w-full flex-shrink-0 items-center gap-5 rounded-lg px-4 text-left text-[17px] transition duration-base ease-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-accent ${
                ativo ? 'bg-pina-active font-medium text-white shadow-card' : 'text-slate-100 hover:bg-white/10'
              }`}
            >
              <svg className="h-7 w-7 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="flex-shrink-0 border-t border-white/10 p-3">
        <UserMenu variant="sidebar" perfil={perfil} onLogout={onLogout} />
      </div>
    </aside>
  )
}
