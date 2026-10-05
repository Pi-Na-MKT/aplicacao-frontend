import { useEffect } from 'react'

// Chama onClose quando o usuário clica fora do elemento apontado por "ref"
// ou pressiona Esc. Só fica ativo enquanto "ativo" for true.
// Uso típico: fechar um menu suspenso.
export function useClickOutside(ref, ativo, onClose) {
  useEffect(() => {
    if (!ativo) return
    const onMouseDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const onKeyDown   = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [ativo])
}
