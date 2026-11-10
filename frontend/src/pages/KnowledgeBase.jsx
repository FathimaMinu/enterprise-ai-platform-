import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiBook } from 'react-icons/fi';
import { knowledgeBaseAPI, getErrorMessage } from '../services/api';

const CATEGORIES = ['All', 'HR', 'IT', 'Finance', 'General', 'Operations', 'Legal'];
const categoryColor = { HR:'#7c3aed', IT:'#2563eb', Finance:'#22c55e', General:'#f59e0b', Operations:'#06b6d4', Legal:'#ef4444' };

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width:'100%', maxWidth:600, background:'#0f172a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:32, maxHeight:'90vh', overflowY:'auto', animation:'fadeIn 0.2s ease' }}>
        {children}
      </div>
    </div>
  );
}

export default function KnowledgeBase() {
  const [articles, setArticles]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [error,    setError]        = useState('');
  const [toast,    setToast]        = useState('');
  const [search,   setSearch]       = useState('');
  const [category, setCategory]     = useState('All');
  const [viewItem, setViewItem]     = useState(null);
  const [editItem, setEditItem]     = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [form,     setForm]         = useState({ title:'', category:'HR', content:'' });
  const [saving,   setSaving]       = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchArticles = useCallback(async () => {
    try {
      const { data } = await knowledgeBaseAPI.list({ category: category !== 'All' ? category : undefined, size: 100 });
      setArticles(data.content ?? data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const filtered = articles.filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew  = () => { setEditItem(null); setForm({ title:'', category:'HR', content:'' }); setShowForm(true); };
  const openEdit = (a) => { setEditItem(a); setForm({ title:a.title, category:a.category, content:a.content }); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await knowledgeBaseAPI.delete(id);
      setArticles((p) => p.filter((a) => a.id !== id));
      showToast('Article deleted.');
    } catch (err) { showToast(getErrorMessage(err)); }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      if (editItem) {
        const { data } = await knowledgeBaseAPI.update(editItem.id, form);
        setArticles((p) => p.map((a) => a.id === editItem.id ? data : a));
      } else {
        const { data } = await knowledgeBaseAPI.create(form);
        setArticles((p) => [data, ...p]);
      }
      setShowForm(false);
      showToast(editItem ? 'Article updated.' : 'Article created.');
    } catch (err) { showToast(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const iStyle = { width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'white', fontSize:14, outline:'none', fontFamily:'inherit' };

  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:26, flexWrap:'wrap', gap:14 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:'white', background:'linear-gradient(135deg,#fff,#94a3b8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', margin:'0 0 5px' }}>Knowledge Base</h1>
          <p style={{ color:'#64748b', fontSize:14, margin:0 }}>{articles.length} articles · AI-powered enterprise knowledge</p>
        </div>
        <button onClick={openNew} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'linear-gradient(135deg,#2563eb,#7c3aed)', border:'none', borderRadius:10, color:'white', fontWeight:600, fontSize:14, cursor:'pointer' }}>
          <FiPlus size={16} /> New Article
        </button>
      </div>

      {error && <div style={{ padding:'11px 16px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, color:'#ef4444', fontSize:13, marginBottom:18 }}>{error}</div>}
      {toast && <div style={{ padding:'11px 16px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:10, color:'#22c55e', fontSize:13, marginBottom:18 }}>✅ {toast}</div>}

      <div style={{ position:'relative', marginBottom:16 }}>
        <FiSearch size={17} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748b' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." style={{ width:'100%', padding:'12px 16px 12px 44px', background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color:'white', fontSize:14, outline:'none' }} />
        {search && <button onClick={() => setSearch('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color:'#64748b', cursor:'pointer', display:'flex' }}><FiX size={16} /></button>}
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:22 }}>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding:'6px 16px', borderRadius:20, fontSize:13, fontWeight:500, cursor:'pointer', border:`1px solid ${category===c?'rgba(37,99,235,0.5)':'rgba(255,255,255,0.08)'}`, background:category===c?'rgba(37,99,235,0.15)':'rgba(255,255,255,0.03)', color:category===c?'#60a5fa':'#94a3b8', transition:'all 0.15s' }}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#64748b' }}>Loading articles…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#64748b' }}>
          <FiBook size={40} style={{ marginBottom:14, opacity:0.4 }} />
          <div style={{ fontSize:16, color:'#94a3b8', marginBottom:6 }}>No articles found</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
          {filtered.map((article) => {
            const color = categoryColor[article.category] || '#64748b';
            return (
              <div key={article.id} style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:22, display:'flex', flexDirection:'column', gap:12, transition:'border-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <span style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600, background:`${color}1a`, color, textTransform:'uppercase', letterSpacing:0.5 }}>{article.category}</span>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => setViewItem(article)} style={{ width:30, height:30, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><FiEye size={13} /></button>
                    <button onClick={() => openEdit(article)} style={{ width:30, height:30, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><FiEdit2 size={13} /></button>
                    <button onClick={() => handleDelete(article.id)} style={{ width:30, height:30, borderRadius:7, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><FiTrash2 size={13} /></button>
                  </div>
                </div>
                <h3 style={{ fontSize:15, fontWeight:600, color:'white', margin:0, lineHeight:1.4, cursor:'pointer' }} onClick={() => setViewItem(article)}>{article.title}</h3>
                <p style={{ fontSize:13, color:'#64748b', margin:0, lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{article.content}</p>
                <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.04)', fontSize:12, color:'#475569' }}>
                  <span>{article.views ?? 0} views</span>
                  <span>{article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)}>
        {viewItem && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <span style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600, background:`${categoryColor[viewItem.category]||'#64748b'}1a`, color:categoryColor[viewItem.category]||'#64748b', textTransform:'uppercase' }}>{viewItem.category}</span>
              <button onClick={() => setViewItem(null)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', cursor:'pointer' }}><FiX size={16} /></button>
            </div>
            <h2 style={{ fontSize:22, fontWeight:700, color:'white', marginBottom:16 }}>{viewItem.title}</h2>
            <p style={{ fontSize:14, color:'#94a3b8', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{viewItem.content}</p>
          </>
        )}
      </Modal>

      {/* Edit/Create Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'white', margin:0 }}>{editItem ? 'Edit Article' : 'New Article'}</h2>
          <button onClick={() => setShowForm(false)} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', cursor:'pointer' }}><FiX size={16} /></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:6 }}>Title *</label>
            <input value={form.title} onChange={(e) => setForm((p) => ({...p,title:e.target.value}))} placeholder="Article title" style={iStyle} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:6 }}>Category *</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({...p,category:e.target.value}))} style={{ ...iStyle, cursor:'pointer' }}>
              {['HR','IT','Finance','General','Operations','Legal'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontSize:13, color:'#94a3b8', fontWeight:500, marginBottom:6 }}>Content *</label>
            <textarea value={form.content} onChange={(e) => setForm((p) => ({...p,content:e.target.value}))} rows={7} style={{ ...iStyle, resize:'vertical', minHeight:140 }} />
          </div>
          <div style={{ display:'flex', gap:10, marginTop:6 }}>
            <button onClick={() => setShowForm(false)} style={{ flex:1, padding:12, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#94a3b8', fontWeight:500, fontSize:14, cursor:'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex:1, padding:12, background:'linear-gradient(135deg,#2563eb,#7c3aed)', border:'none', borderRadius:10, color:'white', fontWeight:600, fontSize:14, cursor:'pointer', opacity:saving?0.7:1 }}>
              {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Create Article'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
