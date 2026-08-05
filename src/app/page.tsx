'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Droplets, Sun, Leaf, Sparkles, ShieldCheck, Award, Volume2, VolumeX } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

/* ─── CleanNew Brand Design Tokens ─── */
const C = {
  primary: '#139D69',
  primaryLight: '#1DBF82',
  primaryDark: '#0B7A4E',
  dark: '#070707',
  darkElevated: '#111111',
  darkCard: '#181818',
  white: '#ffffff',
  offWhite: '#f4f4f5',
  gray: '#8e8e93',
  grayLight: '#d1d1d6',
  border: 'rgba(255,255,255,0.08)',
  borderActive: 'rgba(19,157,105,0.4)',
  gradient: 'linear-gradient(135deg, #139D69, #1DBF82)',
  gradientDark: 'linear-gradient(180deg, rgba(7,7,7,0.7) 0%, rgba(7,7,7,0.95) 100%)',
  accentGlow: '0 0 35px rgba(19,157,105,0.25)',
};

/* ─── Scroll Reveal Hook ─── */
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.1 }
    );
    const els = document.querySelectorAll('.reveal');
    els.forEach((el) => observer.observe(el));
    return () => els.forEach((el) => observer.unobserve(el));
  }, []);
};

/* ─── Animated Counter Component ─── */
const Counter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          let start: number | null = null;
          const step = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / 2000, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [target, suffix]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── Video Player Card with Image Fallback Poster ─── */
const VideoCard = ({
  src,
  poster,
  title,
  subtitle,
  autoPlay = false,
  muted = false,
  loop = false,
  className = '',
  objectPosition = 'center',
}: {
  src: string;
  poster?: string;
  title: string;
  subtitle?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  objectPosition?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);

  useEffect(() => {
    const handleGlobalPlay = (e: CustomEvent<{ src: string }>) => {
      if (e.detail && e.detail.src !== src && videoRef.current) {
        videoRef.current.pause();
        setPlaying(false);
      }
    };

    window.addEventListener('cleannew-play-video' as any, handleGlobalPlay as any);
    return () => {
      window.removeEventListener('cleannew-play-video' as any, handleGlobalPlay as any);
    };
  }, [src]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      window.dispatchEvent(new CustomEvent('cleannew-play-video', { detail: { src } }));
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      className={`video-card ${className}`}
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: C.darkCard,
        border: `1px solid ${C.border}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        height: '100%',
        width: '100%',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        playsInline
        preload="metadata"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: objectPosition, display: 'block' }}
      />

      {playing && (
        <button
          onClick={toggleMute}
          aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            background: 'rgba(0,0,0,0.6)',
            color: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      <button
        onClick={togglePlay}
        aria-label={playing ? 'Pausar video' : 'Reproducir video'}
        style={{
          position: 'absolute',
          inset: 0,
          background: playing ? 'transparent' : 'rgba(0,0,0,0.4)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        {!playing && (
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: C.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: C.accentGlow,
              transform: 'scale(1)',
              transition: 'transform 0.2s ease',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '4px' }}>
              <polygon points="8,5 20,12 8,19" />
            </svg>
          </div>
        )}
      </button>

      {title && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px 20px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 600, color: C.white, marginBottom: '2px' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.82rem', color: C.primaryLight, opacity: 0.9 }}>{subtitle}</div>}
        </div>
      )}
    </div>
  );
};

/* ─── FAQ Accordion Item ─── */
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: C.darkElevated,
        borderRadius: '12px',
        border: `1px solid ${open ? C.borderActive : C.border}`,
        marginBottom: '14px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '20px 24px',
          background: 'transparent',
          border: 'none',
          color: C.white,
          fontSize: '1.05rem',
          fontWeight: 600,
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{question}</span>
        <span style={{ color: C.primary, fontSize: '1.4rem', transition: 'transform 0.3s', transform: open ? 'rotate(45deg)' : 'rotate(0)' }}>
          +
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 24px 22px', color: C.grayLight, fontSize: '0.94rem', lineHeight: 1.7, borderTop: `1px solid ${C.border}` }}>
          <p style={{ marginTop: '16px' }}>{answer}</p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function CleanNewLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [activeVideoCategory, setActiveVideoCategory] = useState<string>('Todos');
  const [showAllVideos, setShowAllVideos] = useState<boolean>(false);

  // Form State
  const [formState, setFormState] = useState({ name: '', phone: '', service: 'Blindaje Textil', city: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useScrollReveal();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const msg = `Hola, mi nombre es ${formState.name}. Quisiera solicitar cotización de ${formState.service} para la ciudad de ${formState.city}. Detalle: ${formState.message}`;
    const url = `https://wa.me/525580484283?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const navItems = [
    { label: 'Inicio', id: 'inicio' },
    { label: 'Tecnología', id: 'tecnologia' },
    { label: 'Servicios', id: 'servicios' },
    { label: 'Sectores', id: 'sectores' },
    { label: 'Demostraciones', id: 'galeria' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Contacto', id: 'contacto' },
  ];

  return (
    <div style={{ backgroundColor: C.dark, color: C.white, fontFamily: 'var(--font-inter), system-ui, sans-serif', overflowX: 'hidden' }}>

      {/* ─── GLOBAL STYLES & ANIMATIONS ─── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ─── CSS Scroll-Driven Animations ─── */
        @supports (animation-timeline: view()) {
          .scroll-reveal {
            animation: scrollFadeIn linear both;
            animation-timeline: view();
            animation-range: entry 10% cover 35%;
          }
          .scroll-zoom {
            animation: scrollScaleUp linear both;
            animation-timeline: view();
            animation-range: entry 5% cover 35%;
          }
        }

        @keyframes scrollFadeIn {
          from { opacity: 0; transform: translateY(36px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scrollScaleUp {
          from { opacity: 0.3; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        .nav-glass { background:rgba(7,7,7,0.92)!important; backdrop-filter:blur(16px); border-bottom:1px solid rgba(255,255,255,0.08); box-shadow:0 10px 30px rgba(0,0,0,0.6); }

        .hover-card { transition:transform .35s ease, border-color .35s ease, box-shadow .35s ease; }
        .hover-card:hover { transform:translateY(-8px); border-color:${C.borderActive}; box-shadow:${C.accentGlow}; }

        .video-card:hover { border-color:${C.borderActive}!important; box-shadow:0 12px 40px rgba(19,157,105,0.25)!important; }

        @keyframes pulseDot { 0%{box-shadow:0 0 0 0 rgba(29,191,130,0.8)} 70%{box-shadow:0 0 0 14px rgba(29,191,130,0)} 100%{box-shadow:0 0 0 0 rgba(29,191,130,0)} }
        @keyframes pulseDot { 0% { box-shadow: 0 0 0 0 rgba(29,191,130,0.6); } 70% { box-shadow: 0 0 0 15px rgba(29,191,130,0); } 100% { box-shadow: 0 0 0 0 rgba(29,191,130,0); } }

        @keyframes bounceDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        @media(max-width:900px){
          .desk-nav{display:none!important}
          .mob-nav-btn{display:flex!important}
          .hero-title{font-size:2.4rem!important}
          .grid-2col{grid-template-columns:1fr!important}
          .grid-3col{grid-template-columns:1fr!important}
          .flex-mob-col{flex-direction:column!important}
          .reverse-mob{flex-direction:column-reverse!important}
        }
      `}} />

      {/* ═══ 1 · NAVIGATION BAR ═══ */}
      <nav
        className={scrolled ? 'nav-glass' : ''}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 48px', background: 'transparent', transition: 'all .3s ease',
        }}
      >
        {/* Left: Logo */}
        <div style={{ flex: 1 }}>
          <div onClick={() => goTo('inicio')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
            <img src="/images/logo.webp" alt="CleanNew" style={{ height: '42px', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Center: Desktop Nav Links */}
        <div className="desk-nav" style={{ flex: 2, display: 'flex', gap: '32px', justifyContent: 'center', alignItems: 'center' }}>
          {navItems.map((n) => (
            <a
              key={n.id}
              onClick={() => goTo(n.id)}
              style={{ color: C.offWhite, cursor: 'pointer', textDecoration: 'none', fontSize: '.9rem', fontWeight: 500, transition: 'color 0.2s' }}
            >
              {n.label}
            </a>
          ))}
        </div>

        {/* Right: CTA Button / Mobile Toggle */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            className="desk-nav"
            onClick={() => goTo('contacto')}
            style={{
              background: C.gradient,
              color: C.white,
              padding: '12px 24px',
              borderRadius: '30px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '.9rem',
              boxShadow: C.accentGlow,
            }}
          >
            Cotización Rápida
          </button>

          <div className="mob-nav-btn" style={{ display: 'none', cursor: 'pointer' }} onClick={() => setMenuOpen(!menuOpen)}>
            <div style={{ width: '26px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ height: '2px', background: C.white, borderRadius: '2px' }} />
              <span style={{ height: '2px', background: C.white, borderRadius: '2px' }} />
              <span style={{ height: '2px', background: C.white, borderRadius: '2px' }} />
            </div>
          </div>
        </div>

        {menuOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: C.darkElevated, padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', borderBottom: `1px solid ${C.border}` }}>
            {navItems.map((n) => (
              <a key={n.id} onClick={() => goTo(n.id)} style={{ color: C.white, textDecoration: 'none', fontSize: '1rem', fontWeight: 500 }}>{n.label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ═══ 2 · HERO SECTION (VIDEO BACKGROUND + HERO POSTER IMAGE) ═══ */}
      <section id="inicio" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', textAlign: 'center', paddingTop: '100px', paddingBottom: '60px' }}>
        {/* Background Video with Poster Fallback */}
        <video
          autoPlay muted loop playsInline
          poster="/images/posters/hero-bg.jpg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          src="/videos/hero-bg.mp4"
        />
        {/* Dark Gradient Overlay */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: C.gradientDark }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '980px', padding: '0 24px' }}>
          <div className="reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(19,157,105,0.18)', padding: '8px 20px', borderRadius: '30px', marginBottom: '28px', border: `1px solid ${C.primary}`, fontSize: '.88rem', color: C.primaryLight, fontWeight: 600, letterSpacing: '.5px' }}>
            <ShieldCheck size={16} /> Nanotecnología Avanzada de Estándar Internacional
          </div>

          <h1 className="hero-title reveal d1" style={{ fontSize: '4.2rem', margin: '0 0 24px', lineHeight: 1.1, fontWeight: 800, letterSpacing: '-1px' }}>
            Protección Invisible. <br />
            <span style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Elegancia Absoluta.
            </span>
          </h1>

          <p className="reveal d2" style={{ fontSize: '1.35rem', color: C.offWhite, margin: '0 0 16px', fontWeight: 400, maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Líderes en higienización profunda y blindaje hidrofóbico para tapicería de alto valor, superficies de cuero, residencias de lujo, embarcaciones y aviación.
          </p>

          <p className="reveal d3" style={{ fontSize: '1rem', color: C.gray, margin: '0 0 44px', fontWeight: 400 }}>
            Preservación certificada que repela líquidos, manchas y rayos UV sin alterar la textura ni el color original.
          </p>

          <div className="reveal d4" style={{ display: 'flex', gap: '18px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a onClick={() => goTo('galeria')} style={{ background: C.gradient, color: C.white, padding: '16px 36px', borderRadius: '35px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', fontSize: '1rem', boxShadow: C.accentGlow }}>
              Ver Demostraciones
            </a>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, animation: 'bounceDown 2.2s infinite' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primaryLight} strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
        </div>
      </section>

      {/* ═══ 3 · STATS COUNTER BAR ═══ */}
      <section style={{ background: C.darkElevated, borderTop: `2px solid ${C.primary}`, borderBottom: `1px solid ${C.border}`, padding: '56px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', textAlign: 'center' }}>
          {[
            { n: 10, s: '+', t: 'Años de Trayectoria Global' },
            { n: 12, s: '+', t: 'Países con Operaciones' },
            { n: 50, s: '+', t: 'Franquicias y Unidades' },
            { n: 100, s: 'K+', t: 'Servicios de Lujo Realizados' },
          ].map((st, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: '3.2rem', fontWeight: 800, color: C.primaryLight, fontFamily: 'sans-serif', lineHeight: 1 }}>
                <Counter target={st.n} suffix={st.s} />
              </div>
              <div style={{ color: C.gray, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '10px', fontWeight: 600 }}>{st.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 4 · NANOTECHNOLOGY BENEFITS (PILARES DEL FOLLETO 2026) ═══ */}
      <section id="tecnologia" style={{ padding: '110px 24px', maxWidth: '1240px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ color: C.primary, fontSize: '.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Innovación en Cuidado Textil
          </div>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 800, margin: 0 }}>Pilares Nanotecnológicos CleanNew</h2>
          <div style={{ width: '60px', height: '4px', background: C.gradient, margin: '18px auto 0', borderRadius: '2px' }} />
        </div>

        <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
          {[
            { icon: <Droplets size={38} color={C.primary} strokeWidth={1.5} />, title: 'Repelencia Total a Líquidos', desc: 'Fórmula que crea una tensión superficial impenetrable. El café, vino, jugos o aceites permanecen en gotas flotantes sin absorberse.' },
            { icon: <Sun size={38} color={C.primary} strokeWidth={1.5} />, title: 'Protección Anti-UV', desc: 'Evita la decoloración, el desgaste y el amarillamiento prematuro provocado por la radiación solar y la luz artificial constante.' },
            { icon: <Leaf size={38} color={C.primary} strokeWidth={1.5} />, title: 'Fórmula Ecológica & Segura', desc: 'Producto no inflamable, hipoalergénico y libre de compuestos nocivos. Totalmente seguro para niños, adultos y mascotas.' },
            { icon: <Sparkles size={38} color={C.primary} strokeWidth={1.5} />, title: 'Conservación del Tacto', desc: 'A diferencia de los impermeabilizantes tradicionales, no altera la suavidad, flexibilidad ni la transpirabilidad natural de la tela.' },
            { icon: <ShieldCheck size={38} color={C.primary} strokeWidth={1.5} />, title: 'Fácil Mantenimiento', desc: 'Simplifica la limpieza diaria. Cualquier derrame accidental se retira sencillamente con un paño seco o toalla absorbente.' },
            { icon: <Award size={38} color={C.primary} strokeWidth={1.5} />, title: 'Respaldo y Certificación', desc: 'Procedimientos estandarizados internacionalmente con garantía de efectividad y durabilidad prolongada en el mobiliario.' },

          ].map((item, i) => (
            <div
              key={i}
              className={`reveal hover-card d${(i % 3) + 1}`}
              style={{
                background: C.darkElevated,
                padding: '36px 28px',
                borderRadius: '18px',
                border: `1px solid ${C.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ fontSize: '2.6rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{item.title}</h3>
              <p style={{ color: C.gray, lineHeight: 1.7, fontSize: '.92rem', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 5 · SERVICIOS CON VIDEOS Y POSTERS DE IMAGEN REAL ═══ */}
      <section id="servicios" style={{ padding: '110px 24px', background: C.darkElevated, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ color: C.primary, fontSize: '.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Soluciones Especializadas
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, margin: 0 }}>Servicios de Alta Gama</h2>
            <div style={{ width: '60px', height: '4px', background: C.gradient, margin: '18px auto 0', borderRadius: '2px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>

            {/* Servicio 1: Blindaje Textil */}
            <div className="reveal flex-mob-col" style={{ display: 'flex', background: C.darkCard, borderRadius: '24px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <div style={{ flex: 1, minHeight: '380px', position: 'relative' }}>
                <VideoCard
                  src="/videos/blindaje-cafe.mp4"
                  poster="/images/posters/blindaje-cafe.jpg"
                  title="Demostración: Prueba de repulsión de café"
                  subtitle="Blindaje hidrofóbico en textil claro"
                  autoPlay muted loop
                  objectPosition="center bottom"
                />
              </div>
              <div style={{ flex: 1, padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'inline-block', background: 'rgba(19,157,105,0.15)', color: C.primaryLight, padding: '6px 16px', borderRadius: '20px', fontSize: '.8rem', fontWeight: 700, marginBottom: '20px', alignSelf: 'flex-start' }}>
                  TECNOLOGÍA DE BLINDAJE
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '18px' }}>Blindaje Nanotecnológico de Sofás y Estofados</h3>
                <p style={{ color: C.grayLight, marginBottom: '20px', lineHeight: 1.7, fontSize: '.96rem' }}>
                  Aplicación de nanopartículas que envuelven individualmente cada fibra del tejido sin sellar los poros. El resultado es una barrera invisible que repele líquidos acuosos y aceitosos, impidiendo la fijación de manchas persistentes.
                </p>
                <ul style={{ color: C.gray, listStyle: 'none', padding: 0, fontSize: '.9rem', lineHeight: 2.2 }}>
                  <li>✓ Ideal para lino, terciopelo, chenille, algodón y tejidos sintéticos</li>
                  <li>✓ Preserva el tono, suavidad y flexibilidad original</li>
                  <li>✓ Garantía de protección de hasta 12 meses</li>
                </ul>
              </div>
            </div>

            {/* Servicio 2: Higienización Profunda */}
            <div className="reveal reverse-mob" style={{ display: 'flex', background: C.darkCard, borderRadius: '24px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <div style={{ flex: 1, padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'inline-block', background: 'rgba(19,157,105,0.15)', color: C.primaryLight, padding: '6px 16px', borderRadius: '20px', fontSize: '.8rem', fontWeight: 700, marginBottom: '20px', alignSelf: 'flex-start' }}>
                  DESINFECCIÓN Y SANITIZACIÓN
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '18px' }}>Higienización Profunda e Inyección-Extracción</h3>
                <p style={{ color: C.grayLight, marginBottom: '20px', lineHeight: 1.7, fontSize: '.96rem' }}>
                  Proceso técnico de desinfección mediante extracción profunda de sustratos microbianos, bacterias, hongos y ácaros acumulados en el interior del relleno. Revitaliza las fibras y restaura la higiene de su entorno residencial.
                </p>
                <ul style={{ color: C.gray, listStyle: 'none', padding: 0, fontSize: '.9rem', lineHeight: 2.2 }}>
                  <li>✓ Extracción de mugre interna, ácaros y alérgenos</li>
                  <li>✓ Neutralización efectiva de olores y bacterias</li>
                  <li>✓ Proceso ideal antes de realizar la impermeabilización</li>
                </ul>
              </div>
              <div style={{ flex: 1, minHeight: '380px', position: 'relative' }}>
                <VideoCard
                  src="/videos/higienizacion-blindaje.mp4"
                  poster="/images/posters/higienizacion-blindaje.jpg"
                  title="Demostración: Extracción técnica profunda"
                  subtitle="Proceso de desinfección bactericida"
                  autoPlay muted loop
                  objectPosition="center bottom"
                />
              </div>
            </div>

            {/* Servicio 3: Tratamiento de Piel y Cuero */}
            <div className="reveal flex-mob-col" style={{ display: 'flex', background: C.darkCard, borderRadius: '24px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <div style={{ flex: 1, minHeight: '380px', position: 'relative' }}>
                <VideoCard
                  src="/videos/blindaje-vaso.mp4"
                  poster="/images/posters/blindaje-vaso.jpg"
                  title="Demostración: Hidratación de cuero genuino"
                  subtitle="Acondicionamiento sin brillo graso"
                  autoPlay muted loop
                  objectPosition="center bottom"
                />
              </div>
              <div style={{ flex: 1, padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'inline-block', background: 'rgba(19,157,105,0.15)', color: C.primaryLight, padding: '6px 16px', borderRadius: '20px', fontSize: '.8rem', fontWeight: 700, marginBottom: '20px', alignSelf: 'flex-start' }}>
                  CUIDADO DE PIEL Y CUERO
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '18px' }}>Restauración e Hidratación de Cuero</h3>
                <p style={{ color: C.grayLight, marginBottom: '20px', lineHeight: 1.7, fontSize: '.96rem' }}>
                  Tratamiento exclusivo formulado para acondicionar, limpiar e hidratar el cuero genuino y sintético. Evita el agrietamiento, la resecación por climatización y restaura el acabado mate y suave del primer día.
                </p>
                <ul style={{ color: C.gray, listStyle: 'none', padding: 0, fontSize: '.9rem', lineHeight: 2.2 }}>
                  <li>✓ Nutrición profunda contra resecamiento y grietas</li>
                  <li>✓ Barrera de protección contra manchas y fricción</li>
                  <li>✓ Libre de brillo artificial o residuos grasos</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ 6 · SECTORES DE APLICACIÓN CON IMÁGENES DE YATES Y JETS ═══ */}
      <section id="sectores" style={{ padding: '110px 24px', maxWidth: '1240px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ color: C.primary, fontSize: '.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Cobertura Multisectorial
          </div>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 800, margin: 0 }}>Sectores de Aplicación Especializada</h2>
          <div style={{ width: '60px', height: '4px', background: C.gradient, margin: '18px auto 0', borderRadius: '2px' }} />
        </div>

        <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>

          {/* Sector 1: Residencial & Corporativo */}
          <div className="reveal hover-card d1" style={{ background: C.darkElevated, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <div style={{ height: '240px', position: 'relative' }}>
              <img src="/images/hero.jpg" alt="Residencial de Lujo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,17,17,1) 0%, transparent 70%)' }} />
            </div>
            <div style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '10px' }}>Residencial de Lujo & Corporativo</h3>
              <p style={{ color: C.gray, fontSize: '.92rem', lineHeight: 1.6, margin: 0 }}>
                Protección para salas de estar, comedores, cabeceros de cama, alfombras de diseño y sillas de oficinas ejecutivas.
              </p>
            </div>
          </div>

          {/* Sector 2: Náutico (Yates) */}
          <div className="reveal hover-card d2" style={{ background: C.darkElevated, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <div style={{ height: '240px', position: 'relative' }}>
              <img src="/images/yacht.jpg" alt="Sector Náutico y Yates" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,17,17,1) 0%, transparent 70%)' }} />
            </div>
            <div style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '10px' }}>Sector Náutico (Yates & Navíos)</h3>
              <p style={{ color: C.gray, fontSize: '.92rem', lineHeight: 1.6, margin: 0 }}>
                Nanoprotección formulada para resistir la brisa marina, salinidad constante, hongos por humedad y exposición directa al sol.
              </p>
            </div>
          </div>

          {/* Sector 3: Aeronáutica (Jets) */}
          <div className="reveal hover-card d3" style={{ background: C.darkElevated, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <div style={{ height: '240px', position: 'relative' }}>
              <img src="/images/jet.jpg" alt="Aviación Ejecutiva" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,17,17,1) 0%, transparent 70%)' }} />
            </div>
            <div style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '10px' }}>Aviación Ejecutiva & Privada</h3>
              <p style={{ color: C.gray, fontSize: '.92rem', lineHeight: 1.6, margin: 0 }}>
                Acondicionamiento y conservación de vestiduras de piel y telas en aeronaves corporativas cumpliendo altos estándares.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ 7 · DEMOSTRACIONES EN VIDEO (GALERÍA DRIVE INTERACTIVA 15 VIDEOS) ═══ */}
      <section id="galeria" style={{ padding: '110px 24px', background: C.darkElevated, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className="reveal scroll-reveal" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ color: C.primary, fontSize: '.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Evidencia Real Drive
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, margin: 0 }}>Galería de Demostraciones en Video</h2>
            <p style={{ color: C.gray, fontSize: '1.05rem', maxWidth: '640px', margin: '14px auto 0' }}>
              Explore nuestro catálogo técnico completo de 15 demostraciones reales grabadas en vivo.
            </p>
            <div style={{ width: '60px', height: '4px', background: C.gradient, margin: '18px auto 0', borderRadius: '2px' }} />
          </div>

          {/* Category Tabs */}
          <div className="reveal scroll-reveal" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '48px' }}>
            {['Todos', 'Blindaje Textil', 'Higienización', 'Institucional', 'Reels'].map((cat) => {
              const isActive = activeVideoCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveVideoCategory(cat)}
                  style={{
                    background: isActive ? C.gradient : C.darkCard,
                    color: C.white,
                    border: isActive ? `1px solid ${C.primaryLight}` : `1px solid ${C.border}`,
                    padding: '10px 22px',
                    borderRadius: '25px',
                    fontWeight: 600,
                    fontSize: '.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: isActive ? C.accentGlow : 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* 15 Videos Grid with Collapsible Unfold Button */}
          {(() => {
            const allVideosList = [
              { src: '/videos/galeria-institucional.mp4', poster: '/images/posters/galeria-institucional.jpg', title: 'Proceso Integral CleanNew', subtitle: 'Demostración institucional de higienización y blindaje', category: 'Institucional' },
              { src: '/videos/galeria-blindaje-v3.mp4', poster: '/images/posters/galeria-blindaje-v3.jpg', title: 'Prueba de Repelencia Extrema', subtitle: 'Aplicación de nanoprotección en tapicería clara', category: 'Blindaje Textil' },
              { src: '/videos/galeria-reels.mp4', poster: '/images/posters/galeria-reels.jpg', title: 'Prueba en Estofado Blanco', subtitle: 'Demostración de resistencia al líquido', category: 'Reels' },
              { src: '/videos/galeria-beneficios.mp4', poster: '/images/posters/galeria-beneficios.jpg', title: 'Beneficios y Durabilidad', subtitle: 'Explicación técnica sobre el cuidado a largo plazo', category: 'Institucional' },
              { src: '/videos/blindagem-cafe-sofa-branco.mp4', poster: '/images/posters/blindagem-cafe-sofa-branco.jpg', title: 'Prueba Repulsión de Café', subtitle: 'Blindaje hidrofóbico en textil blanco', category: 'Blindaje Textil' },
              { src: '/videos/blindagem-vert-boavista-sofa-branco-160524.mp4', poster: '/images/posters/blindagem-vert-boavista-sofa-branco-160524.jpg', title: 'Blindaje Vert Boavista', subtitle: 'Protección en Sofá Blanco Residencial', category: 'Blindaje Textil' },
              { src: '/videos/blindagem-vert-boavista-sofa-branco-tragedia-160524.mp4', poster: '/images/posters/blindagem-vert-boavista-sofa-branco-tragedia-160524.jpg', title: 'Prueba Antimanchas Extrema', subtitle: 'Resistencia a derrames masivos', category: 'Blindaje Textil' },
              { src: '/videos/blindagem-estofado-branco.mp4', poster: '/images/posters/blindagem-estofado-branco.jpg', title: 'Nanoprotección en Estofado', subtitle: 'Preservación de textura y suavidad', category: 'Blindaje Textil' },
              { src: '/videos/v3-blindagem.mp4', poster: '/images/posters/v3-blindagem.jpg', title: 'Prueba V3 Nanotecnología', subtitle: 'Prueba de tensión superficial', category: 'Blindaje Textil' },
              { src: '/videos/cn-hihienizacao-blindagem-1.mp4', poster: '/images/posters/cn-hihienizacao-blindagem-1.jpg', title: 'Higienización y Sanidad', subtitle: 'Extracción de ácaros y alérgenos', category: 'Higienización' },
              { src: '/videos/fritz-higienizacao-metade-tapete.mp4', poster: '/images/posters/fritz-higienizacao-metade-tapete.jpg', title: 'Prueba Extracción Tapete', subtitle: 'Comparativa de mitad limpia vs sucia', category: 'Higienización' },
              { src: '/videos/fritz-higienizando-sofa-perdido.mp4', poster: '/images/posters/fritz-higienizando-sofa-perdido.jpg', title: 'Restauración Sofá', subtitle: 'Extracción de suciedad profunda', category: 'Higienización' },
              { src: '/videos/servicos-higienizacao-sofa-cinza.mp4', poster: '/images/posters/servicos-higienizacao-sofa-cinza.jpg', title: 'Higienización Sofá Gris', subtitle: 'Inyección-extracción desinfectante', category: 'Higienización' },
              { src: '/videos/servicos-higienizacao-sofa-fritz.mp4', poster: '/images/posters/servicos-higienizacao-sofa-fritz.jpg', title: 'Limpieza Especializada', subtitle: 'Revitalización de microfibras', category: 'Higienización' },
              { src: '/videos/blindagem-cn-store.mp4', poster: '/images/posters/blindagem-cn-store.jpg', title: 'Aplicación Showroom Store', subtitle: 'Demostración en tienda boutique', category: 'Institucional' },
              { src: '/videos/video-blindagem-copo-1.mp4', poster: '/images/posters/video-blindagem-copo-1.jpg', title: 'Prueba Copa con Líquido', subtitle: 'Repelencia en superficie', category: 'Reels' },
            ];

            const filtered = allVideosList.filter(v => activeVideoCategory === 'Todos' || v.category === activeVideoCategory);
            const visible = (showAllVideos || activeVideoCategory !== 'Todos') ? filtered : filtered.slice(0, 4);

            return (
              <>
                <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px' }}>
                  {visible.map((vid, idx) => (
                    <div key={idx} className="reveal scroll-zoom" style={{ aspectRatio: '9/16' }}>
                      <VideoCard
                        src={vid.src}
                        poster={vid.poster}
                        title={vid.title}
                        subtitle={vid.subtitle}
                      />
                    </div>
                  ))}
                </div>

                {activeVideoCategory === 'Todos' && (
                  <div style={{ textAlign: 'center', marginTop: '48px' }}>
                    <button
                      onClick={() => setShowAllVideos(!showAllVideos)}
                      style={{
                        background: showAllVideos ? 'rgba(255,255,255,0.08)' : C.gradient,
                        color: C.white,
                        border: `1px solid ${showAllVideos ? C.border : C.primaryLight}`,
                        padding: '14px 34px',
                        borderRadius: '30px',
                        fontWeight: 700,
                        fontSize: '0.98rem',
                        cursor: 'pointer',
                        boxShadow: showAllVideos ? 'none' : C.accentGlow,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <span>{showAllVideos ? 'Ocultar Catálogo Adicional' : 'Ver Más Videos de Demostración'}</span>
                      <span style={{ transform: showAllVideos ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', display: 'inline-block' }}>▼</span>
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* ═══ 8 · METODOLOGÍA DE TRABAJO EN 4 PASOS ═══ */}
      <section style={{ padding: '110px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '70px' }}>
          <div style={{ color: C.primary, fontSize: '.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Estándar de Excelencia
          </div>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 800, margin: 0 }}>Metodología de Servicio CleanNew</h2>
          <div style={{ width: '60px', height: '4px', background: C.gradient, margin: '18px auto 0', borderRadius: '2px' }} />
        </div>

        <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {[
            { num: '01', title: 'Diagnóstico', desc: 'Inspección técnica de la composición de la fibra y verificación de áreas sensibles.' },
            { num: '02', title: 'Higienización', desc: 'Preparación previa del tejido mediante extracción de impurezas y secado técnico.' },
            { num: '03', title: 'Aplicación', desc: 'Pulverización nanométrica uniforme garantizando cobertura total del poro.' },
            { num: '04', title: 'Certificación', desc: 'Prueba de efectividad con gota de agua y entrega de certificado formal.' },
          ].map((step, i) => (
            <div
              key={i}
              className={`reveal hover-card d${i + 1}`}
              style={{
                background: C.darkElevated,
                padding: '36px 24px',
                borderRadius: '20px',
                border: `1px solid ${C.border}`,
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: C.primaryLight,
                  background: 'rgba(19,157,105,0.15)',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: `1px solid ${C.primary}`,
                }}
              >
                {step.num}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>{step.title}</h3>
              <p style={{ color: C.gray, fontSize: '.9rem', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 9 · PRESENCIA GLOBAL ═══ */}
      <section id="presencia" style={{ padding: '100px 24px', background: C.darkElevated, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{ color: C.primary, fontSize: '.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Red Internacional
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, margin: 0 }}>Presencia Global en +12 Países</h2>
            <div style={{ width: '60px', height: '4px', background: C.gradient, margin: '18px auto 0', borderRadius: '2px' }} />
          </div>

          {/* Interactive World Map Container */}
          <div
            className="reveal"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '960px',
              height: '440px',
              margin: '0 auto',
              background: 'rgba(255,255,255,0.015)',
              borderRadius: '24px',
              border: `1px solid ${C.border}`,
              padding: '10px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ComposableMap projectionConfig={{ scale: 155, center: [0, 10] }} style={{ width: '100%', height: '100%' }}>
              <Geographies geography="/features.json">
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo: any) => {
                    const countryNameMap: Record<string, string> = {
                      'México': 'Mexico',
                      'Estados Unidos': 'United States of America',
                      'Brasil': 'Brazil',
                      'Colombia': 'Colombia',
                      'Argentina': 'Argentina',
                      'España': 'Spain',
                      'Francia': 'France',
                      'Andorra': 'Andorra',
                      'Arabia Saudita': 'Saudi Arabia',
                      'Emiratos Árabes': 'United Arab Emirates',
                      'Kuwait': 'Kuwait',
                      'Angola': 'Angola',
                    };

                    const geoName = geo.properties.name;
                    const isPresence = Object.values(countryNameMap).includes(geoName);
                    const isSelected = activeCountry ? countryNameMap[activeCountry] === geoName : false;

                    let fill = "#1C1C1C";
                    let stroke = C.border;
                    let strokeWidth = 0.5;

                    if (isPresence) {
                      if (activeCountry) {
                        fill = isSelected ? '#1DBF82' : '#0B593B';
                        stroke = isSelected ? '#34D399' : C.border;
                        strokeWidth = isSelected ? 1.5 : 0.5;
                      } else {
                        fill = C.primary;
                      }
                    }

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        style={{
                          default: { outline: "none", transition: "all 0.3s ease" },
                          hover: { fill: isPresence ? C.primaryLight : "#2A2A2A", outline: "none", cursor: isPresence ? 'pointer' : 'default' },
                          pressed: { outline: "none" }
                        }}
                        onMouseEnter={() => {
                          if (isPresence) {
                            const foundEntry = Object.entries(countryNameMap).find(([_, engName]) => engName === geoName);
                            if (foundEntry) {
                              setActiveCountry(foundEntry[0]);
                            }
                          }
                        }}
                        onMouseLeave={() => {
                          if (isPresence) {
                            setActiveCountry(null);
                          }
                        }}
                        onClick={() => {
                          if (isPresence) {
                            const foundEntry = Object.entries(countryNameMap).find(([_, engName]) => engName === geoName);
                            if (foundEntry) {
                              setActiveCountry(activeCountry === foundEntry[0] ? null : foundEntry[0]);
                            }
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Active Selected Country Marker Tag */}
              {activeCountry && (() => {
                const countryCoords: Record<string, [number, number]> = {
                  'México': [-102.55, 23.63],
                  'Estados Unidos': [-98.57, 39.82],
                  'Brasil': [-51.92, -14.23],
                  'Colombia': [-74.29, 4.57],
                  'Argentina': [-63.61, -38.41],
                  'España': [-3.74, 40.46],
                  'Francia': [2.21, 46.22],
                  'Andorra': [1.52, 42.50],
                  'Arabia Saudita': [45.07, 23.88],
                  'Emiratos Árabes': [53.84, 23.42],
                  'Kuwait': [47.48, 29.31],
                  'Angola': [17.87, -11.20],
                };
                const coords = countryCoords[activeCountry];
                if (!coords) return null;

                return (
                  <Marker coordinates={coords} style={{ default: { pointerEvents: 'none' }, hover: { pointerEvents: 'none' } }}>
                    <g transform="translate(0, 0)" style={{ pointerEvents: 'none' }}>
                      <circle r="6" fill="#34D399" stroke="#ffffff" strokeWidth="2" style={{ pointerEvents: 'none' }} />
                      <circle r="12" fill="none" stroke="#34D399" strokeWidth="1.5" opacity="0.6" style={{ pointerEvents: 'none' }}>
                        <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  </Marker>
                );
              })()}
            </ComposableMap>
          </div>

          {/* Country Pill Badges List */}
          <div
            className="reveal"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              maxWidth: '960px',
              margin: '32px auto 0',
            }}
          >
            {[
              { flag: '🇲🇽', name: 'México' },
              { flag: '🇺🇸', name: 'Estados Unidos' },
              { flag: '🇧🇷', name: 'Brasil' },
              { flag: '🇨🇴', name: 'Colombia' },
              { flag: '🇦🇷', name: 'Argentina' },
              { flag: '🇪🇸', name: 'España' },
              { flag: '🇫🇷', name: 'Francia' },
              { flag: '🇦🇩', name: 'Andorra' },
              { flag: '🇸🇦', name: 'Arabia Saudita' },
              { flag: '🇦🇪', name: 'Emiratos Árabes' },
              { flag: '🇰🇼', name: 'Kuwait' },
              { flag: '🇦🇴', name: 'Angola' },
            ].map((c, i) => {
              const isActive = activeCountry === c.name;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setActiveCountry(c.name)}
                  onMouseLeave={() => setActiveCountry(null)}
                  onClick={() => setActiveCountry(isActive ? null : c.name)}
                  style={{
                    background: isActive ? 'rgba(19,157,105,0.25)' : C.darkCard,
                    padding: '8px 18px',
                    borderRadius: '20px',
                    border: isActive ? `1px solid ${C.primaryLight}` : `1px solid ${C.border}`,
                    fontSize: '.88rem',
                    fontWeight: 600,
                    color: isActive ? C.primaryLight : C.offWhite,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isActive ? '0 0 15px rgba(29,191,130,0.3)' : '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    transform: isActive ? 'scale(1.06)' : 'scale(1)',
                  }}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </div>
              );
            })}
          </div>

          <div className="reveal" style={{ textAlign: 'center', marginTop: '36px', fontSize: '1.1rem', fontWeight: 700, color: C.primaryLight, letterSpacing: '.5px' }}>
            5 Continentes · +50 Franquicias Operativas · Más de 100,000 Clientes Satisfechos
          </div>
        </div>
      </section>

      {/* ═══ 10 · FAQ SECTION ═══ */}
      <section id="faq" style={{ padding: '110px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ color: C.primary, fontSize: '.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Dudas Frecuentes
          </div>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 800, margin: 0 }}>Preguntas Frecuentes</h2>
          <div style={{ width: '60px', height: '4px', background: C.gradient, margin: '18px auto 0', borderRadius: '2px' }} />
        </div>

        <div className="reveal">
          <FAQItem
            question="¿Cuánto dura el efecto del blindaje en mi sofá?"
            answer="El efecto del blindaje nanotecnológico CleanNew tiene una durabilidad de hasta 12 meses, dependiendo del uso y frecuencia de limpieza del mobiliario."
          />
          <FAQItem
            question="¿El producto cambia la textura o el color de la tela?"
            answer="No. A diferencia de impermeabilizantes convencionales con solventes pesados, nuestra nanotecnología respeta la textura, suavidad, tono original y la permeabilidad al aire de las fibras."
          />
          <FAQItem
            question="¿Cuánto tiempo tarda en secarse el servicio?"
            answer="El tiempo de secado estimado es de 2 a 4 horas después de la aplicación, dependiendo de la ventilación y humedad ambiental del lugar."
          />
          <FAQItem
            question="¿Es seguro para niños y mascotas?"
            answer="Totalmente. Nuestra fórmula es a base de agua, no inflamable, hipoalergénica y libre de vapores tóxicos o nocivos."
          />
          <FAQItem
            question="¿Qué debo hacer si derramo un líquido como café o vino?"
            answer="Simplemente coloque una toalla de papel absorbente o paño seco sobre el líquido derramado sin frotar. La tensión superficial absorbe la gota de inmediato sin dejar cerco."
          />
        </div>
      </section>

      {/* ═══ 11 · COTIZADOR Y FORMULARIO DE CONTACTO ═══ */}
      <section id="contacto" style={{ padding: '110px 24px', background: C.darkElevated, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ color: C.primary, fontSize: '.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Atención Personalizada
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, margin: 0 }}>Solicite una Cotización Rápida</h2>
            <p style={{ color: C.gray, fontSize: '1.05rem', marginTop: '12px' }}>
              Complete el formulario y nuestro equipo técnico se pondrá en contacto inmediato.
            </p>
            <div style={{ width: '60px', height: '4px', background: C.gradient, margin: '18px auto 0', borderRadius: '2px' }} />
          </div>

          <div className="reveal grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', background: C.darkCard, padding: '48px', borderRadius: '24px', border: `1px solid ${C.border}` }}>

            {/* Direct Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '28px' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Canales de Atención Directa</h3>
              <p style={{ color: C.grayLight, lineHeight: 1.7, fontSize: '.95rem', margin: 0 }}>
                Coordinamos evaluaciones a domicilio para residencias particulares, diseñadores de interiores, hoteles y embarcaciones.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <a href="https://wa.me/525580484283" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '14px', background: C.darkElevated, padding: '16px 20px', borderRadius: '14px', border: `1px solid ${C.border}`, color: C.white, textDecoration: 'none', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.6rem' }}>💬</span>
                  <div>
                    <div style={{ fontSize: '.75rem', color: C.primaryLight, textTransform: 'uppercase', letterSpacing: '1px' }}>WhatsApp Oficial</div>
                    <div style={{ fontSize: '1rem' }}>+52 55 8048 4283</div>
                  </div>
                </a>

                <a href="mailto:info@cleannew.mx" style={{ display: 'flex', alignItems: 'center', gap: '14px', background: C.darkElevated, padding: '16px 20px', borderRadius: '14px', border: `1px solid ${C.border}`, color: C.white, textDecoration: 'none', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.6rem' }}>✉️</span>
                  <div>
                    <div style={{ fontSize: '.75rem', color: C.primaryLight, textTransform: 'uppercase', letterSpacing: '1px' }}>Correo Electrónico</div>
                    <div style={{ fontSize: '1rem' }}>info@cleannew.mx</div>
                  </div>
                </a>

                <a href="https://cleannew.com" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '14px', background: C.darkElevated, padding: '16px 20px', borderRadius: '14px', border: `1px solid ${C.border}`, color: C.white, textDecoration: 'none', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.6rem' }}>🌐</span>
                  <div>
                    <div style={{ fontSize: '.75rem', color: C.primaryLight, textTransform: 'uppercase', letterSpacing: '1px' }}>Portal Global</div>
                    <div style={{ fontSize: '1rem' }}>cleannew.com</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Interactive Form */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.85rem', color: C.grayLight, marginBottom: '6px', fontWeight: 600 }}>Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sofia Ramos"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  style={{ width: '100%', padding: '14px 18px', background: C.darkElevated, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.white, outline: 'none', fontSize: '.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '.85rem', color: C.grayLight, marginBottom: '6px', fontWeight: 600 }}>Ciudad / Ubicación</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CDMX / Cancún"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    style={{ width: '100%', padding: '14px 18px', background: C.darkElevated, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.white, outline: 'none', fontSize: '.95rem' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '.85rem', color: C.grayLight, marginBottom: '6px', fontWeight: 600 }}>Servicio Requerido</label>
                  <select
                    value={formState.service}
                    onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                    style={{ width: '100%', padding: '14px 18px', background: C.darkElevated, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.white, outline: 'none', fontSize: '.95rem' }}
                  >
                    <option value="Blindaje Textil">Blindaje Textil</option>
                    <option value="Higienización Profunda">Higienización Profunda</option>
                    <option value="Tratamiento de Piel">Tratamiento de Piel</option>
                    <option value="Sector Náutico">Sector Náutico (Yates)</option>
                    <option value="Aviación Ejecutiva">Aviación Ejecutiva</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '.85rem', color: C.grayLight, marginBottom: '6px', fontWeight: 600 }}>Mensaje o Detalle del Mobiliario</label>
                <textarea
                  rows={3}
                  placeholder="Describa brevemente el tipo de mueble o superficie a tratar..."
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  style={{ width: '100%', padding: '14px 18px', background: C.darkElevated, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.white, outline: 'none', fontSize: '.95rem', resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: C.gradient,
                  color: C.white,
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: C.accentGlow,
                  marginTop: '6px',
                }}
              >
                {submitted ? '✓ Enviando a WhatsApp...' : 'Enviar Solicitud por WhatsApp'}
              </button>
            </form>

          </div>
        </div>
      </section>

      {/* ═══ 12 · FOOTER ═══ */}
      <footer style={{ background: '#040404', padding: '64px 24px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 320px' }}>
            <div style={{ marginBottom: '16px' }}>
              <img src="/images/logo.webp" alt="CleanNew" style={{ height: '48px', objectFit: 'contain' }} />
            </div>
            <p style={{ color: C.gray, marginBottom: '20px', fontSize: '.92rem', lineHeight: 1.7 }}>
              Multinacional líder en servicios de higienización profunda y protección nanotecnológica para tapicería residencial, de lujo, embarcaciones y aviación.
            </p>
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '18px', fontWeight: 700, color: C.white }}>Navegación</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {navItems.map((n) => (
                <li key={n.id}>
                  <a onClick={() => goTo(n.id)} style={{ color: C.gray, textDecoration: 'none', cursor: 'pointer', fontSize: '.9rem' }}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ flex: '1 1 220px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '18px', fontWeight: 700, color: C.white }}>Redes y Enlaces</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="https://cleannew.com" target="_blank" rel="noreferrer" style={{ color: C.gray, textDecoration: 'none', fontSize: '.9rem' }}>CleanNew Global</a></li>
              <li><a href="https://wa.me/525580484283" target="_blank" rel="noreferrer" style={{ color: C.gray, textDecoration: 'none', fontSize: '.9rem' }}>Atención por WhatsApp</a></li>
              <li><a href="#" style={{ color: C.gray, textDecoration: 'none', fontSize: '.9rem' }}>Términos y Privacidad</a></li>
            </ul>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '56px', paddingTop: '24px', borderTop: `1px solid ${C.border}`, color: C.gray, fontSize: '.85rem' }}>
          © 2026 CleanNew · Todos los derechos reservados · Nanotecnología de Protección Textil
        </div>
      </footer>

    </div>
  );
}
