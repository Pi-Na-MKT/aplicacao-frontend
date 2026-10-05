import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Desmonta os componentes e limpa o localStorage para um teste não interferir no outro.
afterEach(() => {
  cleanup()
  localStorage.clear()
})
