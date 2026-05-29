import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bell, ShoppingCart, Truck, CreditCard, X } from 'lucide-react'
import api from '../api/axios'

const TYPE_ICONS = {
  order_new:     { icon: ShoppingCart, color: '#2980B9', bg: '#EBF5FB' },
  order_status:  { icon: Truck,        color: '#E67E22', bg: '#FEF0E6' },
  delivery_near: { icon: Truck,        color: '#27AE60', bg: '#EAFAF1' },
  payment_done:  { icon: CreditCard,   color: '#8E44AD', bg: '#F5EEF8' },
  transfer_done: { icon: CreditCard,   color: '#117A65', bg: '#E8F8F5' },
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 30000
  })

  const markRead = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  })

  const notifications = data?.data?.slice(0, 5) || []
  const unread = data?.data?.filter(n => !n.is_read).length || 0

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: open ? 'var(--bg)' : 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '10px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Bell size={22} color="var(--primary-dark)" />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#E74C3C', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />

          {/* Dropdown */}
          <div style={{ position: 'absolute', right: 0, top: '48px', width: '340px', background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--primary-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--primary-dark)', fontWeight: '700', fontSize: '0.95rem' }}>
                Notifications {unread > 0 && <span style={{ background: '#E74C3C', color: 'white', borderRadius: '20px', padding: '1px 8px', fontSize: '0.75rem', marginLeft: '6px' }}>{unread}</span>}
              </span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                  <Bell size={32} color="#ddd" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.875rem' }}>Aucune notification</p>
                </div>
              ) : notifications.map(notif => {
                const t = TYPE_ICONS[notif.type] || { icon: Bell, color: '#888', bg: '#f5f5f5' }
                const Icon = t.icon
                return (
                  <div
                    key={notif.id}
                    onClick={() => { if (!notif.is_read) markRead.mutate(notif.id); setOpen(false) }}
                    style={{ padding: '0.875rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: notif.is_read ? 'white' : '#F4FBF7', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}
                  >
                    <div style={{ width: '38px', height: '38px', background: t.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} color={t.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'var(--primary-dark)', fontWeight: '600', fontSize: '0.85rem', marginBottom: '2px' }}>{notif.title}</p>
                      <p style={{ color: '#888', fontSize: '0.8rem', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.message}</p>
                    </div>
                    {!notif.is_read && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '4px' }} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div
              onClick={() => { navigate('/notifications'); setOpen(false) }}
              style={{ padding: '0.875rem', textAlign: 'center', color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', borderTop: '1px solid var(--primary-light)' }}
            >
              Voir toutes les notifications →
            </div>
          </div>
        </>
      )}
    </div>
  )
}