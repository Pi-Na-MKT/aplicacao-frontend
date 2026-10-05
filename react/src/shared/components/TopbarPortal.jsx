import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { TOPBAR_SLOT_ID } from '../constants/layout'

// Desenha o conteúdo dentro do espaço reservado na barra superior, em vez de no
// lugar onde o componente foi escrito. Assim uma página coloca um controle seu
// (como o seletor de empresa do Dashboard) na barra, sem a barra conhecer a página.
// Se o espaço não existir (por exemplo, em um teste da página isolada), não desenha nada.
export default function TopbarPortal({ children }) {
  const [slot, setSlot] = useState(null)

  // O elemento só pode ser procurado depois que a barra superior já está na tela.
  useEffect(() => {
    setSlot(document.getElementById(TOPBAR_SLOT_ID))
  }, [])

  return slot ? createPortal(children, slot) : null
}
