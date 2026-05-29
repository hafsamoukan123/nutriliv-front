import { useState } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const show = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  const remove = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { 
    toasts, 
    success: (msg) => show(msg, 'success'), 
    error: (msg) => show(msg, 'error'),
    info: (msg) => show(msg, 'info'),
    remove
  }
}

export default function ToastContainer({ toasts, remove }) {
  if (!toasts || toasts.length === 0) return null

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={20} />
      case 'error': return <XCircle size={20} />
      default: return <Info size={20} />
    }
  }

  const getStyle = (type) => {
    switch(type) {
      case 'success': return { background: '#10B981' }
      case 'error': return { background: '#EF4444' }
      default: return { background: '#3B82F6' }
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ ...getStyle(t.type), padding: '12px 20px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', animation: 'slideIn 0.3s ease' }}>
          {getIcon(t.type)}
          <span>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}