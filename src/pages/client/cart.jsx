import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, ShoppingCart, Salad, Plus, Minus, Trash2, MapPin, CheckCircle, Truck } from 'lucide-react'
import api from '../../api/axios'
import ToastContainer, { useToast } from '../../components/Toast'
export default function Cart() {
  const navigate = useNavigate()
  const { toasts, success, error } = useToast()
  const queryClient = useQueryClient()
  const [address, setAddress] = useState('')
  const [ordering, setOrdering] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then(r => r.data)
  })

  const removeItem = useMutation({
    mutationFn: (id) => api.delete(`/cart/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['cart'])
  })

  const updateItem = useMutation({
    mutationFn: ({ id, quantity }) => api.put(`/cart/${id}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries(['cart'])
  })

  const placeOrder = async () => {
    if (!address.trim()) return error('Veuillez entrer votre adresse')
    setOrdering(true)
    try {
      await api.post('/orders', { delivery_address: address })
      success('Commande passée avec succès ✓')
      queryClient.invalidateQueries(['cart'])
      navigate('/orders')
    } catch (err) {
      error(err.response?.data?.message || 'Erreur')
    } finally {
      setOrdering(false)
    }
  }

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
      Chargement...
    </div>
  )

  const items = data?.cart?.items || []
  const total = data?.total || 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Navbar */}
      <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={16} /> Continuer mes achats
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🥗</div>
          <span style={{ color: 'var(--primary-dark)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingCart size={18} /> Mon Panier
          </span>
        </div>
        <div />
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '24px', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
            <p style={{ color: 'var(--primary-dark)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Votre panier est vide</p>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>Découvrez nos plats sains</p>
            <button onClick={() => navigate('/')} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
              Voir les plats
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Items */}
            {items.map(item => (
              <div key={item.id} style={{ background: 'white', borderRadius: '20px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 12px rgba(58,155,111,0.06)' }}>
                <img
                  src={item.product?.image ? `http://localhost:8000/storage/${item.product.image}` : 'https://placehold.co/70x70/C8EDD9/1A5C3A?text=🥗'}
                  alt={item.product?.name}
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '14px' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--primary-dark)', fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Salad size={14} /> {item.product?.name}
                  </p>
                  <p style={{ color: 'var(--primary)', fontWeight: '700', marginTop: '2px' }}>{item.unit_price} DH</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg)', borderRadius: '10px', padding: '4px 8px' }}>
                  <button onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ color: 'var(--primary-dark)', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={14} />
                  </button>
                </div>
                <span style={{ color: 'var(--primary-dark)', fontWeight: '700', minWidth: '80px', textAlign: 'right' }}>
                  {(item.unit_price * item.quantity).toFixed(2)} DH
                </span>
                <button onClick={() => removeItem.mutate(item.id)}
                  style={{ background: '#FFF0F0', color: '#E74C3C', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Summary */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(58,155,111,0.08)' }}>
              <h2 style={{ color: 'var(--primary-dark)', fontWeight: '700', marginBottom: '1rem' }}>Résumé</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.9rem' }}>
                  <span>Sous-total</span><span>{total.toFixed(2)} DH</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.9rem' }}>
                  <span>Livraison</span><span>20.00 DH</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1.1rem', borderTop: '1.5px solid var(--primary-light)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <span>Total</span><span style={{ color: 'var(--primary)' }}>{(total + 20).toFixed(2)} DH</span>
                </div>
              </div>

              <label style={{ display: 'block', color: 'var(--primary-dark)', fontWeight: '500', fontSize: '0.875rem', marginBottom: '6px', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> Adresse de livraison
              </label>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Entrez votre adresse complète..."
                style={{ width: '100%', border: '1.5px solid var(--primary-light)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.9rem', outline: 'none', background: 'var(--bg)', color: 'var(--primary-dark)', marginBottom: '1rem' }}
              />

              <button
                onClick={placeOrder}
                disabled={ordering}
                style={{ width: '100%', background: ordering ? '#5EBC8E' : '#27AE60', color: 'white', border: 'none', borderRadius: '14px', padding: '1rem', fontSize: '1rem', fontWeight: '700', cursor: ordering ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {ordering ? (
                  <>
                    <Truck size={18} /> Traitement...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} /> Confirmer la commande (Paiement à la livraison)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  )
}