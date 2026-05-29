import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, Bike, CheckCircle, Clock, XCircle, Truck, Utensils, Salad } from 'lucide-react'
import api from '../../api/axios'

const STATUS = {
  pending:    { label: 'En attente',     color: '#F39C12', bg: '#FEF9EC', icon: Clock },
  confirmed:  { label: 'Confirmé',       color: '#2980B9', bg: '#EBF5FB', icon: CheckCircle },
  preparing:  { label: 'En préparation', color: '#E67E22', bg: '#FEF0E6', icon: Utensils },
  ready:      { label: 'Prêt',           color: '#8E44AD', bg: '#F5EEF8', icon: Salad },
  picked_up:  { label: 'Récupéré',       color: '#1A5276', bg: '#EAF2FF', icon: Package },
  delivering: { label: 'En livraison',   color: '#117A65', bg: '#E8F8F5', icon: Truck },
  delivered:  { label: 'Livré ✓',        color: '#27AE60', bg: '#EAFAF1', icon: CheckCircle },
  cancelled:  { label: 'Annulé',         color: '#E74C3C', bg: '#FDEDEC', icon: XCircle },
}

export default function ClientOrders() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my').then(r => r.data),
    refetchInterval: 30000
  })

  const orders = data?.data || []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={18} /> Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🥗</div>
          <span style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>Mes Commandes</span>
        </div>
        <div />
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary)' }}>Chargement...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <p style={{ color: 'var(--primary-dark)', fontWeight: '600' }}>Aucune commande</p>
          </div>
        ) : orders.map(order => {
          const s = STATUS[order.status] || { label: order.status, color: '#888', bg: '#f5f5f5', icon: Package }
          const StatusIcon = s.icon
          return (
            <div key={order.id} style={{ background: 'white', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(58,155,111,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>Commande #{order.id}</p>
                  <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <StatusIcon size={14} /> {s.label}
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--primary-light)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#555' }}>
                    <span>{item.product?.name} × {item.quantity}</span>
                    <span>{(item.unit_price * item.quantity).toFixed(2)} DH</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--primary-light)' }}>
                <span style={{ color: '#888', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {order.delivery_address}
                </span>
                <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{order.total_amount} DH</span>
              </div>

              {order.livreur && ['picked_up', 'delivering'].includes(order.status) && (
                <div style={{ marginTop: '0.75rem', background: 'var(--bg)', borderRadius: '12px', padding: '0.75rem', fontSize: '0.875rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bike size={16} /> Livreur: {order.livreur.name} — {order.livreur.phone}
                </div>
              )}

              {/* ✅ Bouton Suivre ma commande - AJOUTÉ ICI */}
              {['picked_up', 'delivering', 'confirmed', 'preparing', 'ready'].includes(order.status) && (
                <button
                  onClick={() => navigate(`/orders/${order.id}/track`)}
                  style={{ marginTop: '0.75rem', width: '100%', background: 'var(--bg)', color: 'var(--primary)', border: '1.5px solid var(--primary)', borderRadius: '12px', padding: '0.6rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <MapPin size={16} /> Suivre ma commande
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}