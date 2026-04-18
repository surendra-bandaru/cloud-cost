'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CloudAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://13.71.54.206:4000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    fetch(`${apiUrl}/cloud-accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setAccounts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb' }}>Cloud Accounts</h1>
        <button onClick={() => router.push('/dashboard/settings')}
          style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
          + Add Account
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : accounts.length === 0 ? (
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>☁️</p>
          <p style={{ color: '#f9fafb', fontWeight: 600, marginBottom: 8 }}>No cloud accounts connected</p>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Connect Azure or GCP to start tracking costs</p>
          <button onClick={() => router.push('/dashboard/settings')}
            style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            Connect Cloud Account
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {accounts.map((acc: any) => (
            <div key={acc.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 32 }}>{acc.provider === 'AZURE' ? '🔷' : '🟢'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#f9fafb', fontWeight: 600 }}>{acc.accountName}</p>
                <p style={{ color: '#6b7280', fontSize: 13 }}>{acc.provider} · ID: {acc.accountId}</p>
              </div>
              <span style={{ background: '#065f46', color: '#6ee7b7', fontSize: 12, padding: '4px 10px', borderRadius: 12 }}>
                {acc.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
