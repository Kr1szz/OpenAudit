import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { globalStyles } from './styles/global.ts'

const styleId = 'open-audit-global-styles'
if (!document.getElementById(styleId)) {
  const styleTag = document.createElement('style')
  styleTag.id = styleId
  styleTag.textContent = globalStyles
  document.head.appendChild(styleTag)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
