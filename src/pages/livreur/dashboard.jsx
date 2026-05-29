import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { MapPin, Phone, User, DollarSign, Package, CheckCircle, Truck, Navigation, LogOut, Salad, Bike } from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import ToastContainer, { useToast } from '../../components/Toast'

export default function LivreurDashboard() {
  const { user, logout } = useAuthStore()
  const { toasts, success, error } = useToast()
  const queryClient = useQueryClient()
  const locationRef = useRef(null)

  useEffect(() => {
    const sendLocation = () => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(pos => {
        api.put('/livreur/location', { lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(() => {})
      })
    }
    sendLocation()
    locationRef.current = setInterval(sendLocation, 10000)
    return () => clearInterval(locationRef.current)
  }, [])

  const { data: available } = useQuery({
    queryKey: ['available-orders'],
    queryFn: () => api.get('/livreur/orders/available').then(r => r.data),
    refetchInterval: 15000
  })

  const { data: myOrders } = useQuery({
    queryKey: ['livreur-my-orders'],
    queryFn: () => api.get('/orders/my').then(r => r.data),
    refetchInterval: 15000
  })

  const acceptOrder = useMutation({
    mutationFn: (id) => api.post(`/livreur/orders/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries(['available-orders'])
      queryClient.invalidateQueries(['livreur-my-orders'])
      success('Commande acceptée ✓')
    },
    onError: () => error('Erreur lors de l\'acceptation')
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.put(`/livreur/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['livreur-my-orders'])
      success('Statut mis à jour')
    },
    onError: () => error('Erreur lors de la mise à jour')
  })

  const handleLogout = async () => {
    await api.post('/logout')
    logout()
    window.location.href = '/login'
  }

  const activeOrders = myOrders?.data?.filter(o => ['picked_up', 'delivering'].includes(o.status)) || []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ background: 'var(--primary-dark)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🥗</div>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>NutriLiv</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>— Espace Livreur</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Bike size={16} /> {user?.name}
          </span>
          <span style={{ background: '#EAFAF1', color: '#27AE60', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Navigation size={12} /> Disponible
          </span>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '10px', padding: '6px 14px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {activeOrders.length > 0 && (
          <section>
            <h2 style={{ color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} /> Livraisons en cours
              <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '20px', padding: '2px 10px', fontSize: '0.8rem' }}>{activeOrders.length}</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeOrders.map(order => (
                <div key={order.id} style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(58,155,111,0.1)', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1rem' }}>Commande #{order.id}</p>
                      <p style={{ color: '#888', fontSize: '0.875rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} /> {order.client?.name} — <Phone size={12} /> {order.client?.phone}
                      </p>
                      <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {order.delivery_address}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <DollarSign size={16} /> {(parseFloat(order.total_amount) + 20).toFixed(2)} DH
                      </p>
                      <p style={{ color: '#888', fontSize: '0.8rem' }}>à encaisser</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {order.status === 'picked_up' && (
                      <button
                        onClick={() => updateStatus.mutate({ id: order.id, status: 'delivering' })}
                        style={{ background: '#117A65', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Truck size={18} /> En route vers le client
                      </button>
                    )}
                    {order.status === 'delivering' && (
                      <button
                        onClick={() => { if (confirm('Confirmer la livraison ?')) updateStatus.mutate({ id: order.id, status: 'delivered' }) }}
                        style={{ background: '#27AE60', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <CheckCircle size={18} /> Livré et payé
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 style={{ color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} /> Commandes disponibles
            {available?.length > 0 && (
              <span style={{ background: '#F39C12', color: 'white', borderRadius: '20px', padding: '2px 10px', fontSize: '0.8rem' }}>{available.length}</span>
            )}
          </h2>

          {!available || available.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '24px', boxShadow: '0 2px 12px rgba(58,155,111,0.06)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ color: 'var(--primary-dark)', fontWeight: '600', marginBottom: '4px' }}>Aucune commande disponible</p>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Les nouvelles commandes apparaîtront ici automatiquement</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {available.map(order => (
                <div key={order.id} style={{ background: 'white', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(58,155,111,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>Commande #{order.id}</p>
                      <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Salad size={12} /> {order.vendeur?.shop_name || order.vendeur?.name}
                      </p>
                      <p style={{ color: '#aaa', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> Livrer à: {order.delivery_address}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <DollarSign size={14} /> {(parseFloat(order.total_amount) + 20).toFixed(2)} DH
                      </p>
                      <button
                        onClick={() => acceptOrder.mutate(order.id)}
                        disabled={acceptOrder.isPending}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 20px', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <CheckCircle size={14} /> Accepter
                      </button>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--primary-light)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {order.items?.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                        <span>{item.product?.name} × {item.quantity}</span>
                        <span>{item.unit_price} DH</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  )
}