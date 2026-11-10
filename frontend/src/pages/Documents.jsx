import React, { useState, useEffect, useRef } from 'react';
import { FiUpload, FiSearch, FiTrash2, FiEye, FiDownload, FiX, FiFile, FiCheckCircle } from 'react-icons/fi';
import { documentAPI, getErrorMessage } from '../services/api';

const typeIcon = { PDF:'📄', DOCX:'📝', XLSX:'📊', PPTX:'📋', PNG:'🖼️', JPG:'🖼️', TXT:'📃' };
const statusColor = { processed:'#22c55e', processing:'#f59e0b', failed:'#ef4444' };
const statusLabel = { processed:'Ready', processing:'Processing', failed:'Error' };

function UploadModal({ onClose, onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [file,     setFile]     = useState(null);
  const [uploading,setUploading]= useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState('');
  const inputRef = useRef(null);

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await documentAPI.upload(formData);
      setDone(true);
      onUpload(data);
      setTimeout(onClose, 1400);
    } catch (err) { setError(getErrorMessage(err)); }
    finally      { setUploading(false); }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width:'100%', maxWidth:500, background:'#0f172a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:32 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'white', margin:0 }}>Upload Document</h2>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', cursor:'pointer' }}><FiX size={16} /></button>
        </div>
        {done ? (
          <div style={{ textAlign:'center', padding:'32px 0' }}>
            <FiCheckCircle size={52} style={{ color:'#22c55e', marginBottom:14 }} />
            <div style={{ fontSize:16, fontWeight:600, color:'white' }}>Upload successful!</div>
          </div>
        ) : (
          <>
            {error && <div style={{ padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, color:'#ef4444', fontSize:13, marginBottom:16 }}>{error}</div>}
            <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              style={{ border:`2px dashed ${dragging?'#2563eb':file?'#22c55e':'rgba(255,255,255,0.12)'}`, borderRadius:14, padding:'40px 24px', textAlign:'center', cursor:'pointer', marginBottom:20, transition:'all 0.2s', background:dragging?'rgba(37,99,235,0.06)':file?'rgba(34,197,94,0.04)':'rgba(255,255,255,0.02)' }}>
              <input ref={inputRef} type="file" style={{ display:'none' }} onChange={(e) => setFile(e.target.files[0])} />
              {file ? (
                <>
                  <div style={{ fontSize:36, marginBottom:10 }}>{typeIcon[file.name.split('.').pop()?.toUpperCase()]||'📄'}</div>
                  <div style={{ fontSize:15, fontWeight:600, color:'white', marginBottom:4 }}>{file.name}</div>
                  <div style={{ fontSize:13, color:'#64748b' }}>{(file.size/1024).toFixed(0)} KB</div>
                </>
              ) : (
                <>
                  <FiUpload size={40} style={{ color:'#475569', marginBottom:12 }} />
                  <div style={{ fontSize:15, fontWeight:600, color:'white', marginBottom:6 }}>Drop file here or click to browse</div>
                  <div style={{ fontSize:12, color:'#475569' }}>PDF, DOCX, XLSX, TXT, PNG, JPG up to 50 MB</div>
                </>
              )}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={onClose} style={{ flex:1, padding:12, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#94a3b8', fontWeight:500, fontSize:14, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleUpload} disabled={!file||uploading} style={{ flex:2, padding:12, background:'linear-gradient(135deg,#2563eb,#7c3aed)', border:'none', borderRadius:10, color:'white', fontWeight:600, fontSize:14, cursor:file&&!uploading?'pointer':'not-allowed', opacity:!file||uploading?0.6:1 }}>
                {uploading?'Uploading…':'Upload Document'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Documents() {
  const [docs,       setDocs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [toast,      setToast]      = useState('');
  const [search,     setSearch]     = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [viewDoc,    setViewDoc]    = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const fetchDocs = () => {
      documentAPI.list()
        .then(({ data }) => setDocs(data))
        .catch((err)     => setError(getErrorMessage(err)))
        .finally(()      => setLoading(false));
    };

    fetchDocs();

    // Poll every 3 seconds if there are any documents in processing state
    const interval = setInterval(() => {
      const hasProcessing = docs.some(d => d.status === 'processing');
      if (hasProcessing) {
        fetchDocs();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [docs]);

  const handleUpload = (doc) => setDocs((p) => [doc, ...p]);

  const handleDelete = async (id) => {
    try {
      await documentAPI.delete(id);
      setDocs((p) => p.filter((d) => d.id !== id));
      showToast('Document deleted.');
    } catch (err) { showToast(getErrorMessage(err)); }
  };

  const filtered = docs.filter((d) => !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.type?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:26, flexWrap:'wrap', gap:14 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:'white', background:'linear-gradient(135deg,#fff,#94a3b8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', margin:'0 0 5px' }}>Documents</h1>
          <p style={{ color:'#64748b', fontSize:14, margin:0 }}>{docs.length} files · Upload and manage enterprise documents</p>
        </div>
        <button onClick={() => setShowUpload(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'linear-gradient(135deg,#2563eb,#7c3aed)', border:'none', borderRadius:10, color:'white', fontWeight:600, fontSize:14, cursor:'pointer' }}>
          <FiUpload size={16} /> Upload Document
        </button>
      </div>

      {error && <div style={{ padding:'11px 16px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, color:'#ef4444', fontSize:13, marginBottom:18 }}>{error}</div>}
      {toast && <div style={{ padding:'11px 16px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:10, color:'#22c55e', fontSize:13, marginBottom:18 }}>✅ {toast}</div>}

      <div style={{ position:'relative', marginBottom:20 }}>
        <FiSearch size={17} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748b' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..." style={{ width:'100%', padding:'12px 16px 12px 44px', background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color:'white', fontSize:14, outline:'none' }} />
        {search && <button onClick={() => setSearch('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color:'#64748b', cursor:'pointer', display:'flex' }}><FiX size={16} /></button>}
      </div>

      <div style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 90px 160px 110px 110px', gap:0, padding:'12px 22px', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:12, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:0.5 }}>
          <span>Name</span><span>Type</span><span style={{ whiteSpace:'nowrap' }}>Uploaded By</span><span style={{ whiteSpace:'nowrap' }}>Status</span><span style={{ textAlign:'right' }}>Actions</span>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'50px 20px', color:'#64748b' }}>Loading documents…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'50px 20px', color:'#64748b' }}>
            <FiFile size={36} style={{ marginBottom:12, opacity:0.4 }} />
            <div style={{ fontSize:15, color:'#94a3b8', marginBottom:5 }}>No documents found</div>
          </div>
        ) : (
          filtered.map((doc, idx) => {
            const sc = statusColor[doc.status] || '#64748b';
            const ext = (doc.name?.split('.').pop() || doc.type || '').toUpperCase();
            return (
              <div key={doc.id} style={{ display:'grid', gridTemplateColumns:'1fr 90px 160px 110px 110px', gap:0, padding:'16px 22px', borderBottom:idx<filtered.length-1?'1px solid rgba(255,255,255,0.04)':'none', alignItems:'center', transition:'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background='transparent'}>
                <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:'rgba(37,99,235,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                    {typeIcon[ext]||'📄'}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.name}</div>
                    <div style={{ fontSize:12, color:'#475569' }}>{doc.size ? `${(doc.size/1024).toFixed(0)} KB` : ''}</div>
                  </div>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:'#64748b', background:'rgba(255,255,255,0.05)', padding:'3px 10px', borderRadius:6, whiteSpace:'nowrap' }}>{ext}</span>
                <span style={{ fontSize:13, color:'#94a3b8', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%' }}>{doc.uploadedBy || '—'}</span>
                <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, color:sc, background:`${sc}14`, padding:'4px 10px', borderRadius:20, whiteSpace:'nowrap' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:sc, display:'inline-block', animation:doc.status==='processing'?'pulse 1.5s infinite':'none' }} />
                  {statusLabel[doc.status]||'Unknown'}
                </span>
                <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                  <button onClick={() => setViewDoc(doc)} title="View" style={{ width:30, height:30, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><FiEye size={13} /></button>
                  <button onClick={() => showToast(`Downloading "${doc.name}"…`)} title="Download" style={{ width:30, height:30, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><FiDownload size={13} /></button>
                  <button onClick={() => handleDelete(doc.id)} title="Delete" style={{ width:30, height:30, borderRadius:7, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><FiTrash2 size={13} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
    </div>
  );
}
