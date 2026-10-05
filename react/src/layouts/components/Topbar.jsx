import React from 'react'
import UserMenu from './UserMenu'
import { TOPBAR_SLOT_ID } from '../../shared/constants/layout'

export default function Topbar({ search, onSearchChange, searchPlaceholder, perfil, onLogout, onOpenSidebar }) {
  return (
    <header className="z-20 flex h-20 flex-shrink-0 items-center gap-4 border-b border-pina-border bg-pina-background px-4 font-poppins lg:h-[98px] lg:px-9">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Abrir menu"
        className="rounded-lg p-2 text-pina-primary transition duration-base ease-base hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40 lg:hidden"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Espaço que a página atual pode preencher (ver shared/components/TopbarPortal.jsx).
          Só aparece em telas grandes e quando há conteúdo. */}
      <div id={TOPBAR_SLOT_ID} className="hidden flex-shrink-0 lg:block lg:empty:hidden" />

      <div className="relative w-full max-w-[602px]">
        <svg className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-pina-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m2.2-5.3a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={e => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Buscar"
          className="h-[52px] w-full rounded-input border border-pina-border bg-pina-surface pl-14 pr-4 text-[15px] text-pina-primary shadow-sm outline-none transition duration-base ease-base placeholder:text-pina-text-light focus:border-pina-secondary focus:ring-2 focus:ring-pina-secondary/20"
        />
      </div>

      <div className="ml-auto flex-shrink-0">
        <UserMenu variant="topbar" perfil={perfil} onLogout={onLogout} />
      </div>
    </header>
  )
}
