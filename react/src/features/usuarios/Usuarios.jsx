import React from 'react'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import Spinner from '../../shared/components/Spinner'
import AvatarNeutro from '../../shared/components/AvatarNeutro'
import ListaUsuarios from './components/ListaUsuarios'
import ModalEditar from './components/ModalEditar'
import { useUsuarios } from './hooks/useUsuarios'

const ICON_USER  = 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
const ICON_USERS = 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'

// Aparência de cada indicador do topo da tela.
const INDICADORES = {
  total:  { label: 'Total',  icon: ICON_USER,  card: 'border-pina-secondary/15 bg-pina-secondary/5', badge: 'bg-pina-secondary/10 text-pina-secondary', texto: 'text-pina-primary', valor: 'text-pina-secondary' },
  ativos: { label: 'Ativos', icon: ICON_USERS, card: 'border-pina-success/20 bg-pina-success/5',     badge: 'bg-pina-success/15 text-emerald-600',      texto: 'text-emerald-700', valor: 'text-emerald-600' },
}

function Indicador({ tipo, valor }) {
  const { label, icon, card, badge, texto, valor: corValor } = INDICADORES[tipo]
  return (
    <div className={`flex items-center gap-4 rounded-card border px-6 py-5 ${card}`}>
      <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${badge}`}>
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </span>
      <span className={`text-lg font-medium ${texto}`}>{label}</span>
      <span className={`ml-auto text-3xl font-bold ${corValor}`}>{valor}</span>
    </div>
  )
}

// "search" vem da busca da barra superior (ver app/App.jsx).
export default function Usuarios({ onCadastrarNovo, search = '' }) {
  const {
    lista, filtrados, busca, setBusca, carregando,
    isAdmin, isOwnRow,
    editandoId, setEditandoId, usuarioEditando, salvarUsuario,
    confirmDel, setConfirmDel, erroDelete, excluindo, cancelarExclusao, confirmarExclusao,
  } = useUsuarios(search)

  return (
    <div className="animate-fade-up px-4 pb-10 pt-8 font-poppins lg:px-12">

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-pina-text-light">Gestão de usuários</p>
          <h1 className="text-3xl font-bold text-pina-primary lg:text-4xl">Usuários</h1>
          <p className="mt-1 text-base text-pina-text-light lg:text-lg">{lista.length} membro{lista.length !== 1 ? 's' : ''} ativo{lista.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={onCadastrarNovo}
            className="flex h-[52px] items-center gap-3 self-start rounded-button bg-pina-secondary px-6 text-base font-medium text-white shadow-card transition duration-base ease-base hover:brightness-95 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pina-secondary/40 focus-visible:ring-offset-2 sm:self-auto"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Novo usuário
          </button>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Indicador tipo="total"  valor={lista.length} />
        <Indicador tipo="ativos" valor={lista.length} />
      </div>

      <div className="mb-6 rounded-card border border-pina-border bg-pina-surface p-4 shadow-card">
        <div className="relative">
          <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pina-text-light" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou cargo..."
            aria-label="Buscar por nome ou cargo"
            className="h-12 w-full rounded-input border border-pina-border bg-pina-background pl-12 pr-4 text-base text-pina-primary outline-none transition duration-base ease-base placeholder:text-pina-text-light focus:border-pina-secondary focus:bg-pina-surface focus:ring-2 focus:ring-pina-secondary/20"/>
        </div>
      </div>

      {carregando ? (
        <div className="rounded-card border border-pina-border bg-pina-surface p-12 text-center shadow-card">
          <Spinner className="mx-auto mb-3 text-pina-secondary"/>
          <p className="text-sm text-pina-text-light">Carregando usuários...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center rounded-card border border-pina-border bg-pina-surface p-16 text-center shadow-card">
          <AvatarNeutro className="h-12 w-12"/>
          <p className="mt-3 text-sm font-medium text-pina-text">Nenhum usuário encontrado</p>
          <p className="mt-1 text-xs text-pina-text-light">Tente ajustar a busca</p>
        </div>
      ) : (
        <ListaUsuarios
          usuarios={filtrados}
          isAdmin={isAdmin}
          isOwnRow={isOwnRow}
          onEditar={(u) => setEditandoId(u.id)}
          onExcluir={setConfirmDel}
        />
      )}

      {editandoId && usuarioEditando && (
        <ModalEditar
          usuarioId={editandoId}
          usuarioInicial={usuarioEditando}
          isAdmin={isAdmin}
          onSalvar={salvarUsuario}
          onFechar={() => setEditandoId(null)}
        />
      )}

      {confirmDel && (
        <ConfirmDialog
          title="Excluir usuário?"
          description={
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">
                "<span className="font-semibold">{confirmDel.nome || confirmDel.name}</span>" será desativado permanentemente.
              </p>
              {erroDelete && <p className="text-xs text-red-500 bg-red-50 rounded-lg py-2 px-3">{erroDelete}</p>}
            </div>
          }
          loading={excluindo}
          onCancel={cancelarExclusao}
          onConfirm={confirmarExclusao}
        />
      )}
    </div>
  )
}
