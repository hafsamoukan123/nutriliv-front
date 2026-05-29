import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Phone, Package, CheckCircle, Truck, Clock, Salad } from 'lucide-react'
import api from '../../api/axios'

const STATUS = {
  pending:    { label: 'En attente',     icon: Clock,        color: '#F39C12', bg: '#FEF9EC', step: 1 },
  confirmed:  { label: 'Confirmé',       icon: CheckCircle,  color: '#2980B9', bg: '#EBF5FB', step: 2 },
  preparing:  { label: 'En préparation', icon: Salad,        color: '#E67E22', bg: '#FEF0E6', step: 3 },
  ready:      { label: 'Prêt',           icon: Package,      color: '#8E44AD', bg: '#F5EEF8', step: 4 },
  picked_up:  { label: 'Récupéré',       icon: Truck,        color: '#1A5276', bg: '#EAF2FF', step: 5 },
  delivering: { label: 'En livraison',   icon: Truck,        color: '#117A65', bg: '#E8F8F5', step: 6 },
  delivered:  { label: 'Livré ✓',        icon: CheckCircle,  color: '#27AE60', bg: '#EAFAF1', step: 7 },
}

const STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered']

export default function TrackOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['track-order', id],
    queryFn: () => api.get(`/orders/${id}/track`).then(r => r.data),
    refetchInterval: 10000
  })

  const { data: orderData } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => api.get('/orders/my').then(r => r.data.data.find(o => o.id === parseInt(id)))
  })

  // ✅ تحميل Leaflet ديناميكياً
  useEffect(() => {
    if (mapLoaded) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setMapLoaded(true)
    document.head.appendChild(script)
  }, [])

  // ✅ تهيئة الخريطة
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return
    const L = window.L
    mapInstanceRef.current = L.map(mapRef.current).setView([33.9716, -6.8498], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(mapInstanceRef.current)
  }, [mapLoaded])

  // ✅ تحديث موقع الساعي على الخريطة
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !data?.livreur?.current_location) return
    const L = window.L
    const [lat, lng] = data.livreur.current_location.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return

    const icon = L.divIcon({
      html: `<div style="background:#3A9B6F;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.25rem;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🚴</div>`,
      className: '', iconAnchor: [20, 20]
    })

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current)
        .bindPopup(`<b>Livreur: ${data.livreur.name}</b>`)
    }
    mapInstanceRef.current.setView([lat, lng], 15)
  }, [data, mapLoaded])

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--primary)' }}>
        <Truck size={48} style={{ marginBottom: '1rem' }} />
        <p>Chargement du suivi...</p>
      </div>
    </div>
  )

  const currentStatus = STATUS[data?.status] || STATUS['pending']
  const currentStep = STEPS.indexOf(data?.status) + 1

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Navbar */}
      <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(58,155,111,0.08)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/orders')} style={{ background: 'var(--bg)', border: 'none', color: 'var(--primary-dark)', fontWeight: '600', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Salad size={20} color="white" />
          </div>
          <span style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>Suivi commande #{id}</span>
        </div>
        <div />
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Status Banner */}
        <div style={{ background: currentStatus.bg, borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: `2px solid ${currentStatus.color}20` }}>
          <div style={{ width: '56px', height: '56px', background: currentStatus.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <currentStatus.icon size={28} color="white" />
          </div>
          <div>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>Statut actuel</p>
            <p style={{ color: currentStatus.color, fontWeight: '700', fontSize: '1.25rem' }}>{currentStatus.label}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(58,155,111,0.06)' }}>
          <h2 style={{ color: 'var(--primary-dark)', fontWeight: '700', marginBottom: '1.25rem', fontSize: '1rem' }}>Progression de la commande</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STEPS.slice(0, -1).map((step, i) => {
              const s = STATUS[step]
              const done = i + 1 <= currentStep
              const Icon = s.icon
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: done ? 'var(--primary)' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                      <Icon size={16} color={done ? 'white' : '#ccc'} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: done ? 'var(--primary)' : '#ccc', fontWeight: done ? '600' : '400', textAlign: 'center', maxWidth: '60px' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 2 && (
                    <div style={{ flex: 1, height: '3px', background: i + 1 < currentStep ? 'var(--primary)' : '#f0f0f0', margin: '0 4px', marginBottom: '20px', transition: 'all 0.3s', borderRadius: '2px' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Map */}
        {['picked_up', 'delivering'].includes(data?.status) && (
          <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(58,155,111,0.06)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--primary-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={20} color="var(--primary)" />
              <span style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>Position du livreur en temps réel</span>
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#27AE60' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27AE60', animation: 'pulse 1.5s infinite' }} />
                En direct
              </span>
            </div>
            <div ref={mapRef} style={{ height: '350px', width: '100%' }} />
          </div>
        )}

        {/* Livreur Info */}
        {data?.livreur && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(58,155,111,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={24} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>{data.livreur.name}</p>
              <p style={{ color: '#888', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Phone size={14} /> {data.livreur.phone}
              </p>
            </div>
            <a href={`tel:${data.livreur.phone}`} style={{ background: 'var(--primary)', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '12px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={16} /> Appeler
            </a>
          </div>
        )}

        {/* Order Items */}
        {orderData && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(58,155,111,0.06)' }}>
            <h2 style={{ color: 'var(--primary-dark)', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} color="var(--primary)" /> Détails de la commande
            </h2>
            {orderData.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--primary-light)', fontSize: '0.9rem', color: '#555' }}>
                <span>{item.product?.name} × {item.quantity}</span>
                <span style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>{(item.unit_price * item.quantity).toFixed(2)} DH</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
              <span style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>Total</span>
              <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>{orderData.total_amount} DH</span>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '0.875rem' }}>
              <MapPin size={14} /> {orderData.delivery_address}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}