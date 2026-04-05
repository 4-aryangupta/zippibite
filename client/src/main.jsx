import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Set BEFORE React renders — prevents main.js initCursor() from
// running its own GSAP loop before CustomCursor's useEffect fires.
window.__reactCursorActive = true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
