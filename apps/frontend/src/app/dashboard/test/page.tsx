'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function TestPage() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    setToken(storedToken || 'No token found');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const testAPI = async () => {
    setLoading(true);
    setTestResult('Testing...');
    try {
      const response = await api.get('/cloud-accounts');
      setTestResult('✅ API call successful! Response: ' + JSON.stringify(response.data));
    } catch (err: any) {
      setTestResult('❌ API call failed: ' + JSON.stringify({
        status: err.response?.status,
        error: err.response?.data,
        message: err.message
      }));
    } finally {
      setLoading(false);
    }
  };

  const testPost = async () => {
    setLoading(true);
    setTestResult('Testing POST...');
    try {
      const response = await api.post('/cloud-accounts', {
        provider: 'AZURE',
        name: 'Test Account',
        credentials: {
          tenantId: 'test',
          clientId: 'test',
          clientSecret: 'test',
          subscriptionId: 'test'
        }
      });
      setTestResult('✅ POST successful! Response: ' + JSON.stringify(response.data));
    } catch (err: any) {
      setTestResult('❌ POST failed: ' + JSON.stringify({
        status: err.response?.status,
        error: err.response?.data,
        message: err.message
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>API Test Page</h1>
      
      <div style={{ background: 'white', borderRadius: 8, padding: 24, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Token Info</h2>
        <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 6, fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>
          {token}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 8, padding: 24, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>User Info</h2>
        <pre style={{ background: '#f3f4f6', padding: 12, borderRadius: 6, fontSize: 12, overflow: 'auto' }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div style={{ background: 'white', borderRadius: 8, padding: 24, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>API Tests</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            onClick={testAPI}
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
            Test GET /cloud-accounts
          </button>
          <button
            onClick={testPost}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Test POST /cloud-accounts
          </button>
        </div>
        {testResult && (
          <pre style={{ background: '#f3f4f6', padding: 12, borderRadius: 6, fontSize: 12, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {testResult}
          </pre>
        )}
      </div>
    </div>
  );
}
