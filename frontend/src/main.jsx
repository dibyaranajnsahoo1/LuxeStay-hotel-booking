import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { store } from './store/store.js'
import './index.css'

// ── Apply saved theme BEFORE first paint to prevent flash ──
const savedTheme = localStorage.getItem('luxestay_theme')
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches !== false
const useDark = savedTheme ? savedTheme === 'dark' : prefersDark
document.documentElement.classList.add(useDark ? 'dark' : 'light')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '14px',
              boxShadow: 'var(--shadow-hover)',
            },
            success: {
              iconTheme: { primary: 'var(--gold)', secondary: '#0a0a0f' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
