'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'azure' | 'gcp'>('azure');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleAzureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/cloud-accounts', {
        provider: 'AZURE',
        name: 'Azure Account',
        credentials: azureConfig,
      });
      setMessage('Azure account connected successfully!');
      setAzureConfig({ tenantId: '', clientId: '', clientSecret: '', subscriptionId: '' });
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to connect Azure account');
    } finally {
      setLoading(false);
    }
  };

  const handleGcpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/cloud-accounts', {
        provider: 'GCP',
        name: 'GCP Account',
        credentials: gcpConfig,
      });
      setMessage('GCP account connected successfully!');
      setGcpConfig({ projectId: '', billingAccountId: '', serviceAccountKey: '' });
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to connect GCP account');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
  };

  const labelStyle = {
    display: 'block',
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
    marginBottom: 6,
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Cloud Account Settings</h1>

      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('azure')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'azure' ? '2px solid #667eea' : '2px solid transparent',
              color: activeTab === 'azure' ? '#667eea' : '#6b7280',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Azure
          </button>
          <button
            onClick={() => setActiveTab('gcp')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'gcp' ? '2px solid #667eea' : '2px solid transparent',
              color: activeTab === 'gcp' ? '#667eea' : '#6b7280',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            GCP
          </button>
        </div>

        {activeTab === 'azure' && (
          <form onSubmit={handleAzureSubmit}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Connect Azure Account</h2>
            
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: 16, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>📋 Setup Instructions</h3>
              <ol style={{ fontSize: 13, color: '#1e3a8a', marginLeft: 20, lineHeight: 1.6 }}>
                <li>Create a Service Principal in Azure Portal or using Azure CLI:
                  <code style={{ display: 'block', background: '#dbeafe', padding: 8, borderRadius: 4, marginTop: 4, fontSize: 12, fontFamily: 'monospace' }}>
                    az ad sp create-for-rbac --name "BillingApp" --role "Cost Management Reader"
                  </code>
                </li>
                <li style={{ marginTop: 8 }}>Assign "Cost Management Reader" role to the Service Principal at Subscription level</li>
                <li style={{ marginTop: 8 }}>Copy the Tenant ID, Client ID (appId), and Client Secret (password) from the output</li>
                <li style={{ marginTop: 8 }}>Get your Subscription ID from Azure Portal → Subscriptions</li>
              </ol>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Tenant ID</label>
              <input
                type="text"
                value={azureConfig.tenantId}
                onChange={(e) => setAzureConfig({ ...azureConfig, tenantId: e.target.value })}
                style={inputStyle}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Client ID</label>
              <input
                type="text"
                value={azureConfig.clientId}
                onChange={(e) => setAzureConfig({ ...azureConfig, clientId: e.target.value })}
                style={inputStyle}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Client Secret</label>
              <input
                type="password"
                value={azureConfig.clientSecret}
                onChange={(e) => setAzureConfig({ ...azureConfig, clientSecret: e.target.value })}
                style={inputStyle}
                placeholder="Your client secret"
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Subscription ID</label>
              <input
                type="text"
                value={azureConfig.subscriptionId}
                onChange={(e) => setAzureConfig({ ...azureConfig, subscriptionId: e.target.value })}
                style={inputStyle}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
              />
            </div>

            {message && (
              <div style={{
                padding: 12,
                borderRadius: 6,
                marginBottom: 16,
                background: message.includes('success') ? '#d1fae5' : '#fee2e2',
                color: message.includes('success') ? '#065f46' : '#991b1b',
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: loading ? '#9ca3af' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Connecting...' : 'Connect Azure Account'}
            </button>
          </form>
        )}

        {activeTab === 'gcp' && (
          <form onSubmit={handleGcpSubmit}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Connect GCP Account</h2>
            
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: 16, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#15803d', marginBottom: 8 }}>📋 Setup Instructions</h3>
              <ol style={{ fontSize: 13, color: '#166534', marginLeft: 20, lineHeight: 1.6 }}>
                <li>Go to GCP Console → IAM & Admin → Service Accounts</li>
                <li style={{ marginTop: 8 }}>Create a new Service Account with these roles:
                  <ul style={{ marginLeft: 20, marginTop: 4 }}>
                    <li>Billing Account Viewer</li>
                    <li>BigQuery Data Viewer (if using BigQuery export)</li>
                  </ul>
                </li>
                <li style={{ marginTop: 8 }}>Create and download a JSON key for the Service Account</li>
                <li style={{ marginTop: 8 }}>Enable Cloud Billing API in your project</li>
                <li style={{ marginTop: 8 }}>Get your Billing Account ID from Billing → Account Management</li>
              </ol>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Project ID</label>
              <input
                type="text"
                value={gcpConfig.projectId}
                onChange={(e) => setGcpConfig({ ...gcpConfig, projectId: e.target.value })}
                style={inputStyle}
                placeholder="my-project-id"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Billing Account ID</label>
              <input
                type="text"
                value={gcpConfig.billingAccountId}
                onChange={(e) => setGcpConfig({ ...gcpConfig, billingAccountId: e.target.value })}
                style={inputStyle}
                placeholder="XXXXXX-XXXXXX-XXXXXX"
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Service Account Key (JSON)</label>
              <textarea
                value={gcpConfig.serviceAccountKey}
                onChange={(e) => setGcpConfig({ ...gcpConfig, serviceAccountKey: e.target.value })}
                style={{ ...inputStyle, minHeight: 120, fontFamily: 'monospace', fontSize: 12 }}
                placeholder='{"type": "service_account", ...}'
                required
              />
            </div>

            {message && (
              <div style={{
                padding: 12,
                borderRadius: 6,
                marginBottom: 16,
                background: message.includes('success') ? '#d1fae5' : '#fee2e2',
                color: message.includes('success') ? '#065f46' : '#991b1b',
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: loading ? '#9ca3af' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Connecting...' : 'Connect GCP Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
