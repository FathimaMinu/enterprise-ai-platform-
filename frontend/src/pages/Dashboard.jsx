import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText, FiMessageSquare, FiUsers, FiDollarSign,
  FiArrowUpRight, FiPlus, FiUpload, FiBarChart2, FiActivity, FiSend,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, chatAPI, getErrorMessage } from '../services/api';

function StatCard({ icon: Icon, label, value, growth, color }) {
  return (
    <div style={{
      background:'rgba(15,23,42,0.7)', backdropFilter:'blur(12px)',
      border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:22,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div style={{ width:46, height:46, borderRadius:12, background:`${color}1a`, display:'flex', alignItems:'center', justifyContent:'center', color }}>
          <Icon size={22} />
        </div>
        {growth != null && (
          <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, background:'rgba(34,197,94,0.1)', color:'#22c55e', fontSize:12, fontWeight:600 }}>
            <FiArrowUpRight size={12} />+{growth}%
          </div>
        )}
      </div>
      <div style={{ color:'#64748b', fontSize:13, marginBottom:4 }}>{label}</div>
      <div style={{ color:'white', fontSize:26, fontWeight:700 }}>{value ?? '—'}</div>
    </div>
  );
}

function MiniChat() {
  const navigate = useNavigate();
  const [msg,  setMsg]  = useState('');
  const [msgs, setMsgs] = useState([
    { role:'assistant', text:"Hi! I'm your AI assistant. Ask me anything about your knowledge base." },
  ]);
  const [typing, setTyping] = useState(false);

  const send = async () => {
    if (!msg.trim() || typing) return;
    const text = msg.trim();
    setMsg('');
    setMsgs((p) => [...p, { role:'user', text }]);
    setTyping(true);
    try {
      const { data } = await chatAPI.sendMessage({ message: text });
      setMsgs((p) => [...p, { role:'assistant', text: data.response }]);
    } catch {
      setMsgs((p) => [...p, { role:'assistant', text:'Sorry, the AI service is unavailable right now.' }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'18px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ color:'white', fontWeight:600, fontSize:15 }}>AI Assistant</div>
          <div style={{ color:'#22c55e', fontSize:12, display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />Online
          </div>
        </div>
        <button onClick={() => navigate('/chat')} style={{ fontSize:12, color:'#60a5fa', background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.2)', borderRadius:8, padding:'6px 12px', cursor:'pointer' }}>
          Full Chat →
        </button>
      </div>
      <div style={{ flex:1, padding:'16px 18px', display:'flex', flexDirection:'column', gap:12, overflowY:'auto', maxHeight:200 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
            <div style={{ maxWidth:'80%', padding:'10px 14px', borderRadius:12, fontSize:13, lineHeight:1.5, background:m.role==='user'?'linear-gradient(135deg,#2563eb,#7c3aed)':'rgba(255,255,255,0.05)', color:m.role==='user'?'white':'#e2e8f0', border:m.role==='assistant'?'1px solid rgba(255,255,255,0.07)':'none' }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display:'flex', gap:5, padding:'8px 12px', background:'rgba(255,255,255,0.05)', borderRadius:12, width:56 }}>
            {[0,150,300].map((d) => <span key={d} style={{ width:7, height:7, borderRadius:'50%', background:'#64748b', display:'inline-block', animation:`typingDot 1.2s ease ${d}ms infinite` }} />)}
          </div>
        )}
      </div>
      <div style={{ padding:'12px 14px', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:8 }}>
        <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key==='Enter' && send()} placeholder="Ask anything..." style={{ flex:1, padding:'9px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'white', fontSize:13, outline:'none' }} />
        <button onClick={send} style={{ padding:'9px 14px', background:'linear-gradient(135deg,#2563eb,#7c3aed)', border:'none', borderRadius:10, color:'white', cursor:'pointer', display:'flex', alignItems:'center' }}>
          <FiSend size={15} />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    dashboardAPI.getStats()
      .then(({ data }) => setStats(data))
      .catch((err)     => setError(getErrorMessage(err)))
      .finally(()      => setLoading(false));
  }, []);

  const quickActions = [
    { label:'AI Chat',        icon:FiMessageSquare, color:'#7c3aed', action:() => navigate('/chat') },
    { label:'Upload File',    icon:FiUpload,        color:'#06b6d4', action:() => navigate('/documents') },
    { label:'View Analytics', icon:FiBarChart2,     color:'#22c55e', action:() => navigate('/analytics') },
  ];

  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, fontWeight:700, color:'white', background:'linear-gradient(135deg,#fff,#94a3b8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', margin:'0 0 6px' }}>
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p style={{ color:'#64748b', fontSize:14 }}>Here's what's happening on your platform today.</p>
      </div>

      {error && <div style={{ padding:'11px 16px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, color:'#ef4444', fontSize:13, marginBottom:20 }}>{error}</div>}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18, marginBottom:24 }}>
        <StatCard icon={FiFileText}   label="Total Documents" value={stats?.totalDocuments?.toLocaleString()} color="#2563eb" />
        <StatCard icon={FiActivity}   label="AI Queries"       value={stats?.totalChats?.toLocaleString()}    color="#7c3aed" />
        <StatCard icon={FiUsers}      label="Active Users"     value={stats?.totalEmployees?.toLocaleString()} color="#06b6d4" />
        <StatCard icon={FiDollarSign} label="Cost Saved"       value={stats ? `$${Number(stats.costSaved).toLocaleString()}` : null} color="#22c55e" />
      </div>

      {/* Quick Actions */}
      <div style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'20px 22px', marginBottom:24 }}>
        <h2 style={{ fontSize:16, fontWeight:600, color:'white', marginBottom:16 }}>Quick Actions</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {quickActions.map(({ label, icon:Icon, color, action }) => (
            <button key={label} onClick={action}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:'18px 12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, cursor:'pointer', color:'white', transition:'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background=`${color}12`; e.currentTarget.style.borderColor=`${color}40`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; }}>
              <div style={{ width:42, height:42, borderRadius:11, background:`${color}1a`, display:'flex', alignItems:'center', justifyContent:'center', color }}>
                <Icon size={20} />
              </div>
              <span style={{ fontSize:13, fontWeight:500, color:'#cbd5e1' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 400px', gap:22 }}>
        <div style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'20px 22px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
          {loading
            ? <div style={{ color:'#64748b', fontSize:14 }}>Loading…</div>
            : <div style={{ color:'#64748b', fontSize:14, textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
                <div style={{ color:'white', fontWeight:600, marginBottom:6 }}>Activity feed coming soon</div>
                Check <span style={{ color:'#60a5fa', cursor:'pointer' }} onClick={() => navigate('/analytics')}>Analytics</span> for detailed insights.
              </div>
          }
        </div>
        <MiniChat />
      </div>
    </div>
  );
}
