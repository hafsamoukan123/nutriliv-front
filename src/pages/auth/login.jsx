import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, LogIn, UserPlus, Salad } from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function Login() {
  const { register, handleSubmit } = useForm()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/login', data)
      setAuth(res.data.user, res.data.token)
      const role = res.data.user.role
      if (role === 'client')  navigate('/')
      if (role === 'vendeur') navigate('/vendeur')
      if (role === 'livreur') navigate('/livreur')
      if (role === 'admin')   navigate('/admin')
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '72px', height: '72px', background: 'var(--primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem' }}>
            🥗
          </div>
          <h1 style={{ color: 'var(--primary-dark)', fontSize: '1.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Salad size={24} /> NutriLiv
          </h1>
          <p style={{ color: '#5EBC8E', fontSize: '0.9rem', marginTop: '4px' }}>Mangez sain, vivez bien</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 24px rgba(58,155,111,0.1)' }}>
          <h2 style={{ color: 'var(--primary-dark)', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogIn size={18} /> Connexion
          </h2>

          {error && (
            <div style={{ background: '#FFF0F0', color: '#C0392B', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--primary-dark)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} /> Email
              </label>
              <input
                {...register('email', { required: true })}
                type="email"
                placeholder="email@example.com"
                style={{ width: '100%', border: '1.5px solid var(--primary-light)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.9rem', outline: 'none', background: '#F4FBF7', color: 'var(--primary-dark)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--primary-dark)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={14} /> Mot de passe
              </label>
              <input
                {...register('password', { required: true })}
                type="password"
                placeholder="••••••••"
                style={{ width: '100%', border: '1.5px solid var(--primary-light)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.9rem', outline: 'none', background: '#F4FBF7', color: 'var(--primary-dark)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? '#5EBC8E' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.875rem', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {loading ? <Lock size={16} /> : <LogIn size={16} />}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#888', marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            Pas de compte ?
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserPlus size={14} /> S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}