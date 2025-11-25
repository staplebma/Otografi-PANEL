

function AppSimple() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #f9fafb, #e5e7eb)'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#4FD1C5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white'
        }}>
          RO
        </div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#111827'
        }}>
          RASIM OTOMOTIV CRM
        </h1>
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          Sistem başarıyla yüklendi!
        </p>
        <div style={{
          background: '#f3f4f6',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#374151'
        }}>
          <strong>Frontend:</strong> Çalışıyor ✓<br />
          <strong>Port:</strong> 5173<br />
          <strong>Status:</strong> Ready
        </div>
        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: '#9ca3af'
        }}>
          Backend bağlantısı için Supabase yapılandırması gerekiyor
        </p>
      </div>
    </div>
  );
}

export default AppSimple;
