import React from 'react'
import PinaLogo from '../../../shared/components/PinaLogo'

const DESTAQUES = [
  {
    texto: 'Organize seu time',
    icone: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
  {
    texto: 'Acompanhe resultados',
    icone: 'M3 3v16.5A1.5 1.5 0 004.5 21H21M7.5 16.5v-3m4 3v-6m4 6V12M7 10l3.5-3.5 3 3L20 3.5m0 0h-4m4 0v4',
  },
  {
    texto: 'Mais controle e segurança',
    icone: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  },
]

// Painel de apresentação da marca. Aparece somente em telas grandes.
export default function LoginBranding() {
  return (
    <aside className="relative hidden lg:flex lg:w-[40%] flex-col justify-center bg-pina-primary pb-32 pl-[7%] pr-10 text-white">

      {/* Formas decorativas do fundo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pina-secondary/15 via-transparent to-transparent" />
        <div className="absolute -right-20 -top-44 h-64 w-64 rounded-full bg-pina-highlight" />
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 611 300" preserveAspectRatio="xMinYMax meet">
          <path d="M0 5c40 15 85 55 92 110-32 15-67 25-92 35z" fill="#6366F1" opacity=".55" />
          <path d="M0 150c50-30 110-30 160-10 100 40 200 110 280 160H0z" fill="#6366F1" opacity=".6" />
          <path d="M150 138c60 22 110 72 140 162h60c-30-85-100-150-175-165z" fill="#FACC15" />
        </svg>
      </div>

      <div className="relative">
        <PinaLogo variant="onDark" size="lg" />

        <p className="mt-12 text-[26px] leading-snug">
          Conectando empresas e talentos.<br />
          Mais <span className="font-medium text-pina-highlight">produtividade</span> para todos.
        </p>

        <div className="mt-8 h-1 w-14 rounded-full bg-pina-highlight" />

        <ul className="mt-12 flex flex-col gap-6">
          {DESTAQUES.map(({ texto, icone }) => (
            <li key={texto} className="flex items-center gap-6 text-base text-slate-200">
              <svg className="h-8 w-8 flex-shrink-0 text-pina-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={icone} />
              </svg>
              {texto}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
