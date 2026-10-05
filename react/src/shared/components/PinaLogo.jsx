import React, { useId } from 'react'

// Cores do abacaxi e do nome conforme o fundo em que o logo aparece.
const VARIANTS = {
  onDark:  { body: '#6366F1', lattice: '#0F172A', text: 'text-white' },
  onLight: { body: '#0F172A', lattice: '#FFFFFF', text: 'text-pina-primary' },
}

const SIZES = {
  sm: { icon: 'h-[52px]', text: 'text-[30px]', gap: 'gap-3' },
  md: { icon: 'h-[60px]', text: 'text-[34px]', gap: 'gap-3' },
  lg: { icon: 'h-[94px]', text: 'text-[52px]', gap: 'gap-5' },
}

export default function PinaLogo({ variant = 'onLight', size = 'md', label = 'PINA', className = '' }) {
  // Cada logo na página precisa de um id próprio para o recorte das linhas.
  const clipId = `pina-logo-${useId().replace(/:/g, '')}`
  const cores = VARIANTS[variant]
  const medidas = SIZES[size]

  return (
    <div className={`flex items-center ${medidas.gap} ${className}`}>
      <svg className={`${medidas.icon} w-auto flex-shrink-0`} viewBox="0 0 40 56" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <ellipse cx="20" cy="38" rx="13" ry="16" />
          </clipPath>
        </defs>

        {/* Coroa */}
        <g fill="#FACC15">
          <path d="M20 1c3 7 3 14 0 21-3-7-3-14 0-21z" />
          <path d="M20 22c-6-3-10-8-11-14 6 2 10 7 11 14z" />
          <path d="M20 22c6-3 10-8 11-14-6 2-10 7-11 14z" />
          <path d="M20 23c-6 0-11-3-14-8 6 0 11 3 14 8z" />
          <path d="M20 23c6 0 11-3 14-8-6 0-11 3-14 8z" />
        </g>

        {/* Corpo com as linhas cruzadas */}
        <ellipse cx="20" cy="38" rx="13" ry="16" fill={cores.body} />
        <g clipPath={`url(#${clipId})`} stroke={cores.lattice} strokeWidth="1.5" strokeLinecap="round" fill="none">
          <path d="M-2 30l24 24M4 22l30 30M14 18l26 26" />
          <path d="M42 30L18 54M36 22L6 52M26 18L0 44" />
        </g>
      </svg>
      <span className={`font-bold leading-none tracking-wide ${medidas.text} ${cores.text}`}>{label}</span>
    </div>
  )
}
