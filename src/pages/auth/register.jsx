import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, Lock, UserCheck, Building, Bike, Car, Bike as BikeIcon, LogIn, Salad } from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function Register() {
  const { register, handleSubmit, watch } = useForm()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const role = watch('role')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/register', data)
      setAuth(res.data.user, res.data.token)
      const r = res.data.user.role
      if (r === 'client')  navigate('/')
      if (r === 'vendeur') navigate('/vendeur')
      if (r === 'livreur') navigate('/livreur')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', border: '1.5px solid var(--primary-light)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.9rem', outline: 'none', background: '#F4FBF7', color: 'var(--primary-dark)' }
  const labelStyle = { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-dark)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '6px' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontSize: '1.75rem' }}>
            🥗
          </div>
          <h1 style={{ color: 'var(--primary-dark)', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Salad size={20} /> NutriLiv
          </h1>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 24px rgba(58,155,111,0.1)' }}>
          <h2 style={{ color: 'var(--primary-dark)', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Créer un compte</h2>

          {error && (
            <div style={{ background: '#FFF0F0', color: '#C0392B', padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}><User size={14} /> Nom complet</label>
              <input {...register('name', { required: true })} placeholder="Votre nom" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><Mail size={14} /> Email</label>
              <input {...register('email', { required: true })} type="email" placeholder="email@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><Phone size={14} /> Téléphone</label>
              <input {...register('phone', { required: true })} placeholder="06xxxxxxxx" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><Lock size={14} /> Mot de passe</label>
              <input {...register('password', { required: true })} type="password" placeholder="••••••••" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><Lock size={14} /> Confirmer mot de passe</label>
              <input {...register('password_confirmation', { required: true })} type="password" placeholder="••••••••" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><UserCheck size={14} /> Je suis</label>
              <select {...register('role', { required: true })} style={inputStyle}>
                <option value="">Choisir...</option>
                <option value="client">Client</option>
                <option value="vendeur">Restaurant / Vendeur</option>
                <option value="livreur">Livreur</option>
              </select>
            </div>
            {role === 'vendeur' && (
              <div>
                <label style={labelStyle}><Building size={14} /> Nom du restaurant</label>
                <input {...register('shop_name')} placeholder="Mon restaurant" style={inputStyle} />
              </div>
            )}
            {role === 'livreur' && (
              <div>
                <label style={labelStyle}><Bike size={14} /> Type de véhicule</label>
                <select {...register('vehicle_type')} style={inputStyle}>
                  <option value="">Choisir...</option>
                  <option value="moto">Moto</option>
                  <option value="voiture">Voiture</option>
                  <option value="vélo">Vélo</option>
                </select>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? '#5EBC8E' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.875rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {loading ? <Lock size={16} /> : <UserCheck size={16} />}
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#888', marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            Déjà un compte ?
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LogIn size={14} /> Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}