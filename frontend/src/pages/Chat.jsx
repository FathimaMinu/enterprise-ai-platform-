import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiPlus, FiMessageSquare, FiTrash2, FiCopy, FiCheck } from 'react-icons/fi';
import { chatAPI, getErrorMessage } from '../services/api';

const SUGGESTIONS = ['What is the vacation policy?', 'How do I reset my password?', 'Explain the expense process'];

function Bubble({ msg, onCopy, copied }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display:'flex', justifyContent:isUser?'flex-end':'flex-start', marginBottom:14, gap:10, alignItems:'flex-end' }}>
      {!isUser && <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, color:'white', flexShrink:0 }}>AI</div>}
      <div style={{ maxWidth:'72%', position:'relative' }}>
        <div style={{ padding:'12px 16px', borderRadius:isUser?'16px 16px 4px 16px':'16px 16px 16px 4px', background:isUser?'linear-gradient(135deg,#2563eb,#7c3aed)':'rgba(255,255,255,0.06)', border:isUser?'none':'1px solid rgba(255,255,255,0.08)', color:isUser?'white':'#e2e8f0', fontSize:14, lineHeight:1.6 }}>
          {msg.content}
        </div>
        <div style={{ display:'flex', justifyContent:isUser?'flex-end':'flex-start', alignItems:'center', gap:8, marginTop:4 }}>
          <span style={{ fontSize:11, color:'#475569' }}>{msg.time}</span>
          {!isUser && (
            <button onClick={() => onCopy(msg.content)} style={{ background:'transparent', border:'none', color:'#475569', cursor:'pointer', padding:2, display:'flex', alignItems:'center' }}>
              {copied?<FiCheck size={12} style={{ color:'#22c55e' }}/>:<FiCopy size={12}/>}
            </button>
          )}
        </div>
      </div>
      {isUser && <div style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>👤</div>}
    </div>
  );
}

export default function Chat() {
  const [history,    setHistory]  = useState([]);
  const [activeId,   setActiveId] = useState(null);
  const [messages,   setMessages] = useState([]);
  const [input,      setInput]    = useState('');
  const [typing,     setTyping]   = useState(false);
  const [loading,    setLoading]  = useState(true);
  const [copiedText, setCopied]   = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    chatAPI.getMessages()
      .then(({ data }) => {
        // Group flat messages into conversations — each message is its own for now
        const conv = data.slice(0, 5).map((m, i) => ({
          id:          m.id,
          title:       `Conversation ${i + 1}`,
          lastMessage: m.message,
          time:        new Date(m.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
          messages:    [
            { id:`${m.id}-u`, role:'user',      content:m.message,  time:new Date(m.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) },
            { id:`${m.id}-a`, role:'assistant', content:m.response, time:new Date(m.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) },
          ],
        }));
        setHistory(conv);
        if (conv.length > 0) { setActiveId(conv[0].id); setMessages(conv[0].messages); }
      })
      .catch(() => {
        // Backend offline — start with empty state
        setHistory([]);
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, typing]);

  const handleSend = async () => {
    if (!input.trim() || typing) return;
    const text = input.trim();
    setInput('');
    const ts = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    const userMsg = { id:Date.now(), role:'user', content:text, time:ts };
    setMessages((p) => [...p, userMsg]);
    setTyping(true);
    try {
      const { data } = await chatAPI.sendMessage({ message: text });
      const aiMsg = { id:data.messageId, role:'assistant', content:data.response, time:ts };
      setMessages((p) => [...p, aiMsg]);
      setHistory((p) => p.map((h) => h.id === activeId ? { ...h, lastMessage:text } : h));
    } catch {
      setMessages((p) => [...p, { id:Date.now()+1, role:'assistant', content:'Sorry, I encountered an error. Please try again.', time:ts }]);
    } finally {
      setTyping(false);
    }
  };

  const handleNewChat = () => {
    const id = `new-${Date.now()}`;
    const newChat = { id, title:'New Conversation', lastMessage:'Start typing…', time:'Just now', messages:[] };
    setHistory((p) => [newChat, ...p]);
    setActiveId(id);
    setMessages([{ id:1, role:'assistant', content:"Hi! I'm your Enterprise AI assistant. How can I help you today?", time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }]);
    inputRef.current?.focus();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try { await chatAPI.deleteMessage(id); } catch { /* ignore */ }
    const remaining = history.filter((h) => h.id !== id);
    setHistory(remaining);
    if (activeId === id) {
      if (remaining.length > 0) { setActiveId(remaining[0].id); setMessages(remaining[0].messages || []); }
      else { setActiveId(null); setMessages([]); }
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ display:'flex', height:'calc(100vh - 120px)', gap:20, animation:'fadeIn 0.35s ease' }}>
      {/* Sidebar */}
      <div style={{ width:270, flexShrink:0, background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'16px 14px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={handleNewChat} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 14px', background:'linear-gradient(135deg,#2563eb,#7c3aed)', border:'none', borderRadius:10, color:'white', fontWeight:600, fontSize:14, cursor:'pointer' }}>
            <FiPlus size={16} /> New Chat
          </button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'10px' }}>
          <div style={{ fontSize:11, color:'#475569', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8, padding:'6px 6px 10px' }}>
            {loading ? 'Loading…' : 'Conversations'}
          </div>
          {history.map((h) => (
            <div key={h.id} onClick={() => { setActiveId(h.id); setMessages(h.messages||[]); }}
              style={{ padding:'11px 12px', borderRadius:10, cursor:'pointer', background:activeId===h.id?'rgba(37,99,235,0.12)':'transparent', border:`1px solid ${activeId===h.id?'rgba(37,99,235,0.25)':'transparent'}`, marginBottom:3, transition:'all 0.15s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <FiMessageSquare size={13} style={{ color:activeId===h.id?'#60a5fa':'#64748b', flexShrink:0 }} />
                <span style={{ fontSize:13, fontWeight:activeId===h.id?600:400, color:activeId===h.id?'white':'#94a3b8', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1 }}>{h.title}</span>
                <button onClick={(e) => handleDelete(e, h.id)} style={{ background:'transparent', border:'none', color:'#475569', cursor:'pointer', padding:2, display:'flex' }}>
                  <FiTrash2 size={12} />
                </button>
              </div>
              <div style={{ fontSize:12, color:'#475569', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', paddingLeft:21 }}>{h.lastMessage}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex:1, background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:'white' }}>AI</div>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:'white' }}>Enterprise AI Assistant</div>
            <div style={{ fontSize:12, color:'#22c55e', display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />Online · Powered by your knowledge base
            </div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'22px 22px 8px' }}>
          {messages.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16 }}>
              <div style={{ width:64, height:64, borderRadius:16, background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:24, color:'white' }}>AI</div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:700, color:'white', marginBottom:8 }}>How can I help you today?</div>
                <div style={{ fontSize:14, color:'#64748b', maxWidth:380 }}>Ask anything about your company policies, documents, or procedures.</div>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:8 }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }} style={{ padding:'8px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, color:'#94a3b8', fontSize:13, cursor:'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => <Bubble key={msg.id} msg={msg} onCopy={handleCopy} copied={copiedText===msg.content} />)}
              {typing && (
                <div style={{ display:'flex', alignItems:'flex-end', gap:10, marginBottom:14 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, color:'white', flexShrink:0 }}>AI</div>
                  <div style={{ padding:'12px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px 16px 16px 4px', display:'flex', gap:5 }}>
                    {[0,150,300].map((d) => <span key={d} style={{ width:7, height:7, borderRadius:'50%', background:'#64748b', display:'inline-block', animation:`typingDot 1.2s ease ${d}ms infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
              rows={1}
              style={{ flex:1, padding:'12px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, color:'white', fontSize:14, outline:'none', resize:'none', maxHeight:120, fontFamily:'inherit', lineHeight:1.5 }} />
            <button onClick={handleSend} disabled={!input.trim()||typing}
              style={{ padding:'12px 16px', background:'linear-gradient(135deg,#2563eb,#7c3aed)', border:'none', borderRadius:12, color:'white', cursor:input.trim()&&!typing?'pointer':'not-allowed', opacity:!input.trim()||typing?0.5:1, display:'flex', alignItems:'center' }}>
              <FiSend size={16} />
            </button>
          </div>
          <div style={{ fontSize:11, color:'#334155', marginTop:6 }}>AI responses are based on your company knowledge base.</div>
        </div>
      </div>
    </div>
  );
}
