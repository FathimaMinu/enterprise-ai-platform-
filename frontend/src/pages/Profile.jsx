import React, { useState, useRef } from 'react';
import { FiCamera, FiCheck, FiShield, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase } from 'react-icons/fi';
import Toggle from '../components/common/Toggle';
import { useAuth } from '../context/AuthContext';
import { profileAPI, getErrorMessage } from '../services/api';

const iStyle = { width:'100%', padding:'11px 14px 11px 40px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'white', fontSize:14, outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' };
const focus = (e) => e.target.style.borderColor='#2563eb';
const blur  = (e) => e.target.style.borderColor='rgba(255,255,255,0.1)';

function IconInput({ icon: Icon, ...props }) {
  return (
    <div style={{ position:'relative' }}>
      <Icon size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#475569', pointerEvents:'none' }} />
      <input {...props} style={iStyle} onFocus={focus} onBlur={blur} />
    </div>
  );
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name:       user?.name       || '',
    email:      user?.email      || '',
    phone:      user?.phone      || '',
    bio:        user?.bio        || '',
    company:    user?.company    || '',
    location:   user?.location   || '',
    department: user?.department || 'Technology',
  });
  const [passwords, setPasswords]     = useState({ current:'', next:'', confirm:'' });
  const [twoFA,     setTwoFA]         = useState(false);
  const [saved,     setSaved]         = useState('');
  const [pwError,   setPwError]       = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);

  const set  = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setPw = (k) => (e) => setPasswords((p) => ({ ...p, [k]: e.target.value }));

  const handleAvatarChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data } = await profileAPI.update(form);
      updateProfile(data);
      setSaved('profile');
      setTimeout(() => setSaved(''), 3000);
    } catch (err) { alert(getErrorMessage(err)); }
    finally { setSavingProfile(false); }
  };

  const handleSavePassword = async () => {
    setPwError('');
    if (!passwords.current) return setPwError('Enter your current password.');
    if (passwords.next.length < 8) return setPwError('New password must be at least 8 characters.');
    if (passwords.next !== passwords.confirm) return setPwError('Passwords do not match.');
    setSavingPw(true);
    try {
      await profileAPI.changePassword({ currentPassword:passwords.current, newPassword:passwords.next });
      setPasswords({ current:'', next:'', confirm:'' });
      setSaved('password');
      setTimeout(() => setSaved(''), 3000);
    } catch (err) { setPwError(getErrorMessage(err)); }
    finally { setSavingPw(false); }
  };

  const initials = form.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      <div style={{ marginBottom:26 }}>
        <h1 style={{ fontSize:26, fontWeight:700, color:'white', background:'linear-gradient(135deg,#fff,#94a3b8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', margin:'0 0 5px' }}>Profile</h1>
        <p style={{ color:'#64748b', fontSize:14, margin:0 }}>Manage your account information and security settings</p>
      </div>

      {saved==='profile'  && <div style={{ padding:'11px 16px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:10, color:'#22c55e', fontSize:13, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}><FiCheck size={15}/> Profile saved.</div>}
      {saved==='password' && <div style={{ padding:'11px 16px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:10, color:'#22c55e', fontSize:13, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}><FiCheck size={15}/> Password updated.</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:22 }}>
        {/* Left column */}
        <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
          {/* Avatar card */}
          <div style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:22 }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="Avatar" style={{ width:80, height:80, borderRadius:18, objectFit:'cover', border:'3px solid rgba(37,99,235,0.3)' }} />
                  : <div style={{ width:80, height:80, borderRadius:18, background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:28, color:'white', border:'3px solid rgba(37,99,235,0.3)' }}>{initials}</div>
                }
                <button onClick={() => fileRef.current?.click()} style={{ position:'absolute', bottom:-6, right:-6, width:28, height:28, borderRadius:'50%', background:'#2563eb', border:'2px solid #0f172a', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <FiCamera size={12} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarChange} />
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:700, color:'white', marginBottom:4 }}>{form.name||'Your Name'}</div>
                <div style={{ fontSize:13, color:'#64748b', marginBottom:6 }}>{user?.role||'User'}</div>
                <span style={{ fontSize:11, fontWeight:600, color:'#22c55e', background:'rgba(34,197,94,0.1)', padding:'3px 10px', borderRadius:12 }}>● Active</span>
              </div>
            </div>
          </div>

          {/* Security card */}
          <div style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:28 }}>
            <h3 style={{ fontSize:16, fontWeight:600, color:'white', margin:'0 0 20px', display:'flex', alignItems:'center', gap:8 }}>
              <FiShield size={16} style={{ color:'#2563eb' }} /> Security
            </h3>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', marginBottom:20 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:500, color:'white', marginBottom:3 }}>Two-Factor Authentication</div>
                <div style={{ fontSize:12, color:'#64748b' }}>Extra layer of security for your account</div>
              </div>
              <Toggle on={twoFA} onChange={setTwoFA} />
            </div>

            {pwError && <div style={{ padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, color:'#ef4444', fontSize:13, marginBottom:16 }}>{pwError}</div>}

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['Current Password','current'],['New Password','next'],['Confirm New Password','confirm']].map(([label,key]) => (
                <div key={key}>
                  <label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:6 }}>{label}</label>
                  <div style={{ position:'relative' }}>
                    <FiShield size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                    <input type="password" value={passwords[key]} onChange={setPw(key)} placeholder="••••••••" style={iStyle} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
              ))}
              <button onClick={handleSavePassword} disabled={savingPw} style={{ padding:'11px 22px', background:'linear-gradient(135deg,#2563eb,#7c3aed)', border:'none', borderRadius:10, color:'white', fontWeight:600, fontSize:14, cursor:'pointer', opacity:savingPw?0.7:1 }}>
                {savingPw?'Updating…':'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: personal info */}
        <div style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:28, height:'fit-content' }}>
          <h3 style={{ fontSize:16, fontWeight:600, color:'white', margin:'0 0 22px', display:'flex', alignItems:'center', gap:8 }}>
            <FiUser size={16} style={{ color:'#2563eb' }} /> Personal Information
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div><label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:7 }}>Full Name</label><IconInput icon={FiUser} value={form.name} onChange={set('name')} placeholder="Your full name" /></div>
            <div><label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:7 }}>Email Address</label><IconInput icon={FiMail} type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div><label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:7 }}>Phone</label><IconInput icon={FiPhone} value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" /></div>
              <div><label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:7 }}>Location</label><IconInput icon={FiMapPin} value={form.location} onChange={set('location')} placeholder="City, Country" /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div><label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:7 }}>Company</label><IconInput icon={FiBriefcase} value={form.company} onChange={set('company')} placeholder="Your company" /></div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:7 }}>Department</label>
                <div style={{ position:'relative' }}>
                  <FiBriefcase size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                  <select value={form.department} onChange={set('department')} style={{ ...iStyle, cursor:'pointer' }}>
                    {['Technology','HR','Finance','Operations','Marketing','Legal','Sales'].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:7 }}>Bio</label>
              <textarea value={form.bio} onChange={set('bio')} placeholder="Brief professional bio…" rows={3}
                style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'white', fontSize:14, outline:'none', fontFamily:'inherit', resize:'vertical' }}
                onFocus={focus} onBlur={blur} />
            </div>
            <button onClick={handleSaveProfile} disabled={savingProfile} style={{ padding:'12px 24px', background:'linear-gradient(135deg,#2563eb,#7c3aed)', border:'none', borderRadius:10, color:'white', fontWeight:600, fontSize:14, cursor:'pointer', opacity:savingProfile?0.7:1 }}>
              {savingProfile?'Saving…':'Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
