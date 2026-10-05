import React, { useState } from 'react'
import EmpresaCard from './components/EmpresaCard'
import NewCompanyModal from './components/NewCompanyModal'
import Spinner from '../../shared/components/Spinner'
import { useEmpresas } from './hooks/useEmpresas'

// Tela inicial: saudação e as empresas que o usuário acompanha.
// "search" vem da busca da barra superior (ver app/App.jsx).
export default function Empresas({ onEmpresaClick, search = '' }) {
  const { firstName, filtered, loading, isAdmin, boardCountOf, reload, refresh } = useEmpresas(search)
  const [showModal, setShowModal] = useState(false)

  const handleCreated = () => {
    setShowModal(false)
    reload()
  }

  return (
    <div className="animate-fade-up px-4 pb-10 pt-7 font-poppins lg:px-10">

      <h1 className="text-3xl font-bold text-pina-primary lg:text-[40px] lg:leading-tight">
        {firstName ? `Olá, ${firstName}!` : 'Olá!'}
      </h1>
      <p className="mt-1 text-base text-pina-text-light lg:text-xl">Aqui está um resumo das empresas que você acompanha.</p>

      <div className="mb-4 mt-12 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-pina-primary">Empresas</h2>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex h-10 items-center gap-2 rounded-button bg-pina-secondary px-4 text-sm font-semibold text-white transition duration-base ease-base hover:brightness-95 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40 focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Nova empresa
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Spinner className="text-pina-secondary"/>
        </div>
      )}

      {!loading && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map(empresa => (
            <li key={empresa.id}>
              <EmpresaCard
                empresa={empresa}
                boardCount={boardCountOf(empresa.id)}
                onClick={onEmpresaClick}
                onCalendarLinked={() => refresh()}
              />
            </li>
          ))}
        </ul>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-card border border-pina-border bg-pina-surface p-16 text-center shadow-card">
          <p className="text-sm text-pina-text-light">
            {search.trim() ? 'Nenhuma empresa encontrada.' : 'Nenhuma empresa cadastrada ainda.'}
          </p>
        </div>
      )}

      {showModal && <NewCompanyModal onClose={() => setShowModal(false)} onCreated={handleCreated}/>}
    </div>
  )
}
