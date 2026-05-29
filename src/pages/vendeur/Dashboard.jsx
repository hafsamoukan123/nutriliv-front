import { useQuery } from '@tanstack/react-query'
import { useState } from 'react' 
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Salad, ShoppingCart, LogOut, Store, Clock, TrendingUp, Wallet, PlusCircle, Eye ,DollarSign  } from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import NotificationBell from '../../components/NotificationBell'

const Sidebar = ({ active }) => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = async () => {
    await api.post('/logout')
    logout()
    navigate('/login')
  }
  return (
    <aside style={{ width: '220px', minHeight: '100vh', background: 'var(--primary-dark)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🥗</div>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>NutriLiv</span>
      </div>
      <div style={{ padding: '0 0.5rem', marginBottom: '0.5rem' }}>
       <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Notifications</span>
          <NotificationBell />
       </div>
      </div>

      {[
        { to: '/vendeur', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/vendeur/products', icon: <Salad size={18} />, label: 'Mes plats' },
        { to: '/vendeur/orders', icon: <ShoppingCart size={18} />, label: 'Commandes' },
      ].map(item => (
        <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', textDecoration: 'none', background: active === item.to ? 'rgba(255,255,255,0.15)' : 'transparent', color: active === item.to ? 'white' : 'rgba(255,255,255,0.7)', fontWeight: active === item.to ? '600' : '400', fontSize: '0.9rem', transition: 'all 0.2s' }}>
          {item.icon}{item.label}
        </Link>
      ))}
      <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', cursor: 'pointer', marginTop: 'auto', textAlign: 'left' }}>
        <LogOut size={18} /> Déconnexion
      </button>
    </aside>
  )
}

export default function VendeurDashboard() {
  const { user } = useAuthStore()

  const { data: stats } = useQuery({
    queryKey: ['vendeur-dashboard'],
    queryFn: () => api.get('/vendeur/dashboard').then(r => r.data)
  })

  // ✅ Query pour les commandes (pour le graphique)
  const { data: ordersData } = useQuery({
    queryKey: ['vendeur-orders-chart'],
    queryFn: () => api.get('/vendeur/orders').then(r => r.data)
  })

  // ✅ Données pour le graphique
  const chartData = ordersData?.data?.slice(0, 7).reverse().map(o => ({
    date: new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    montant: parseFloat(o.total_amount),
    statut: o.status
  })) || []
  // أضف هذا الـ state
  const [transferAmount, setTransferAmount] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)

  const requestTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) return alert('Montant invalide')
    if (parseFloat(transferAmount) > parseFloat(stats?.balance || 0)) return alert('Solde insuffisant')
    setTransferLoading(true)
    try {
      await api.post('/vendeur/transfer', { amount: transferAmount })
      alert('Demande de virement envoyée ✓')
      setTransferAmount('')
    } catch {
      alert('Erreur lors de la demande')
    } finally {
      setTransferLoading(false)
  }
}
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar active="/vendeur" />
      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-dark)', fontSize: '1.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Bonjour, {user?.name} <Salad size={20} />
          </h1>
          <p style={{ color: '#888', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Store size={14} /> {user?.shop_name}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total commandes', value: stats?.total_orders ?? '...', icon: <ShoppingCart size={28} />, color: '#EBF5FB', text: '#2980B9' },
            { label: 'Revenus livrés', value: stats?.total_revenue ? `${stats.total_revenue} DH` : '0 DH', icon: <TrendingUp size={28} />, color: '#EAFAF1', text: '#27AE60' },
            { label: 'En attente', value: stats?.pending_orders ?? '...', icon: <Clock size={28} />, color: '#FEF9EC', text: '#F39C12' },
            { label: 'Mon solde', value: stats?.balance ? `${stats.balance} DH` : '0 DH', icon: <Wallet size={28} />, color: '#F5EEF8', text: '#8E44AD' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.color, borderRadius: '20px', padding: '1.5rem' }}>
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {s.icon}
              </div>
              <p style={{ color: s.text, fontSize: '1.75rem', fontWeight: '700' }}>{s.value}</p>
              <p style={{ color: s.text, fontSize: '0.85rem', marginTop: '4px', opacity: 0.8 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Graphique des commandes récentes */}
        {chartData.length > 0 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
            <h2 style={{ color: 'var(--primary-dark)', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} /> Évolution des commandes
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line type="monotone" dataKey="montant" stroke="var(--primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Link to="/vendeur/products" style={{ background: 'white', borderRadius: '20px', padding: '2rem', textAlign: 'center', textDecoration: 'none', boxShadow: '0 2px 12px rgba(58,155,111,0.08)', display: 'block' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlusCircle size={48} color="var(--primary)" />
            </div>
            <p style={{ color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1.1rem' }}>Gérer mes plats</p>
            <p style={{ color: '#888', fontSize: '0.875rem', marginTop: '4px' }}>Ajouter, modifier, supprimer</p>
          </Link>
          <Link to="/vendeur/orders" style={{ background: 'white', borderRadius: '20px', padding: '2rem', textAlign: 'center', textDecoration: 'none', boxShadow: '0 2px 12px rgba(58,155,111,0.08)', display: 'block' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={48} color="var(--primary)" />
            </div>
            <p style={{ color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1.1rem' }}>Voir commandes</p>
            <p style={{ color: '#888', fontSize: '0.875rem', marginTop: '4px' }}>Gérer et confirmer</p>
          </Link>
        </div>
        {/* Charts */}
         {chartData.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

         {/* Revenue Chart */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
             <TrendingUp size={20} color="var(--primary)" />
             <h3 style={{ color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1rem' }}>Revenus récents</h3>
           </div>
           <ResponsiveContainer width="100%" height={180}>
             <LineChart data={chartData}>
                 <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
                 <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                 <Line type="monotone" dataKey="montant" stroke="#3A9B6F" strokeWidth={2.5} dot={{ fill: '#3A9B6F', r: 4 }} />
             </LineChart>
           </ResponsiveContainer>
         </div>

    {/* Orders Bar Chart */}
    <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <BarChart size={20} color="var(--primary)" />
        <h3 style={{ color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1rem' }}>Commandes par jour</h3>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData}>
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
          <YAxis tick={{ fontSize: 11, fill: '#888' }} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <Bar dataKey="montant" fill="#3A9B6F" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
)}
  {/* Transfer Card */}
<div style={{ marginTop: '1.5rem', background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
    <Wallet size={20} color="var(--primary)" />
    <h3 style={{ color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1rem' }}>Demander un virement</h3>
  </div>
  <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1rem' }}>
    Solde disponible: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{stats?.balance || 0} DH</span>
  </p>
  <div style={{ display: 'flex', gap: '0.75rem' }}>
    <input
      type="number"
      value={transferAmount}
      onChange={e => setTransferAmount(e.target.value)}
      placeholder="Montant à retirer (DH)"
      style={{ flex: 1, border: '1.5px solid var(--primary-light)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.9rem', outline: 'none', background: 'var(--bg)', color: 'var(--primary-dark)' }}
    />
    <button
      onClick={requestTransfer}
      disabled={transferLoading}
      style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
    >
      <DollarSign size={18} /> {transferLoading ? '...' : 'Demander'}
    </button>
  </div>
</div>


      </main>
    </div>
  )
}