import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope,
  FaTwitter, FaLinkedin, FaGithub, FaSlack,
  FaPlay, FaArrowRight, FaCheck,
  FaShieldAlt, FaLock, FaServer, FaHeadset,
} from 'react-icons/fa';
import '../styles/landing.css';

/* ── data ─────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '📄', title: 'Document Intelligence',
    desc: 'Upload company documents and get instant AI-powered answers using RAG-based retrieval. Supports PDF, DOCX, XLSX, and more with semantic search.',
  },
  {
    icon: '🤖', title: 'Department AI Assistants',
    desc: 'Dedicated AI assistants for HR, IT, Finance, and Operations — each trained on your company\'s specific policies, procedures, and workflows.',
  },
  {
    icon: '⚡', title: 'Workflow Automation',
    desc: 'Auto-generate reports, meeting summaries, email drafts, and task lists. Save hours of manual work every week with intelligent automation.',
  },
];

const SOLUTIONS = [
  {
    icon: '👥', title: 'HR Automation',
    desc: 'Automate leave requests, onboarding checklists, and employee support queries. Give HR teams back their time to focus on what matters most.',
  },
  {
    icon: '💻', title: 'IT Support AI',
    desc: 'Resolve common issues instantly, auto-create tickets, and provide step-by-step troubleshooting — all without human intervention.',
  },
  {
    icon: '💰', title: 'Finance Assistant',
    desc: 'Analyze expense reports, answer finance policy queries, and extract insights from complex financial documents in seconds.',
  },
];

const PRICING = [
  {
    name: 'Starter', price: '$29', per: '/month',
    desc: 'Perfect for small teams just getting started with AI.',
    features: ['Up to 10 users', '1,000 AI queries/month', '100 documents', 'Email support', 'Basic analytics'],
    cta: 'Start Free Trial', style: 'outline',
  },
  {
    name: 'Professional', price: '$99', per: '/month', popular: true,
    desc: 'For growing companies with advanced AI needs.',
    features: ['Up to 50 users', '10,000 AI queries/month', '1,000 documents', 'Priority support', 'Advanced analytics', 'Custom workflows', 'API access'],
    cta: 'Start Free Trial', style: 'primary',
  },
  {
    name: 'Enterprise', price: 'Custom', per: '',
    desc: 'Full-scale deployment for large organizations.',
    features: ['Unlimited users', 'Unlimited AI queries', 'Unlimited documents', '24/7 dedicated support', 'Custom integrations', 'SLA guarantee', 'On-premise option', 'SSO & SAML'],
    cta: 'Contact Sales', style: 'outline',
  },
];

const TRUST = [
  { icon: <FaShieldAlt />, bg: 'rgba(37,99,235,0.12)', color: '#60a5fa', title: 'Enterprise Grade Security', sub: 'SOC2 Type II certified' },
  { icon: <FaLock />,      bg: 'rgba(124,58,237,0.12)', color: '#a78bfa', title: 'Privacy First',            sub: 'GDPR & CCPA compliant' },
  { icon: <FaServer />,    bg: 'rgba(6,182,212,0.12)',  color: '#22d3ee', title: 'Scalable Architecture',    sub: '99.9% uptime SLA' },
  { icon: <FaHeadset />,   bg: 'rgba(34,197,94,0.12)', color: '#4ade80', title: '24/7 Expert Support',      sub: 'Avg. response < 2 hrs' },
];

const CHART_BARS = [55, 72, 61, 88, 76, 95, 68];

/* ── Navbar ───────────────────────────────────────── */
function Navbar({ onNav }) {
  const navigate = useNavigate();
  return (
    <nav className="lp-nav">
      <Link to="/" className="lp-nav-brand">
        <div className="lp-nav-logo">AI</div>
        <div>
          <div className="lp-nav-name">Enterprise AI</div>
          <div className="lp-nav-sub">Platform</div>
        </div>
      </Link>

      <div className="lp-nav-links">
        {['features','solutions','pricing','contact'].map(s => (
          <button key={s} className="lp-nav-link" onClick={() => onNav(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="lp-nav-actions">
        <button className="btn-outline" onClick={() => navigate('/login')}>Login</button>
        <button className="btn-grad"    onClick={() => navigate('/register')}>Get Started</button>
      </div>
    </nav>
  );
}

/* ── Hero ─────────────────────────────────────────── */
const MOCKUP_STATS = [
  { num: '18,245', label: 'AI Queries',   color: '#60a5fa' },
  { num: '1,247',  label: 'Documents',    color: '#a78bfa' },
  { num: '892',    label: 'Active Users', color: '#34d399' },
  { num: '$18.5K', label: 'Savings',      color: '#fbbf24' },
];

function Hero({ onNav }) {
  const navigate = useNavigate();
  const [videoReady, setVideoReady] = React.useState(false);

  return (
    <section className="hero-section">

      {/* ── Video layer ── */}
      <div className="hero-video-wrap">
        <video
          className={`hero-video ${videoReady ? 'hero-video--ready' : ''}`}
          autoPlay loop muted playsInline
          onCanPlay={() => setVideoReady(true)}
        >
          <source src="/Videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-overlay-bottom" />
      </div>

      {/* ── Content layer ── */}
      <div className="hero-content">
        <div className="hero-grid">

          {/* ── LEFT COLUMN ── */}
          <div className="hero-left">

            {/* Badge */}
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              🚀 Next-Gen Enterprise AI
            </div>

            {/* Heading */}
            <h1 className="hero-h1">
              Transform<br />
              Enterprise<br />
              Knowledge Into<br />
              Intelligent Actions
            </h1>

            {/* Subtext */}
            <p className="hero-sub">
              A professional AI-powered workplace platform for employee
              support, document intelligence, and workflow automation.
              Trusted by 500+ enterprises worldwide.
            </p>

            {/* CTA buttons */}
            <div className="hero-ctas">
              <button className="hero-btn-primary" onClick={() => navigate('/register')}>
                Get Started <FaArrowRight size={13} />
              </button>
              <button className="hero-btn-outline" onClick={() => onNav('features')}>
                <FaPlay size={11} /> Watch Demo
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Dashboard mockup card ── */}
          <div className="hero-right">
            <div className="hero-mockup">

              {/* Title bar */}
              <div className="hero-mockup-bar">
                <span className="hero-mockup-dot" style={{ background: '#ef4444' }} />
                <span className="hero-mockup-dot" style={{ background: '#f59e0b' }} />
                <span className="hero-mockup-dot" style={{ background: '#22c55e' }} />
                <div className="hero-mockup-url" />
              </div>

              {/* 2×2 stat grid */}
              <div className="hero-mockup-stats">
                {MOCKUP_STATS.map(({ num, label, color }) => (
                  <div key={label} className="hero-mockup-stat">
                    <span className="hero-mockup-num" style={{ color }}>{num}</span>
                    <span className="hero-mockup-lbl">{label}</span>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="hero-mockup-chart">
                <div className="hero-mockup-chart-label">
                  AI Query Activity — Last 7 days
                </div>
                <div className="hero-mockup-bars">
                  {CHART_BARS.map((h, i) => (
                    <div key={i} className="hero-mockup-col">
                      <div
                        className="hero-mockup-chartbar"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ── Features ─────────────────────────────────────── */
function Features() {
  const handleLearnMore = (title, desc) => {
    alert(`${title}\n\n${desc}\n\nContact our team for a personalized demo.`);
  };

  return (
    <section id="features" style={{background:'rgba(255,255,255,0.01)', borderTop:'1px solid rgba(255,255,255,0.04)'}}>
      <div className="lp-section" style={{textAlign:'center'}}>
        <div className="lp-section-label">Features</div>
        <h2 className="lp-section-h2 grad-text">Powerful AI Features for Modern Enterprises</h2>
        <p className="lp-section-sub">Everything your team needs to work smarter with enterprise-grade AI automation</p>
        <div className="lp-3col">
          {FEATURES.map(({icon, title, desc}) => (
            <div key={title} className="lp-feat-card">
              <div className="lp-feat-icon">{icon}</div>
              <div className="lp-feat-title">{title}</div>
              <div className="lp-feat-desc">{desc}</div>
              <button className="lp-feat-link" onClick={() => handleLearnMore(title, desc)}>Learn More <FaArrowRight size={11} /></button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Solutions ─────────────────────────────────────── */
function Solutions() {
  const handleLearnMore = (title, desc) => {
    alert(`${title}\n\n${desc}\n\nContact our team for a personalized demo.`);
  };

  return (
    <section id="solutions">
      <div className="lp-section" style={{textAlign:'center'}}>
        <div className="lp-section-label">Solutions</div>
        <h2 className="lp-section-h2 grad-text">Industry-Specific AI Solutions</h2>
        <p className="lp-section-sub">Tailored assistants for every department in your organization, trained on your company data</p>
        <div className="lp-3col">
          {SOLUTIONS.map(({icon, title, desc}) => (
            <div key={title} className="lp-sol-card">
              <div className="lp-sol-icon">{icon}</div>
              <div className="lp-sol-title">{title}</div>
              <div className="lp-sol-desc">{desc}</div>
              <button className="lp-sol-link" onClick={() => handleLearnMore(title, desc)}>Learn More <FaArrowRight size={11} /></button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ───────────────────────────────────────── */
function Pricing() {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="lp-pricing-section" style={{borderTop:'1px solid rgba(255,255,255,0.04)'}}>
      <div className="lp-section" style={{textAlign:'center'}}>
        <div className="lp-section-label">Pricing</div>
        <h2 className="lp-section-h2 grad-text">Simple, Transparent Pricing</h2>
        <p className="lp-section-sub">No hidden fees. Cancel anytime. Start free for 14 days.</p>
        <div className="lp-3col">
          {PRICING.map(({name, price, per, desc, features, cta, style, popular}) => (
            <div key={name} className={`lp-price-card${popular ? ' popular' : ''}`}>
              {popular && <div className="lp-price-popular-badge">MOST POPULAR</div>}
              <div className="lp-price-name">{name}</div>
              <div className="lp-price-row">
                <span className="lp-price-val">{price}</span>
                {per && <span className="lp-price-per">{per}</span>}
              </div>
              <div className="lp-price-desc">{desc}</div>
              <ul className="lp-price-feats">
                {features.map(f => (
                  <li key={f} className="lp-price-feat">
                    <FaCheck className="lp-price-check" size={12} /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`lp-price-btn ${style}`}
                onClick={() => price === 'Custom' ? document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}) : navigate('/register')}
              >{cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Trust Band ───────────────────────────────────── */
function TrustBand() {
  return (
    <div className="lp-trust-band">
      <div className="lp-trust-inner">
        {TRUST.map(({icon, bg, color, title, sub}) => (
          <div key={title} className="lp-trust-item">
            <div className="lp-trust-icon" style={{background:bg, color}}>{icon}</div>
            <div>
              <div className="lp-trust-title">{title}</div>
              <div className="lp-trust-sub">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Contact ──────────────────────────────────────── */
function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
    setForm({ name: '', email: '', company: '', message: '' });
    setTimeout(() => setSent(false), 6000);
  };

  return (
    <section id="contact" className="ct-section">

      {/* ── Content ── */}
      <div className="ct-inner">

        {/* Section label + heading centred above the two columns */}
        <div className="ct-header">
          <span className="ct-label">Contact</span>
          <h2 className="ct-h2">Get in Touch</h2>
          <p className="ct-lead">
            Our team responds within 2 business hours.
            Let's talk about your AI transformation.
          </p>
        </div>

        <div className="ct-body">

          {/* LEFT — info panel (full-cover AI image background, no inline <img>) */}
          <div className="ct-info-panel">
            <h3 className="ct-info-h3">Let's Start a Conversation</h3>
            <p className="ct-info-p">
              Whether you're evaluating AI for your enterprise or ready
              to start a pilot, our experts are here to help.
            </p>

            <div className="ct-info-items">
              {[
                { icon: <FaMapMarkerAlt />, label: 'Address',
                  value: 'No. 123, Galle Road,\nColombo 03, Sri Lanka.' },
                { icon: <FaPhoneAlt />,     label: 'Phone',
                  value: '+94 77 123 4567' },
                { icon: <FaEnvelope />,     label: 'Email',
                  value: 'hello@enterprise.lk' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="ct-info-item">
                  <div className="ct-info-icon">{icon}</div>
                  <div>
                    <div className="ct-info-label">{label}</div>
                    <div className="ct-info-value">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Small trust strip */}
            <div className="ct-trust-strip">
              {['SOC2 Certified', 'GDPR Ready', '99.9% Uptime'].map(t => (
                <span key={t} className="ct-trust-chip">✓ {t}</span>
              ))}
            </div>
          </div>

          {/* RIGHT — form panel */}
          <div className="ct-form-panel">
            <h3 className="ct-form-h3">Send Us a Message</h3>

            {sent && (
              <div className="ct-success">
                ✅ Message sent! We'll get back to you within 2 hours.
              </div>
            )}

            <form className="ct-form" onSubmit={handleSubmit} noValidate>
              <div className="ct-form-row">
                <div className="ct-field">
                  <label className="ct-field-label">Full Name *</label>
                  <input required className="ct-input" value={form.name}
                    onChange={set('name')} placeholder="John Smith" />
                </div>
                <div className="ct-field">
                  <label className="ct-field-label">Work Email *</label>
                  <input required type="email" className="ct-input"
                    value={form.email} onChange={set('email')}
                    placeholder="john@company.com" />
                </div>
              </div>

              <div className="ct-field">
                <label className="ct-field-label">Company</label>
                <input className="ct-input" value={form.company}
                  onChange={set('company')} placeholder="Acme Corporation" />
              </div>

              <div className="ct-field">
                <label className="ct-field-label">Message *</label>
                <textarea required className="ct-textarea"
                  value={form.message} onChange={set('message')}
                  placeholder="Tell us about your use case and team size..." />
              </div>

              <button type="submit" className="ct-submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Message →'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────── */
function Footer() {
  const navigate = useNavigate();
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
  return (
    <footer className="lp-footer">
      <div className="lp-footer-top">
        <div>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:4}}>
            <div className="lp-nav-logo" style={{width:36,height:36,fontSize:13}}>AI</div>
            <span style={{fontSize:17,fontWeight:700,color:'white'}}>Enterprise AI</span>
          </div>
          <p className="lp-footer-brand-desc">
            The professional AI platform that transforms how enterprises manage knowledge,
            automate workflows, and support their teams.
          </p>
          <div className="lp-footer-social">
            {[[FaTwitter,'Twitter'],[FaLinkedin,'LinkedIn'],[FaGithub,'GitHub'],[FaSlack,'Slack']].map(([Icon,name]) => (
              <button key={name} className="lp-footer-social-btn" title={name}><Icon /></button>
            ))}
          </div>
        </div>

        <div>
          <div className="lp-footer-col-title">Product</div>
          <div className="lp-footer-links">
            {['features','solutions','pricing'].map(s => (
              <button key={s} className="lp-footer-link" onClick={() => scrollTo(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <button className="lp-footer-link" onClick={() => navigate('/register')}>Free Trial</button>
          </div>
        </div>

        <div>
          <div className="lp-footer-col-title">Company</div>
          <div className="lp-footer-links">
            {['About Us','Careers','Blog','Press'].map(l => (
              <button key={l} className="lp-footer-link">{l}</button>
            ))}
          </div>
        </div>

        <div>
          <div className="lp-footer-col-title">Legal</div>
          <div className="lp-footer-links">
            {['Privacy Policy','Terms of Service','Cookie Policy','Security'].map(l => (
              <button key={l} className="lp-footer-link">{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="lp-footer-bottom">
        <span>© 2024 Enterprise AI Platform, Inc. All rights reserved.</span>
        <div style={{display:'flex',gap:4}}>
          {['Privacy','Terms','Cookies'].map(l => (
            <button key={l} className="lp-footer-link" style={{fontSize:13}}>{l}</button>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ── Root Page ─────────────────────────────────────── */
export default function Landing() {
  const scrollTo = id => {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({behavior:'smooth'}), 50);
  };
  return (
    <div className="lp-root">
      <Navbar onNav={scrollTo} />
      <Hero    onNav={scrollTo} />
      <Features />
      <Solutions />
      <Pricing />
      <TrustBand />
      <Contact />
      <Footer />
    </div>
  );
}