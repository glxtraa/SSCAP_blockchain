"use client";

import { useState } from 'react';
import { Shield, Database, Droplets, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthorized(true);
    } else {
      alert('Invalid Password');
    }
  };

  const triggerAction = async (action) => {
    setIsLoading(true);
    setStatus({ type: 'loading', message: `Running ${action}...` });
    
    try {
      const res = await fetch(`/api/admin/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${password}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus({ type: 'success', message: `${action} completed: ${data.result}` });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans">
        <form onSubmit={handleLogin} className="w-full max-w-md p-8 bg-slate-800 rounded-xl shadow-2xl space-y-6 border border-slate-700">
          <div className="flex justify-center"><Shield className="w-12 h-12 text-blue-400" /></div>
          <h1 className="text-2xl font-bold text-center">SSCAP Admin Portal</h1>
          <input 
            type="password" 
            placeholder="Enter Admin Password" 
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-semibold transition-colors">
            Authorize Access
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">VWB Dashboard</h1>
            <p className="text-slate-400 mt-1">Blockchain Data Pipeline Control</p>
          </div>
          <Shield className="w-8 h-8 text-green-400 opacity-50" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => triggerAction('daily-anchor')}
            disabled={isLoading}
            className="group bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all text-left shadow-lg hover:shadow-blue-900/20"
          >
            <div className="bg-blue-900/30 p-4 rounded-lg w-fit group-hover:bg-blue-600 transition-colors"><Database className="w-6 h-6 text-blue-400 group-hover:text-white" /></div>
            <h2 className="text-xl font-bold mt-4">Trigger Daily Anchor</h2>
            <p className="text-slate-400 text-sm mt-2">Fetches new sensor data, bundles into Arweave, and anchors to Base EAS.</p>
          </button>

          <button 
            onClick={() => triggerAction('quarterly-oracle')}
            disabled={isLoading}
            className="group bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-indigo-500 transition-all text-left shadow-lg hover:shadow-indigo-900/20"
          >
            <div className="bg-indigo-900/30 p-4 rounded-lg w-fit group-hover:bg-indigo-600 transition-colors"><Droplets className="w-6 h-6 text-indigo-400 group-hover:text-white" /></div>
            <h2 className="text-xl font-bold mt-4">Trigger Quarterly Oracle</h2>
            <p className="text-slate-400 text-sm mt-2">Calculates Liters by basin, generates summary proof, and prepares VWB minting.</p>
          </button>
        </div>

        {status.message && (
          <div className={`p-6 rounded-xl border flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 ${
            status.type === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-200' : 
            status.type === 'success' ? 'bg-green-900/20 border-green-900/50 text-green-200' :
            'bg-blue-900/20 border-blue-900/50 text-blue-200'
          }`}>
            {status.type === 'loading' && <RefreshCw className="w-5 h-5 animate-spin" />}
            {status.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {status.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            <span className="font-medium">{status.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
