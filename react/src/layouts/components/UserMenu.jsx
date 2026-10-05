import React, { useState, useRef } from 'react'
import AvatarNeutro from '../../shared/components/AvatarNeutro'
import { useClickOutside } from '../../shared/hooks/useClickOutside'

function Avatar({ src, className }) {
  if (src) return <img src={src} className={`${className} flex-shrink-0 rounded-full object-cover`} alt="" />
  return <AvatarNeutro className={className} />
}

// Botão com o avatar do usuário que abre o menu com a opção de sair.
// variant "sidebar": mostra nome e cargo, e o menu abre para cima.
// variant "topbar": mostra só o avatar, e o menu abre para baixo.
export default function UserMenu({ perfil, onLogout, variant = 'topbar' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const isSidebar = variant === 'sidebar'

  useClickOutside(ref, open, () => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={isSidebar ? undefined : 'Menu do usuário'}
        className={
          isSidebar
            ? 'flex w-full items-center gap-4 rounded-lg px-2 py-2 text-left transition duration-base ease-base hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-accent'
            : 'flex items-center gap-3 rounded-full p-1 pr-2 transition duration-base ease-base hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40'
        }
      >
        <Avatar src={perfil.avatarUrl} className="h-[52px] w-[52px]" />
        {isSidebar && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold text-white">{perfil.nomeCurto}</span>
            <span className="block truncate text-[13px] text-slate-300">{perfil.cargo}</span>
          </span>
        )}
        <svg className={`h-4 w-4 flex-shrink-0 ${isSidebar ? 'text-slate-300' : 'text-pina-primary'}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 w-56 rounded-card border border-pina-border bg-pina-surface py-2 shadow-card-hover ${
            isSidebar ? 'bottom-full left-0 mb-2' : 'right-0 top-full mt-2'
          }`}
        >
          <div className="mb-1 border-b border-pina-border px-4 pb-2 pt-1">
            <p className="truncate text-sm font-semibold text-pina-primary">{perfil.nome}</p>
            <p className="truncate text-xs text-pina-text-light">{perfil.cargo}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onLogout() }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-pina-danger transition duration-base ease-base hover:bg-pina-danger/5 focus-visible:bg-pina-danger/5 focus-visible:outline-none"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair da conta
          </button>
        </div>
      )}
    </div>
  )
}
