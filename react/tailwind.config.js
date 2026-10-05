/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores antigas. Continuam aqui porque as telas que ainda não passaram
        // pelo redesign dependem delas. Remover quando todas forem migradas.
        primary: '#5B4FE8',
        'primary-dark': '#4840C8',
        'primary-light': '#EEF0FF',

        // Design system do redesign (context_redesign.md).
        // Uso: bg-pina-secondary, text-pina-text, border-pina-border...
        pina: {
          primary:      '#0F172A',
          secondary:    '#6366F1',
          accent:       '#A78BFA',
          highlight:    '#FACC15',
          success:      '#22C55E',
          warning:      '#F59E0B',
          danger:       '#EF4444',
          background:   '#F8FAFC',
          surface:      '#FFFFFF',
          text:         '#334155',
          'text-light': '#64748B',
          border:       '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        // Fonte do redesign. Uso: font-poppins na raiz da tela.
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
      },
      // Uso: rounded-card, rounded-input, rounded-button, rounded-modal.
      borderRadius: {
        card:   '16px',
        input:  '12px',
        button: '12px',
        modal:  '20px',
      },
      // Uso: shadow-card e hover:shadow-card-hover.
      boxShadow: {
        card:         '0 4px 16px rgba(15,23,42,.06)',
        'card-hover': '0 10px 30px rgba(15,23,42,.10)',
      },
      // Degradê do item ativo do menu lateral. Uso: bg-pina-active.
      backgroundImage: {
        'pina-active': 'linear-gradient(90deg, #6366F1, #8B5CF6)',
      },
      // Transição padrão de 200ms ease. Uso: transition duration-base ease-base.
      transitionDuration: {
        base: '200ms',
      },
      transitionTimingFunction: {
        base: 'ease',
      },
    },
  },
  plugins: [],
}
