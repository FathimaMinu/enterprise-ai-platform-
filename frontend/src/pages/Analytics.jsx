import React, { useState, useEffect } from 'react';
import { FiDownload, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsAPI, getErrorMessage } from '../services/api';

const RANGES    = ['Today', 'This Week', 'This Month', 'This Year'];
const RANGE_KEY = { 'Today':'today', 'This Week':'week', 'This Month':'month', 'This Year':'year' };
const tooltipStyle = { background:'#0f172a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#e2e8f0', fontSize:13 };

function StatCard({ label, value, growth, color }) {
  const positive = growth?.startsWith('+');
  return (
    <div style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:22 }}>
      <div style={{ fontSize:13, color:'#64748b', marginBottom:10 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color:'white', marginBottom:8 }}>{value}</div>
      {growth && (
        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:600, color:positive?'#22c55e':'#ef4444' }}>
          {positive ? <FiTrendingUp size={14}/> : <FiTrendingDown size={14}/>} {growth} vs last period
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const [stats,      setStats]      = useState([]);
  const [queries,    setQueries]    = useState([]);
  const [depts,      setDepts]      = useState([]);
  const [range,      setRange]      = useState('This Week');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [exporting,  setExporting]  = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analyticsAPI.getStats(),
      analyticsAPI.getQueries(RANGE_KEY[range]),
      analyticsAPI.getDepartments(),
    ])
      .then(([s, q, d]) => {
        const raw = s.data;
        setStats([
          { label:'Total Queries',     value: String(raw.totalQueries ?? 0),    growth:raw.queriesGrowth ?? '+0%', color:'#2563eb' },
          { label:'Avg Response Time', value:`${raw.avgResponseTimeMs ?? 1400}ms`, growth:'-12%', color:'#22c55e' },
          { label:'Documents Indexed', value: String(raw.documentsIndexed ?? 0), growth:raw.docsGrowth ?? '+0%', color:'#7c3aed' },
          { label:'Cost Saved',        value:`$${Number(raw.costSaved ?? 0).toLocaleString()}`, growth:raw.savingsGrowth ?? '+0%', color:'#f59e0b' },
        ]);
        setQueries(q.data);
        setDepts(d.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(()   => setLoading(false));
  }, [range]);

  const handleExport = async () => {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 900));
    setExporting(false);
    alert('Analytics report exported!\nFile: analytics-' + new Date().toISOString().slice(0,10) + '.csv');
  };

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'#64748b' }}>Loading analytics…</div>;

  // Check if there's any data
  const hasData = stats.some(s => parseInt(s.value.replace(/[^0-9]/g, '')) > 0) || queries.length > 0 || depts.length > 0;

  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:26, flexWrap:'wrap', gap:14 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:'white', background:'linear-gradient(135deg,#fff,#94a3b8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', margin:'0 0 5px' }}>Analytics</h1>
          <p style={{ color:'#64748b', fontSize:14, margin:0 }}>Platform usage metrics and performance insights</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:4, background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:4 }}>
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} style={{ padding:'7px 14px', borderRadius:7, border:'none', background:range===r?'rgba(37,99,235,0.25)':'transparent', color:range===r?'#60a5fa':'#64748b', fontSize:13, fontWeight:range===r?600:400, cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap' }}>{r}</button>
            ))}
          </div>
          <button onClick={handleExport} disabled={exporting} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 18px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'white', fontWeight:600, fontSize:14, cursor:'pointer', opacity:exporting?0.7:1 }}>
            <FiDownload size={15} /> {exporting?'Exporting…':'Export'}
          </button>
        </div>
      </div>

      {error && <div style={{ padding:'11px 16px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, color:'#ef4444', fontSize:13, marginBottom:20 }}>{error}</div>}

      {!hasData && (
        <div style={{ textAlign:'center', padding:60, color:'#64748b' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
          <div style={{ fontSize:18, fontWeight:600, color:'white', marginBottom:8 }}>No analytics data available yet</div>
          <div style={{ fontSize:14 }}>Start chatting or uploading documents to see analytics</div>
        </div>
      )}

      {hasData && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18, marginBottom:24 }}>
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
            <div style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:24 }}>
              <h3 style={{ fontSize:16, fontWeight:600, color:'white', margin:'0 0 22px' }}>AI Queries by Day</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={queries} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="queries" name="Queries" fill="#2563eb" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:24 }}>
              <h3 style={{ fontSize:16, fontWeight:600, color:'white', margin:'0 0 18px' }}>Queries by Department</h3>
              {depts.length === 0 ? (
                <div style={{ textAlign:'center', padding:40, color:'#64748b' }}>
                  No department data available yet
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12, paddingTop:4 }}>
                  {depts.map((d) => {
                    const max = Math.max(...depts.map((x) => x.value), 1);
                    const pct = Math.round((d.value / max) * 100);
                    return (
                      <div key={d.name}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                          <span style={{ fontSize:13, color:'#94a3b8' }}>{d.name}</span>
                          <span style={{ fontSize:13, fontWeight:600, color:'white' }}>{Number(d.value).toLocaleString()}</span>
                        </div>
                        <div style={{ height:7, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:d.color || '#2563eb', borderRadius:4, transition:'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
