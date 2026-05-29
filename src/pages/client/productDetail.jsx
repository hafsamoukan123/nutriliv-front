import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowLeft, ShoppingCart, Salad, Leaf, CheckCircle, AlertCircle, Plus, Minus, LogIn } from 'lucide-react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import ToastContainer, { useToast } from '../../components/Toast'
export default function ProductDetail() {
  const { toasts, error } = useToast()
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data)
  })

  const addToCart = async () => {
    if (!user) return navigate('/login')
    setLoading(true)
    try {
      await api.post('/cart', { product_id: product.id, quantity })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      error("Erreur lors de l'ajout")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--primary)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🥗</div>
        <p>Chargement...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Navbar */}
      <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(58,155,111,0.08)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'var(--bg)', border: 'none', color: 'var(--primary-dark)', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🥗</div>
          <span style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>NutriLiv</span>
        </div>
        <button onClick={() => navigate('/cart')} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.5rem 1.25rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={16} /> Panier
        </button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(58,155,111,0.1)', display: 'flex', flexDirection: 'row' }}>

          {/* Image */}
          <div style={{ width: '45%', position: 'relative', minHeight: '400px' }}>
            <img
              src={product.image
                ? `http://localhost:8000/storage/${product.image}`
                : 'https://placehold.co/400x400/C8EDD9/1A5C3A?text=🥗'
              }
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--primary)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
              {product.category?.icon} {product.category?.name}
            </span>
            {product.stock === 0 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ background: '#E74C3C', color: 'white', padding: '8px 20px', borderRadius: '20px', fontWeight: '700' }}>Rupture de stock</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ color: 'var(--primary-dark)', fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                {product.name}
              </h1>
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
                🏪 {product.vendeur?.shop_name || product.vendeur?.name}
              </p>

              {/* Nutrition badge */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{ background: 'var(--bg)', color: 'var(--primary)', border: '1px solid var(--primary-light)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Salad size={14} /> Sain
                </span>
                <span style={{ background: 'var(--bg)', color: 'var(--primary)', border: '1px solid var(--primary-light)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} /> Frais
                </span>
                <span style={{ background: 'var(--bg)', color: 'var(--primary)', border: '1px solid var(--primary-light)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Leaf size={14} /> Naturel
                </span>
              </div>

              <p style={{ color: '#666', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                {product.description || 'Un plat préparé avec des ingrédients frais et naturels pour votre santé.'}
              </p>

              {/* Stock indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: product.stock > 0 ? '#27AE60' : '#E74C3C' }}></div>
                <span style={{ color: product.stock > 0 ? '#27AE60' : '#E74C3C', fontSize: '0.875rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {product.stock > 0 ? `${product.stock} portions disponibles` : 'Rupture de stock'}
                </span>
              </div>
            </div>

            <div>
              {/* Price */}
              <p style={{ color: 'var(--primary)', fontSize: '2.25rem', fontWeight: '700', marginBottom: '1.25rem' }}>
                {product.price} <span style={{ fontSize: '1rem', fontWeight: '500' }}>DH</span>
              </p>

              {/* Quantity */}
              {product.stock > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ color: 'var(--primary-dark)', fontWeight: '500', fontSize: '0.875rem', marginBottom: '8px' }}>Quantité</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0', background: 'var(--bg)', borderRadius: '14px', padding: '4px', width: 'fit-content' }}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{ width: '40px', height: '40px', background: quantity === 1 ? 'transparent' : 'white', border: 'none', borderRadius: '10px', color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1.25rem', cursor: 'pointer', boxShadow: quantity === 1 ? 'none' : '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    ><Minus size={18} /></button>
                    <span style={{ width: '40px', textAlign: 'center', color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1.1rem' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      style={{ width: '40px', height: '40px', background: 'white', border: 'none', borderRadius: '10px', color: 'var(--primary-dark)', fontWeight: '700', fontSize: '1.25rem', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    ><Plus size={18} /></button>
                  </div>
                </div>
              )}

              {/* Total */}
              {product.stock > 0 && quantity > 1 && (
                <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Total: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{(product.price * quantity).toFixed(2)} DH</span>
                </p>
              )}

              {/* Add to cart button */}
              <button
                onClick={addToCart}
                disabled={loading || product.stock === 0 || added}
                style={{ width: '100%', background: added ? '#27AE60' : product.stock === 0 ? '#ccc' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', padding: '1rem', fontSize: '1rem', fontWeight: '700', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {added ? <CheckCircle size={18} /> : loading ? null : product.stock === 0 ? <AlertCircle size={18} /> : <ShoppingCart size={18} />}
                {added ? 'Ajouté au panier!' : loading ? 'Ajout...' : product.stock === 0 ? 'Rupture de stock' : `Ajouter au panier — ${(product.price * quantity).toFixed(2)} DH`}
              </button>

              {!user && (
                <p style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                  <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <LogIn size={14} /> Connectez-vous
                  </span> pour commander
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} /> 
    </div>
  )
}