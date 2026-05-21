import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initNativeShell } from './lib/native'

// Hide splash + tint status bar on iOS (no-op on web)
void initNativeShell()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
