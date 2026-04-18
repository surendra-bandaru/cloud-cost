'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://13.71.54.206:4000/api';
const token = () => typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
const get = (path: string) => fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json());

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
      <p className="text-gray-300 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: ${Number(p.value).toLocaleString()}</p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const end = new Date().toISOString().split('T')[0];
  const start = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sum, svc, alr] = await Promise.all([
        get(`/billing/summary?startDate=${start}&endDate=${end}`),
        get(`/billing/services?startDate=${start}&endDate=${end}`),
        get('/alerts'),
      ]);
      if (!sum.error) setSummary(sum);
      if (Array.isArray(svc)) setServices(svc.slice(0, 6));
      if (Array.isArray(alr)) setAlerts(alr.slice(0, 3));
    } catch (e) {}
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await fetch(`${API}/billing/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setSyncMsg(res.ok ? '✅ Sync started! Refreshing in 10s...' : '❌ ' + (data.error || 'Sync failed'));
      if (res.ok) setTimeout(() => { loadAll(); setSyncMsg(''); }, 10000);
    } catch (e: any) { setSyncMsg('❌ ' + e.message); }
    setSyncing(false);
  };

  // Build pie data from summary
  const pieData = summary?.byProvider?.map((p: any) => ({
    name: p.provider,
    value: Number(p.totalCost),
    color: p.provider === 'AZURE' ? '#3b82f6' : '#10b981',
  })) || [];

  // Build bar data from services
  const barData = services.map((s: any) => ({
    name: String(s.service).slice(0, 20),
    cost: Number(s.cost),
  }));

  const totalCost = Number(summary?.totalCost || 0);
  const forecasted = totalCost * 1.1;

  return (
    <div className="space-y-6">
      {/* Sync bar */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-3">
          {syncMsg && <span className="text-sm" style={{ color: syncMsg.includes('✅') ? '#6ee7b7' : '#fca5a5' }}>{syncMsg}</span>}
          <button onClick={handleSync} disabled={syncing}
            className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${syncing ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'}`}>
            {syncing ? 'Syncing...' : '🔄 Sync Now'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Loading billing data...</p>
        </div>
      ) : totalCost === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <p className="text-4xl mb-4">☁️</p>
          <p className="text-white font-semibold text-lg mb-2">No billing data yet</p>
          <p className="text-gray-400 text-sm mb-6">Click "Sync Now" to fetch your cloud costs from Azure/GCP</p>
          <button onClick={handleSync} disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
            {syncing ? 'Syncing...' : 'Sync Billing Data'}
          </button>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl mb-4">💰</div>
              <p className="text-2xl font-bold text-white">${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              <p className="text-sm text-gray-400 mt-1">Total Spend (30d)</p>
            </div>
            {pieData.map((p: any) => (
              <div key={p.name} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4" style={{ background: p.color + '33' }}>
                  {p.name === 'AZURE' ? '🔷' : '🟢'}
                </div>
                <p className="text-2xl font-bold text-white">${p.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                <p className="text-sm text-gray-400 mt-1">{p.name} Costs</p>
              </div>
            ))}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl mb-4">📊</div>
              <p className="text-2xl font-bold text-white">${forecasted.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              <p className="text-sm text-gray-400 mt-1">Forecasted (Month)</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Service Bar Chart */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-1">Cost by Service</h3>
              <p className="text-xs text-gray-400 mb-4">Top services this month</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cost" name="Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-1">Cost Distribution</h3>
              <p className="text-xs text-gray-400 mb-4">By provider</p>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                        {pieData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {pieData.map((p: any) => (
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                          <span className="text-sm text-gray-300">{p.name}</span>
                        </div>
                        <span className="text-sm font-medium text-white">${p.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p className="text-gray-500 text-sm">No data</p>}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Recent Alerts</h3>
              {alerts.filter((a: any) => !a.isRead).length > 0 && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                  {alerts.filter((a: any) => !a.isRead).length} new
                </span>
              )}
            </div>
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-sm">No alerts. You're all good!</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((a: any) => (
                  <div key={a.id} className="flex gap-3 p-3 rounded-lg bg-gray-800/50">
                    <span className="text-lg">{a.severity === 'CRITICAL' || a.severity === 'HIGH' ? '🔴' : a.severity === 'MEDIUM' ? '🟡' : '🔵'}</span>
                    <div>
                      <p className="text-xs text-gray-200">{a.title || a.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
