'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'azure' | 'gcp'>('azure');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [accounts, setAccounts] = useState<any[]>([]);

  const [azureConfig, setAzureConfig] = useState({
    tenantId: '',
    clientId: '',
    clientSecret: '',
    subscriptionId: '',
  });

  const [gcpConfig, setGcpConfig] = useState({
    projectId: '',
    billingAccountId: '',
    serviceAccountKey: '',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://13.71.54.206:4000/api';

  const getToken = () => localStorage.getItem('token') || '';

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${apiUrl}/cloud-accounts`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleAzureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const token = getToken();
    if (!token) {
      setMessage({ text: 'No auth token found. Please login again.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/cloud-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: 'AZURE',
          accountId: azureConfig.subscriptionId,
          accountName: 'Azure - ' + azureConfig.subscriptionId.slice(0, 8),
          credentials: azureConfig,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Azure account connected successfully!', type: 'success' });
        setAzureConfig({ tenantId: '', clientId: '', clientSecret: '', subscriptionId: '' });
        fetchAccounts();
      } else {
        setMessage({ text: data.error || data.message || `Error ${res.status}`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: 'Network error: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGcpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const token = getToken();
    if (!token) {
      setMessage({ text: 'No auth token found. Please login again.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/cloud-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: 'GCP',
          accountId: gcpConfig.projectId,
          accountName: 'GCP - ' + gcpConfig.projectId,
          credentials: gcpConfig,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'GCP account connected successfully!', type: 'success' });
        setGcpConfig({ projectId: '', billingAccountId: '', serviceAccountKey: '' });
        fetchAccounts();
      } else {
        setMessage({ text: data.error || data.message || `Error ${res.status}`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: 'Network error: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const input = {
    width: '100%',
    padding: '10px 12px',
    background: '#1f2937',
    border: '1px solid #374151',
    borderRadius: 6,
    fontSize: 14,
    color: '#f9fafb',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const label = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#9ca3af',
    marginBottom: 6,
  };

  const field = { marginBottom: 16 };

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', marginBottom: 8 }}>Cloud Account Settings</h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Connect your cloud providers to start fetching billing data.</p>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', marginBottom: 12 }}>CONNECTED ACCOUNTS</h2>
          {accounts.map((acc: any) => (
            <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #1f2937' }}>
              <span style={{ fontSize: 20 }}>{acc.provider === 'AZURE' ? '🔷' : '🟢'}</span>
              <div>
                <p style={{ color: '#f9fafb', fontSize: 14, fontWeight: 500 }}>{acc.accountName}</p>
                <p style={{ color: '#6b7280', fontSize: 12 }}>{acc.provider} · {acc.accountId}</p>
              </div>
              <span style={{ marginLeft: 'auto', background: '#065f46', color: '#6ee7b7', fontSize: 11, padding: '2px 8px', borderRadius: 12 }}>Active</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #1f2937' }}>
          {(['azure', 'gcp'] as const).map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setMessage({ text: '', type: '' }); }}
              style={{
                flex: 1, padding: '14px', background: activeTab === tab ? '#1f2937' : 'transparent',
                border: 'none', borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab ? '#f9fafb' : '#6b7280',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1,
              }}>
              {tab === 'azure' ? '🔷 Azure' : '🟢 GCP'}
            </button>
          ))}
        </div>

        <div style={{ padding: 24 }}>
          {/* Message */}
          {message.text && (
            <div style={{
              padding: '12px 16px', borderRadius: 6, marginBottom: 20, fontSize: 14,
              background: message.type === 'success' ? '#064e3b' : '#7f1d1d',
              border: `1px solid ${message.type === 'success' ? '#065f46' : '#991b1b'}`,
              color: message.type === 'success' ? '#6ee7b7' : '#fca5a5',
            }}>
              {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
            </div>
          )}

          {activeTab === 'azure' && (
            <form onSubmit={handleAzureSubmit}>
              <div style={{ background: '#1e3a5f', border: '1px solid #1d4ed8', borderRadius: 6, padding: 14, marginBottom: 20 }}>
                <p style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>📋 Azure Service Principal Required</p>
                <code style={{ display: 'block', background: '#172554', color: '#bfdbfe', padding: 10, borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>
                  az ad sp create-for-rbac --name "BillingApp" --role "Cost Management Reader" --scopes /subscriptions/YOUR_SUB_ID
                </code>
              </div>

              <div style={field}>
                <label style={label}>Tenant ID</label>
                <input style={input} value={azureConfig.tenantId} onChange={e => setAzureConfig({ ...azureConfig, tenantId: e.target.value })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
              </div>
              <div style={field}>
                <label style={label}>Client ID (App ID)</label>
                <input style={input} value={azureConfig.clientId} onChange={e => setAzureConfig({ ...azureConfig, clientId: e.target.value })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
              </div>
              <div style={field}>
                <label style={label}>Client Secret</label>
                <input type="password" style={input} value={azureConfig.clientSecret} onChange={e => setAzureConfig({ ...azureConfig, clientSecret: e.target.value })} placeholder="Your service principal secret" required />
              </div>
              <div style={field}>
                <label style={label}>Subscription ID</label>
                <input style={input} value={azureConfig.subscriptionId} onChange={e => setAzureConfig({ ...azureConfig, subscriptionId: e.target.value })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
              </div>

              <button type="submit" disabled={loading} style={{
                padding: '11px 24px', background: loading ? '#374151' : '#2563eb',
                color: 'white', border: 'none', borderRadius: 6, fontWeight: 600,
                fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', width: '100%',
              }}>
                {loading ? 'Connecting...' : 'Connect Azure Account'}
              </button>
            </form>
          )}

          {activeTab === 'gcp' && (
            <form onSubmit={handleGcpSubmit}>
              <div style={{ background: '#14532d', border: '1px solid #166534', borderRadius: 6, padding: 14, marginBottom: 20 }}>
                <p style={{ color: '#86efac', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>📋 GCP Service Account Required</p>
                <code style={{ display: 'block', background: '#052e16', color: '#bbf7d0', padding: 10, borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>
                  gcloud iam service-accounts keys create key.json --iam-account=SA_EMAIL
                </code>
              </div>

              <div style={field}>
                <label style={label}>Project ID</label>
                <input style={input} value={gcpConfig.projectId} onChange={e => setGcpConfig({ ...gcpConfig, projectId: e.target.value })} placeholder="my-gcp-project-id" required />
              </div>
              <div style={field}>
                <label style={label}>Billing Account ID</label>
                <input style={input} value={gcpConfig.billingAccountId} onChange={e => setGcpConfig({ ...gcpConfig, billingAccountId: e.target.value })} placeholder="XXXXXX-XXXXXX-XXXXXX" required />
              </div>
              <div style={field}>
                <label style={label}>Service Account Key (JSON)</label>
                <textarea style={{ ...input, minHeight: 120, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
                  value={gcpConfig.serviceAccountKey}
                  onChange={e => setGcpConfig({ ...gcpConfig, serviceAccountKey: e.target.value })}
                  placeholder='{"type": "service_account", "project_id": "...", ...}'
                  required />
              </div>

              <button type="submit" disabled={loading} style={{
                padding: '11px 24px', background: loading ? '#374151' : '#16a34a',
                color: 'white', border: 'none', borderRadius: 6, fontWeight: 600,
                fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', width: '100%',
              }}>
                {loading ? 'Connecting...' : 'Connect GCP Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
