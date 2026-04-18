'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://13.71.54.206:4000/api';
const token = () => localStorage.getItem('token') || '';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name: '', amount: '', period: 'MONTHLY', threshold: '80' });

  useEffect(() => { fetchBudgets(); }, []);

  const fetchBudgets = () => {
    fetch(`${API}/budgets`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setBudgets(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch(`${API}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          name: form.name,
          amount: parseFloat(form.amount),
          period: form.period,
          threshold: parseInt(form.threshold),
          startDate: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('✅ Budget created!');
        setForm({ name: '', amount: '', period: 'MONTHLY', threshold: '80' });
        setShowForm(false);
        fetchBudgets();
      } else {
        setMsg('❌ ' + (data.error || 'Failed to create budget'));
      }
    } catch (e: any) { setMsg('❌ ' + e.message); }
    setSaving(false);
  };

  const input = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500';
  const label = 'block text-sm text-gray-400 mb-1';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Budgets</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium">
          + Create Budget
        </button>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
          {msg}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4">New Budget</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={label}>Budget Name</label>
              <input className={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Monthly Azure Budget" required />
            </div>
            <div>
              <label className={label}>Amount ($)</label>
              <input type="number" className={input} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="5000" required />
            </div>
            <div>
              <label className={label}>Period</label>
              <select className={input} value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className={label}>Alert Threshold (%)</label>
              <input type="number" className={input} value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} placeholder="80" min="1" max="100" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${saving ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {saving ? 'Saving...' : 'Create Budget'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      {loading ? <p className="text-gray-400">Loading...</p> : budgets.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <p className="text-4xl mb-4">🎯</p>
          <p className="text-white font-semibold mb-2">No budgets yet</p>
          <p className="text-gray-400 text-sm">Create a budget to track and control your cloud spending</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {budgets.map((b: any) => {
            const pct = Math.min((Number(b.spent || 0) / Number(b.amount)) * 100, 100);
            const over = pct >= b.threshold;
            return (
              <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.period} · Alert at {b.threshold}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${Number(b.amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">budget</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-full h-2 mb-2">
                  <div className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>${Number(b.spent || 0).toLocaleString()} spent</span>
                  <span className={over ? 'text-red-400' : ''}>{pct.toFixed(1)}% used</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
