import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Salad } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', animation: 'fadeIn 0.5s ease' }} className="animate-fadeIn">
        <div style={{ width: '100px', height: '100px', background: 'var(--gradient-btn)', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: 'var(--shadow-lg)' }}>
          <Salad size={48} color="white" />
        </div>
        <h1 style={{ fontSize: '6rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1, marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '0.75rem' }}>Page introuvable</h2>
        <p style={{ color: 'var(--gray-400)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Oups! La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <ArrowLeft size={18} /> Retour
          </button>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            <Home size={18} /> Accueil
          </button>
        </div>
      </div>
    </div>
  )
}