import React, { useState, useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';
import Toggle from '../components/common/Toggle';
import { settingsAPI, getErrorMessage } from '../services/api';

const TABS = ['General', 'Security', 'Notifications', 'Integrations'];

const INTEGRATIONS = [
  { key:'slack',      name:'Slack',            icon:'💬', desc:'Send alerts and AI responses to Slack channels' },
  { key:'teams',      name:'Microsoft Teams',  icon:'🟦', desc:'Integrate with Teams for real-time collaboration' },
  { key:'google',     name:'Google Workspace', icon:'🔵', desc:'Connect Drive, Calendar, and Gmail' },
  { key:'jira',       name:'Jira',             icon:'🟠', desc:'Auto-create tickets from AI conversations' },
  { key:'github',     name:'GitHub',           icon:'⚫', desc:'Surface code documentation in your knowledge base' },
  { key:'salesforce', name:'Salesforce',       icon:'☁️', desc:'Sync CRM data and customer documents' },
];

const iStyle = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'white', fontSize:14, outline:'none', fontFamily:'inherit', cursor:'text', transition:'border-color 0.2s' };

export default function Settings() {
  const [tab,     setTab]     = useState('General');
  const [form,    setForm]    = useState(null);
  const [integ,   setInteg]   = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    settingsAPI.get()
      .then(({ data }) => {
        setForm(data);
        setInteg({ slack:data.slackEnabled??false, teams:data.teamsEnabled??false,
                   google:data.googleEnabled??false, jira:data.jiraEnabled??false,
                   github:data.githubEnabled??false, salesforce:data.salesforceEnabled??false });
      })
      .catch(() => {
        // Fallback defaults while backend is starting
        setForm({ companyName:'My Company', timezone:'America/New_York', language:'en', dateFormat:'MM/DD/YYYY',
                  twoFactorEnabled:false, sessionTimeout:30, passwordExpiry:90, ipWhitelist:false,
                  emailAlerts:true, pushNotifications:true, weeklyDigest:true, queryAlerts:false, securityAlerts:true });
        setInteg({ slack:false, teams:false, google:false, jira:false, github:false, salesforce:false });
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target?.value ?? e }));
  const setToggle = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await settingsAPI.update(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'#64748b' }}>Loading settings…</div>;

  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      <div style={{ marginBottom:26 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:'white', background:'linear-gradient(135deg,#fff,#94a3b8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', margin:'0 0 5px' }}>Settings</h1>
        <p style={{ color:'#64748b', fontSize:14, margin:0 }}>Manage your platform configuration and preferences</p>
      </div>

      {saved  && <div style={{ padding:'11px 16px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:10, color:'#22c55e', fontSize:13, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}><FiCheck size={15}/> Settings saved.</div>}
      {error  && <div style={{ padding:'11px 16px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, color:'#ef4444', fontSize:13, marginBottom:20 }}>{error}</div>}

      <div style={{ display:'flex', gap:4, borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:24 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'10px 18px', borderRadius:'8px 8px 0 0', border:'none', borderBottom:`2px solid ${tab===t?'#2563eb':'transparent'}`, background:tab===t?'rgba(37,99,235,0.08)':'transparent', color:tab===t?'#60a5fa':'#94a3b8', fontSize:14, fontWeight:tab===t?600:400, cursor:'pointer', marginBottom:-1, transition:'all 0.15s' }}>{t}</button>
        ))}
      </div>

      <div style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:28 }}>
        {tab === 'General' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <h3 style={{ fontSize:15, fontWeight:600, color:'white', margin:0 }}>General Settings</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[['Company Name','companyName','text'],['Date Format','dateFormat','text']].map(([label,key,type]) => (
                <div key={key}>
                  <label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:6 }}>{label}</label>
                  <input type={type} value={form[key]||''} onChange={set(key)} style={iStyle}
                    onFocus={(e)=>e.target.style.borderColor='#2563eb'} onBlur={(e)=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:6 }}>Timezone</label>
                <select value={form.timezone||'America/New_York'} onChange={set('timezone')} style={{ ...iStyle, cursor:'pointer' }}>
                  {['America/New_York','America/Chicago','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Tokyo','Asia/Kolkata'].map((tz) => <option key={tz}>{tz}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:6 }}>Language</label>
                <select value={form.language||'en'} onChange={set('language')} style={{ ...iStyle, cursor:'pointer' }}>
                  {[['en','English'],['es','Spanish'],['fr','French'],['de','German'],['pt','Portuguese']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {tab === 'Security' && (
          <div>
            <h3 style={{ fontSize:15, fontWeight:600, color:'white', margin:'0 0 20px' }}>Security Settings</h3>
            {[['Two-Factor Authentication','twoFactorEnabled','Require 2FA for all logins'],['IP Whitelist','ipWhitelist','Restrict access to approved IPs only']].map(([label,key,desc]) => (
              <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <div><div style={{ fontSize:14, fontWeight:500, color:'white', marginBottom:3 }}>{label}</div><div style={{ fontSize:13, color:'#64748b' }}>{desc}</div></div>
                <Toggle on={!!form[key]} onChange={setToggle(key)} />
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
              {[['Session Timeout (min)','sessionTimeout'],['Password Expiry (days)','passwordExpiry']].map(([label,key]) => (
                <div key={key}>
                  <label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:6 }}>{label}</label>
                  <input type="number" value={form[key]||''} onChange={set(key)} style={iStyle}
                    onFocus={(e)=>e.target.style.borderColor='#2563eb'} onBlur={(e)=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Notifications' && (
          <div>
            <h3 style={{ fontSize:15, fontWeight:600, color:'white', margin:'0 0 6px' }}>Notification Preferences</h3>
            {[['emailAlerts','Email Alerts','Important platform alerts and summaries'],['pushNotifications','Push Notifications','Browser push notifications for real-time updates'],['weeklyDigest','Weekly Digest','Curated activity summary every Monday'],['queryAlerts','AI Query Alerts','Notify on failed or flagged AI queries'],['securityAlerts','Security Alerts','Immediate alerts for suspicious login attempts']].map(([key,label,desc]) => (
              <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <div><div style={{ fontSize:14, fontWeight:500, color:'white', marginBottom:3 }}>{label}</div><div style={{ fontSize:13, color:'#64748b' }}>{desc}</div></div>
                <Toggle on={!!form[key]} onChange={setToggle(key)} />
              </div>
            ))}
          </div>
        )}

        {tab === 'Integrations' && (
          <div>
            <h3 style={{ fontSize:15, fontWeight:600, color:'white', margin:'0 0 20px' }}>Connected Integrations</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {INTEGRATIONS.map(({ key, name, icon, desc }) => (
                <div key={key} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 18px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14 }}>
                  <div style={{ fontSize:28, width:44, textAlign:'center', flexShrink:0 }}>{icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'white', marginBottom:3 }}>{name}</div>
                    <div style={{ fontSize:12, color:'#64748b' }}>{desc}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:12, color:integ[key]?'#22c55e':'#475569' }}>{integ[key]?'Connected':'Not connected'}</span>
                    <Toggle on={!!integ[key]} onChange={(v) => setInteg((p) => ({ ...p, [key]:v }))} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop:28, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:10 }}>
          <button onClick={handleSave} disabled={saving} style={{ padding:'11px 28px', background:'linear-gradient(135deg,#2563eb,#7c3aed)', border:'none', borderRadius:10, color:'white', fontWeight:600, fontSize:14, cursor:'pointer', opacity:saving?0.7:1 }}>
            {saving?'Saving…':'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
