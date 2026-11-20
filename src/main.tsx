import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '@fontsource-variable/geist'
import '@fontsource/bricolage-grotesque/latin-600.css'
import '@fontsource/bricolage-grotesque/latin-ext-600.css'
import '@fontsource/bricolage-grotesque/latin-700.css'
import '@fontsource/bricolage-grotesque/latin-ext-700.css'
import './index.css'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
