'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://13.71.54.206:4000/api';
const token = () => localStorage.getItem('token') || '';

export default function AnalyticsPage() {
  const [services, setServices] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const end = new Date().toISOString().split('T')[0];
  const start = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  useEffect(() => {
    const h = { Authorization: `Bearer ${token()}` };
    Promise.all([
      fetch(`${API}/billing/services?startDate=${start}&endDate=${end}`, { headers: h }).then(r => r.json()),
      fetch(`${API}/billing/resources?startDate=${start}&endDate=${end}&limit=10`, { headers: h }).then(r => r.json()),
      fetch(`${API}/billing/forecast?days=14`, { headers: h }).then(r => r.json()),
    ]).then(([svc, res, fc]) => {
      if (Array.isArray(svc)) setServices(svc.slice(0, 10));
      if (Array.isArray(res)) setResources(res.slice(0, 10));
      if (Array.isArray(fc)) setForecast(fc);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const card = 'bg-gray-900 border border-gray-800 rounded-xl p-5';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Analytics</h1>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <>
          {/* Forecast */}
          {forecast.length > 0 && (
            <div className={card}>
              <h2 className="font-semibold text-white mb-1">14-Day Cost Forecast</h2>
              <p className="text-xs text-gray-400 mb-4">Predicted daily spend</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="predictedCost" name="Predicted Cost" stroke="#a78bfa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Service Breakdown */}
          <div className={card}>
            <h2 className="font-semibold text-white mb-4">Cost by Service (Last 30 days)</h2>
            {services.length === 0 ? (
              <p className="text-gray-500 text-sm">No data. Sync your cloud accounts first.</p>
            ) : (
              <div className="space-y-3">
                {services.map((s: any, i: number) => {
                  const max = Number(services[0]?.cost || 1);
                  const pct = (Number(s.cost) / max) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">{s.service}</span>
                        <span className="text-sm font-semibold text-white">${Number(s.cost).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="bg-gray-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Resources */}
          <div className={card}>
            <h2 className="font-semibold text-white mb-4">Top Resources by Cost</h2>
            {resources.length === 0 ? (
              <p className="text-gray-500 text-sm">No resource data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left pb-3 font-medium">Resource</th>
                      <th className="text-left pb-3 font-medium">Service</th>
                      <th className="text-right pb-3 font-medium">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {resources.map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-800/50">
                        <td className="py-3 text-gray-300 font-mono text-xs">{String(r.resourceId || r.resourceName || 'N/A').slice(0, 40)}</td>
                        <td className="py-3 text-gray-400">{r.service}</td>
                        <td className="py-3 text-right text-white font-medium">${Number(r._sum?.cost || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
