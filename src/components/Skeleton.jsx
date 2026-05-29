export function ProductSkeleton() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: '160px', borderRadius: '0' }} />
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="skeleton" style={{ height: '18px', width: '75%' }} />
        <div className="skeleton" style={{ height: '14px', width: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: '22px', width: '30%' }} />
          <div className="skeleton" style={{ height: '36px', width: '35%', borderRadius: '10px' }} />
        </div>
      </div>
    </div>
  )
}

export function OrderSkeleton() {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ height: '20px', width: '35%' }} />
        <div className="skeleton" style={{ height: '24px', width: '20%', borderRadius: '20px' }} />
      </div>
      <div className="skeleton" style={{ height: '14px', width: '60%' }} />
      <div className="skeleton" style={{ height: '14px', width: '45%' }} />
      <div className="skeleton" style={{ height: '1px', width: '100%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ height: '16px', width: '40%' }} />
        <div className="skeleton" style={{ height: '16px', width: '20%' }} />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="skeleton stat-card" style={{ height: '130px' }} />
  )
}