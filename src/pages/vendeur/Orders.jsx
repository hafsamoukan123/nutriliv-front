import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Salad, ShoppingCart, LogOut, User, Phone, MapPin, CheckCircle, Clock, XCircle, ArrowRight, Calendar, DollarSign, Package } from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import ToastContainer, { useToast } from '../../components/Toast'
import NotificationBell from '../../components/NotificationBell'

const STATUS = {
  pending:   { label: 'En attente',     color: '#F39C12', bg: '#FEF9EC', next: 'confirmed',  nextLabel: 'Confirmer', icon: Clock },
  confirmed: { label: 'Confirmé',       color: '#2980B9', bg: '#EBF5FB', next: 'preparing',  nextLabel: 'Préparer', icon: CheckCircle },
  preparing: { label: 'En préparation', color: '#E67E22', bg: '#FEF0E6', next: 'ready',       nextLabel: 'Prêt ✓', icon: Package },
  ready:     { label: 'Prêt 🟢',        color: '#27AE60', bg: '#EAFAF1', next: null,          nextLabel: null, icon: CheckCircle },
  delivered: { label: 'Livré ✓',        color: '#27AE60', bg: '#EAFAF1', next: null,          nextLabel: null, icon: CheckCircle },
  cancelled: { label: 'Annulé',         color: '#E74C3C', bg: '#FDEDEC', next: null,          nextLabel: null, icon: XCircle },
}

const Sidebar = ({ active }) => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = async () => { await api.post('/logout'); logout(); navigate('/login') }
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
        <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', textDecoration: 'none', background: active === item.to ? 'rgba(255,255,255,0.15)' : 'transparent', color: active === item.to ? 'white' : 'rgba(255,255,255,0.7)', fontWeight: active === item.to ? '600' : '400', fontSize: '0.9rem' }}>
          {item.icon}{item.label}
        </Link>
      ))}
      <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', cursor: 'pointer', marginTop: 'auto', textAlign: 'left' }}>
        <LogOut size={18} /> Déconnexion
      </button>
    </aside>
  )
}

export default function VendeurOrders() {
  const { toasts, success, error } = useToast()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['vendeur-orders'],
    queryFn: () => api.get('/vendeur/orders').then(r => r.data),
    refetchInterval: 30000
  })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.put(`/vendeur/orders/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendeur-orders'])
      success('Statut de la commande mis à jour')
    },
    onError: () => error('Erreur lors de la mise à jour')
  })
  const orders = data?.data || []

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar active="/vendeur/orders" />
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ color: 'var(--primary-dark)', fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={24} /> Commandes reçues
        </h1>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary)' }}>Chargement...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => {
              const s = STATUS[order.status] || { label: order.status, color: '#888', bg: '#f5f5f5', icon: Package }
              const StatusIcon = s.icon
              return (
                <div key={order.id} style={{ background: 'white', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(58,155,111,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1rem' }}>Commande #{order.id}</p>
                      <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} /> {order.client?.name} — <Phone size={12} /> {order.client?.phone}
                      </p>
                      <p style={{ color: '#aaa', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={12} /> {order.delivery_address}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <StatusIcon size={12} /> {s.label}
                      </span>
                      {s.next && (
                        <button onClick={() => updateStatus.mutate({ id: order.id, status: s.next })}
                          style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', padding: '6px 14px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ArrowRight size={14} /> {s.nextLabel}
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}
                          style={{ background: '#FDEDEC', color: '#E74C3C', border: 'none', borderRadius: '10px', padding: '6px 14px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={14} /> Annuler
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--primary-light)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                    {order.items?.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#666', marginBottom: '2px' }}>
                        <span>{item.product?.name} × {item.quantity}</span>
                        <span>{(item.unit_price * item.quantity).toFixed(2)} DH</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--primary-light)' }}>
                      <span style={{ color: '#888', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      <span style={{ color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={14} /> {order.total_amount} DH
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            {orders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '20px', color: '#888' }}>
                <div style={{ marginBottom: '1rem' }}><ShoppingCart size={48} strokeWidth={1.5} /></div>
                <p>Aucune commande reçue</p>
              </div>
            )}
          </div>
        )}
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  )
}