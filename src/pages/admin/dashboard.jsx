import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ShoppingCart, Users, CreditCard, LogOut, Salad, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, Building, Phone, Mail, User, Calendar, Package, Truck, Wallet, Eye, BarChart } from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import ToastContainer, { useToast } from '../../components/Toast'

const STATUS_STYLE = {
  pending:    { color: '#F39C12', bg: '#FEF9EC', icon: Clock },
  confirmed:  { color: '#2980B9', bg: '#EBF5FB', icon: CheckCircle },
  preparing:  { color: '#E67E22', bg: '#FEF0E6', icon: Package },
  ready:      { color: '#8E44AD', bg: '#F5EEF8', icon: CheckCircle },
  picked_up:  { color: '#1A5276', bg: '#EAF2FF', icon: Truck },
  delivering: { color: '#117A65', bg: '#E8F8F5', icon: Truck },
  delivered:  { color: '#27AE60', bg: '#EAFAF1', icon: CheckCircle },
  cancelled:  { color: '#E74C3C', bg: '#FDEDEC', icon: XCircle },
}

const ROLE_STYLE = {
  admin:   { color: '#E74C3C', bg: '#FDEDEC', icon: User },
  vendeur: { color: '#2980B9', bg: '#EBF5FB', icon: Building },
  livreur: { color: '#8E44AD', bg: '#F5EEF8', icon: Truck },
  client:  { color: '#27AE60', bg: '#EAFAF1', icon: User },
}

export default function AdminDashboard() {
  const { logout } = useAuthStore()
  const { toasts, success, error } = useToast()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('analytics')

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics').then(r => r.data)
  })
  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/admin/orders').then(r => r.data),
    enabled: tab === 'orders'
  })
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
    enabled: tab === 'users'
  })
  const { data: transfersData } = useQuery({
    queryKey: ['admin-transfers'],
    queryFn: () => api.get('/admin/transactions').then(r => r.data),
    enabled: tab === 'transfers'
  })

  const processTransfer = useMutation({
    mutationFn: ({ id, status }) => api.put(`/admin/transactions/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-transfers'])
      success('Virement traité avec succès')
    },
    onError: () => error('Erreur lors du traitement')
  })

  const handleLogout = async () => { await api.post('/logout'); logout(); window.location.href = '/login' }

  const tabs = [
    { id: 'analytics', icon: <BarChart size={18} />, label: 'Analytics' },
    { id: 'orders',    icon: <ShoppingCart size={18} />, label: 'Commandes' },
    { id: 'users',     icon: <Users size={18} />, label: 'Utilisateurs' },
    { id: 'transfers', icon: <Wallet size={18} />, label: 'Virements' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{ width: '220px', minHeight: '100vh', background: 'var(--primary-dark)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🥗</div>
          <div>
            <p style={{ color: 'white', fontWeight: '700', fontSize: '1rem', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Salad size={14} /> NutriLiv
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Admin</p>
          </div>
        </div>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', background: tab === t.id ? 'rgba(255,255,255,0.15)' : 'transparent', color: tab === t.id ? 'white' : 'rgba(255,255,255,0.7)', fontWeight: tab === t.id ? '600' : '400', fontSize: '0.9rem', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            {t.icon}{t.label}
          </button>
        ))}
        <button onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', cursor: 'pointer', marginTop: 'auto', textAlign: 'left' }}>
          <LogOut size={18} /> Déconnexion
        </button>
      </aside>

      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {tab === 'analytics' && (
          <div>
            <h1 style={{ color: 'var(--primary-dark)', fontSize: '1.75rem', fontWeight: '700', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart size={24} /> Vue d'ensemble
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Utilisateurs',    value: analytics?.total_users,       icon: <Users size={28} />, color: '#EBF5FB', text: '#2980B9' },
                { label: 'Commandes',       value: analytics?.total_orders,      icon: <ShoppingCart size={28} />, color: '#F5EEF8', text: '#8E44AD' },
                { label: 'Revenus totaux',  value: analytics?.total_revenue ? `${analytics.total_revenue} DH` : '0 DH', icon: <DollarSign size={28} />, color: '#EAFAF1', text: '#27AE60' },
                { label: 'Commissions',     value: analytics?.total_commission ? `${analytics.total_commission} DH` : '0 DH', icon: <TrendingUp size={28} />, color: '#FEF9EC', text: '#F39C12' },
              ].map((s, i) => (
                <div key={i} style={{ background: s.color, borderRadius: '20px', padding: '1.5rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>{s.icon}</div>
                  <p style={{ color: s.text, fontSize: '1.75rem', fontWeight: '700' }}>{s.value ?? '...'}</p>
                  <p style={{ color: s.text, fontSize: '0.85rem', marginTop: '4px', opacity: 0.8 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
              <h2 style={{ color: 'var(--primary-dark)', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={18} /> Commandes par statut
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {analytics?.orders_by_status?.map(item => {
                  const s = STATUS_STYLE[item.status] || { color: '#888', bg: '#f5f5f5' }
                  const Icon = s.icon
                  return (
                    <div key={item.status} style={{ background: s.bg, borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                      <p style={{ color: s.color, fontSize: '1.75rem', fontWeight: '700' }}>{item.count}</p>
                      <p style={{ color: s.color, fontSize: '0.8rem', marginTop: '4px', opacity: 0.85, textTransform: 'capitalize', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        {Icon && <Icon size={12} />} {item.status}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <h1 style={{ color: 'var(--primary-dark)', fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={24} /> Toutes les commandes
            </h1>
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    {['#', 'Client', 'Vendeur', 'Livreur', 'Total', 'Statut', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '1rem', color: 'var(--primary-dark)', fontWeight: '600', fontSize: '0.85rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ordersData?.data?.map(order => {
                    const s = STATUS_STYLE[order.status] || { color: '#888', bg: '#f5f5f5' }
                    const Icon = s.icon
                    return (
                      <tr key={order.id} style={{ borderTop: '1px solid var(--primary-light)' }}>
                        <td style={{ padding: '1rem', color: 'var(--primary-dark)', fontWeight: '600' }}>#{order.id}</td>
                        <td style={{ padding: '1rem', color: '#555' }}>{order.client?.name}</td>
                        <td style={{ padding: '1rem', color: '#555' }}>{order.vendeur?.name}</td>
                        <td style={{ padding: '1rem', color: '#555' }}>{order.livreur?.name || <span style={{ color: '#ccc' }}>—</span>}</td>
                        <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: '700' }}>{order.total_amount} DH</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                            {Icon && <Icon size={12} />} {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#aaa', fontSize: '0.8rem' }}>
                          <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {(!ordersData?.data || ordersData.data.length === 0) && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Aucune commande</div>
              )}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <h1 style={{ color: 'var(--primary-dark)', fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={24} /> Utilisateurs
            </h1>
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    {['Nom', 'Email', 'Téléphone', 'Rôle', 'Inscrit le'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '1rem', color: 'var(--primary-dark)', fontWeight: '600', fontSize: '0.85rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersData?.data?.map(u => {
                    const r = ROLE_STYLE[u.role] || { color: '#888', bg: '#f5f5f5', icon: User }
                    const Icon = r.icon
                    return (
                      <tr key={u.id} style={{ borderTop: '1px solid var(--primary-light)' }}>
                        <td style={{ padding: '1rem', color: 'var(--primary-dark)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} /> {u.name}
                        </td>
                        <td style={{ padding: '1rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {u.email}
                        </td>
                        <td style={{ padding: '1rem', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {u.phone}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ background: r.bg, color: r.color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                            {Icon && <Icon size={12} />} {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#aaa', fontSize: '0.8rem' }}>
                          <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {new Date(u.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'transfers' && (
          <div>
            <h1 style={{ color: 'var(--primary-dark)', fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={24} /> Demandes de virement
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {transfersData?.data?.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '20px', color: '#888' }}>
                  <div style={{ marginBottom: '1rem' }}><Wallet size={48} strokeWidth={1.5} /></div>
                  <p>Aucune demande en attente</p>
                </div>
              )}
              {transfersData?.data?.map(t => (
                <div key={t.id} style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(58,155,111,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={16} /> {t.vendeur?.name}
                    </p>
                    <p style={{ color: '#888', fontSize: '0.875rem', marginTop: '4px' }}>
                      <CreditCard size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {t.vendeur?.bank_account || 'Compte non renseigné'}
                    </p>
                    <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.5rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={20} /> {t.amount} DH
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => processTransfer.mutate({ id: t.id, status: 'completed' })}
                      style={{ background: '#EAFAF1', color: '#27AE60', border: '1.5px solid #27AE60', borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> Approuver
                    </button>
                    <button onClick={() => processTransfer.mutate({ id: t.id, status: 'rejected' })}
                      style={{ background: '#FDEDEC', color: '#E74C3C', border: '1.5px solid #E74C3C', borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <XCircle size={16} /> Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  )
}