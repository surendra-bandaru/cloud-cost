'use client';

import { useEffect, useState } from 'react';

export default function BillingPage() {
  const [summary, setSummary] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://13.71.54.206:4000/api';

  const token = () => localStorage.getItem('token') || '';

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, svcRes] = await Promise.all([
        fetch(`${apiUrl}/billing/summary?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${apiUrl}/billing/services?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (sumRes.ok) setSummary(await sumRes.json());
      if (svcRes.ok) setServices(await svcRes.json());
    } catch (e) {}
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage('');
    try {
      const res = await fetch(`${apiUrl}/billing/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        const synced = data.result?.synced ?? data.result?.total ?? 0;
        setMessage(synced > 0
          ? `✅ Synced ${synced} records successfully!`
          : '⚠️ Sync complete but no data returned. Check your Azure permissions (Cost Management Reader role required).'
        );
        fetchData();
      } else {
        setMessage('❌ ' + (data.error || data.message || 'Sync failed'));
      }
    } catch (e: any) {
      setMessage('❌ ' + e.message);
    }
    setSyncing(false);
  };

  const card = { background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 20 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb' }}>Billing</h1>
          <p style={{ color: '#6b7280', fontSize: 13 }}>Last 30 days: {startDate} → {endDate}</p>
        </div>
        <button onClick={handleSync} disabled={syncing} style={{
          padding: '9px 20px', background: syncing ? '#374151' : '#2563eb',
          color: 'white', border: 'none', borderRadius: 6, fontWeight: 600,
          fontSize: 14, cursor: syncing ? 'not-allowed' : 'pointer',
        }}>
          {syncing ? 'Syncing...' : '🔄 Sync Now'}
        </button>
      </div>

      {message && (
        <div style={{ padding: 12, borderRadius: 6, marginBottom: 20, fontSize: 14,
          background: message.includes('✅') ? '#064e3b' : '#7f1d1d',
          color: message.includes('✅') ? '#6ee7b7' : '#fca5a5',
          border: `1px solid ${message.includes('✅') ? '#065f46' : '#991b1b'}` }}>
          {message}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading billing data...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <div style={card}>
              <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>Total Spend (30d)</p>
              <p style={{ color: '#f9fafb', fontSize: 28, fontWeight: 700 }}>
                ${Number(summary?.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            {summary?.byProvider?.map((p: any) => (
              <div key={p.provider} style={card}>
                <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>{p.provider} Costs</p>
                <p style={{ color: '#f9fafb', fontSize: 28, fontWeight: 700 }}>
                  ${Number(p.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p style={{ color: '#6b7280', fontSize: 12 }}>{p.accountName}</p>
              </div>
            ))}
          </div>

          {/* Service Breakdown */}
          <div style={card}>
            <h2 style={{ color: '#f9fafb', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Cost by Service</h2>
            {services.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#6b7280', marginBottom: 12 }}>No billing data yet.</p>
                <p style={{ color: '#4b5563', fontSize: 13 }}>Click "Sync Now" to fetch data from your connected cloud accounts.</p>
              </div>
            ) : (
              <div>
                {services.slice(0, 15).map((svc: any, i: number) => {
                  const maxCost = Number(services[0]?.cost || 1);
                  const pct = (Number(svc.cost) / maxCost) * 100;
                  return (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: '#d1d5db', fontSize: 13 }}>{svc.service}</span>
                        <span style={{ color: '#f9fafb', fontSize: 13, fontWeight: 600 }}>
                          ${Number(svc.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div style={{ background: '#1f2937', borderRadius: 4, height: 6 }}>
                        <div style={{ background: '#3b82f6', borderRadius: 4, height: 6, width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
