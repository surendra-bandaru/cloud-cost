'use client';

import { useEffect, useState } from 'react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://13.71.54.206:4000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${apiUrl}/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setAlerts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const severityColor: any = {
    CRITICAL: { bg: '#7f1d1d', text: '#fca5a5' },
    HIGH: { bg: '#7c2d12', text: '#fdba74' },
    MEDIUM: { bg: '#713f12', text: '#fde68a' },
    LOW: { bg: '#1e3a5f', text: '#93c5fd' },
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', marginBottom: 24 }}>Alerts</h1>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : alerts.length === 0 ? (
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🔔</p>
          <p style={{ color: '#f9fafb', fontWeight: 600 }}>No alerts</p>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Alerts will appear here when budget thresholds are reached</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {alerts.map((alert: any) => {
            const colors = severityColor[alert.severity] || severityColor.LOW;
            return (
              <div key={alert.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ background: colors.bg, color: colors.text, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                  {alert.severity}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#f9fafb', fontWeight: 600, marginBottom: 4 }}>{alert.title}</p>
                  <p style={{ color: '#9ca3af', fontSize: 13 }}>{alert.message}</p>
                </div>
                <p style={{ color: '#6b7280', fontSize: 12, whiteSpace: 'nowrap' }}>
                  {new Date(alert.createdAt).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
