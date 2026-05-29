import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bell, ShoppingCart, Truck, CreditCard, ArrowLeft, CheckCheck, Salad } from 'lucide-react'
import api from '../../api/axios'

const TYPE_ICONS = {
  order_new:    { icon: ShoppingCart, color: '#2980B9', bg: '#EBF5FB' },
  order_status: { icon: Truck,        color: '#E67E22', bg: '#FEF0E6' },
  delivery_near:{ icon: Truck,        color: '#27AE60', bg: '#EAFAF1' },
  payment_done: { icon: CreditCard,   color: '#8E44AD', bg: '#F5EEF8' },
  transfer_done:{ icon: CreditCard,   color: '#117A65', bg: '#E8F8F5' },
}

export default function Notifications() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data)
  })

  const markRead = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  })

  const notifications = data?.data || []
  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(58,155,111,0.08)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'var(--bg)', border: 'none', color: 'var(--primary-dark)', fontWeight: '600', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Salad size={20} color="white" />
          </div>
          <span style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>Notifications</span>
          {unread > 0 && (
            <span style={{ background: '#E74C3C', color: 'white', borderRadius: '20px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '700' }}>{unread}</span>
          )}
        </div>
        <div />
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary)' }}>Chargement...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '24px' }}>
            <Bell size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#888', fontWeight: '600' }}>Aucune notification</p>
          </div>
        ) : notifications.map(notif => {
          const t = TYPE_ICONS[notif.type] || { icon: Bell, color: '#888', bg: '#f5f5f5' }
          const Icon = t.icon
          return (
            <div key={notif.id}
              onClick={() => !notif.is_read && markRead.mutate(notif.id)}
              style={{ background: notif.is_read ? 'white' : '#F4FBF7', borderRadius: '16px', padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(58,155,111,0.06)', display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: notif.is_read ? 'default' : 'pointer', border: notif.is_read ? '1px solid transparent' : '1px solid var(--primary-light)', transition: 'all 0.2s' }}>
              <div style={{ width: '44px', height: '44px', background: t.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={t.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ color: 'var(--primary-dark)', fontWeight: '600', fontSize: '0.9rem' }}>{notif.title}</p>
                  {!notif.is_read && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '4px' }} />
                  )}
                </div>
                <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px', lineHeight: 1.5 }}>{notif.message}</p>
                <p style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '6px' }}>
                  {new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}