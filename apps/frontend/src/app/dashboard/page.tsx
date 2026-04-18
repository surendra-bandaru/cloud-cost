'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const mockTrends = [
  { month: 'Nov', azure: 4200, gcp: 2800 },
  { month: 'Dec', azure: 5100, gcp: 3200 },
  { month: 'Jan', azure: 4800, gcp: 3600 },
  { month: 'Feb', azure: 6200, gcp: 4100 },
  { month: 'Mar', azure: 5800, gcp: 3900 },
  { month: 'Apr', azure: 7100, gcp: 4800 },
];

const mockServices = [
  { name: 'Compute', azure: 3200, gcp: 2100 },
  { name: 'Storage', azure: 1800, gcp: 900 },
  { name: 'Network', azure: 900, gcp: 700 },
  { name: 'Database', azure: 1200, gcp: 800 },
  { name: 'AI/ML', azure: 0, gcp: 300 },
];

const mockPie = [
  { name: 'Azure', value: 7100, color: '#3b82f6' },
  { name: 'GCP', value: 4800, color: '#10b981' },
];

const mockAlerts = [
  { id: 1, type: 'warning', msg: 'Azure compute costs up 22% this week', time: '2h ago' },
  { id: 2, type: 'error', msg: 'Budget threshold reached for GCP Storage', time: '5h ago' },
  { id: 3, type: 'info', msg: 'Monthly report generated successfully', time: '1d ago' },
];

const mockTopResources = [
  { name: 'aks-nodepool-prod', provider: 'Azure', cost: 2840, change: +12 },
  { name: 'gke-cluster-main', provider: 'GCP', cost: 1920, change: +5 },
  { name: 'sql-server-prod', provider: 'Azure', cost: 1240, change: -3 },
  { name: 'cloud-storage-main', provider: 'GCP', cost: 890, change: +8 },
  { name: 'vm-scale-set-01', provider: 'Azure', cost: 760, change: +2 },
];

function StatCard({ title, value, sub, color, icon, trend }: any) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-xl`}>{icon}</div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{title}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
        <p className="text-gray-300 mb-2 font-medium">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: ${p.value.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  return (
    <div className={`space-y-6 transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Spend (30d)" value="$11,900" icon="💰" color="bg-blue-500/20" trend={18} />
        <StatCard title="Azure Costs" value="$7,100" icon="🔷" color="bg-blue-600/20" trend={22} sub="4 subscriptions" />
        <StatCard title="GCP Costs" value="$4,800" icon="🟢" color="bg-green-500/20" trend={5} sub="2 projects" />
        <StatCard title="Forecasted (Month)" value="$14,200" icon="📊" color="bg-purple-500/20" trend={12} sub="Based on trend" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Cost Trends</h3>
              <p className="text-xs text-gray-400">Last 6 months</p>
            </div>
            <div className="flex gap-2">
              {['1M', '3M', '6M', '1Y'].map(p => (
                <button key={p} className={`text-xs px-2 py-1 rounded ${p === '6M' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockTrends}>
              <defs>
                <linearGradient id="azure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gcp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Area type="monotone" dataKey="azure" name="Azure" stroke="#3b82f6" fill="url(#azure)" strokeWidth={2} />
              <Area type="monotone" dataKey="gcp" name="GCP" stroke="#10b981" fill="url(#gcp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-1">Cost Distribution</h3>
          <p className="text-xs text-gray-400 mb-4">By provider</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={mockPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {mockPie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {mockPie.map(p => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: p.color }}></div>
                  <span className="text-sm text-gray-300">{p.name}</span>
                </div>
                <span className="text-sm font-medium text-white">${p.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-1">Cost by Service</h3>
          <p className="text-xs text-gray-400 mb-4">Azure vs GCP breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockServices} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Bar dataKey="azure" name="Azure" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gcp" name="GCP" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Alerts</h3>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">2 new</span>
          </div>
          <div className="space-y-3">
            {mockAlerts.map(a => (
              <div key={a.id} className="flex gap-3 p-3 rounded-lg bg-gray-800/50">
                <span className="text-lg mt-0.5">
                  {a.type === 'error' ? '🔴' : a.type === 'warning' ? '🟡' : '🔵'}
                </span>
                <div>
                  <p className="text-xs text-gray-200">{a.msg}</p>
                  <p className="text-xs text-gray-500 mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Resources Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Top Resources by Cost</h3>
            <p className="text-xs text-gray-400">Current month</p>
          </div>
          <button className="text-xs text-blue-400 hover:text-blue-300">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left pb-3 font-medium">Resource</th>
                <th className="text-left pb-3 font-medium">Provider</th>
                <th className="text-right pb-3 font-medium">Cost</th>
                <th className="text-right pb-3 font-medium">Change</th>
                <th className="text-right pb-3 font-medium">Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {mockTopResources.map((r, i) => (
                <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 text-white font-medium">{r.name}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.provider === 'Azure' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                      {r.provider}
                    </span>
                  </td>
                  <td className="py-3 text-right text-white">${r.cost.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <span className={r.change >= 0 ? 'text-red-400' : 'text-green-400'}>
                      {r.change >= 0 ? '+' : ''}{r.change}%
                    </span>
                  </td>
                  <td className="py-3 text-right w-24">
                    <div className="bg-gray-800 rounded-full h-1.5 w-full">
                      <div
                        className={`h-1.5 rounded-full ${r.provider === 'Azure' ? 'bg-blue-500' : 'bg-green-500'}`}
                        style={{ width: `${(r.cost / 3000) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
