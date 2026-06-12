import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { LanguageProvider } from './i18n'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LanguageProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: '0.875rem' },
          success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
