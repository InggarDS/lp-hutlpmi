import React from "react";

// --- GLOBAL STYLES & THEME ---
export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');

    :root {
      /* Black Backgrounds */
      --background: 0 0% 0%;
      --foreground: 210 20% 98%;
      --card: 223 42% 13%;
      --card-foreground: 210 20% 98%;

      /* Gold Accents */
      --primary: 44 74% 63%;
      --primary-foreground: 223 49% 8%;

      /* Muted Navy tones */
      --secondary: 223 30% 20%;
      --secondary-foreground: 210 20% 90%;
      --muted: 223 35% 15%;
      --muted-foreground: 215 20% 65%;

      /* Gold Accents 2 */
      --accent: 44 74% 63%;
      --accent-foreground: 223 49% 8%;

      /* Borders & Inputs */
      --border: 223 30% 25%;
      --input: 223 30% 20%;
      --ring: 44 74% 63%;
      --hero-subtitle: 210 20% 85%;
    }

    body {
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      scroll-behavior: smooth;
    }

    .font-serif {
      font-family: 'Instrument Serif', serif;
    }

    .text-muted-foreground { color: hsl(var(--muted-foreground)); }
    .text-hero-subtitle { color: hsl(var(--hero-subtitle)); }
    .bg-foreground { background-color: hsl(var(--foreground)); }
    .text-background { color: hsl(var(--background)); }
    .border-border { border-color: hsl(var(--border)); }
    .bg-background { background-color: hsl(var(--background)); }
    .bg-card { background-color: hsl(var(--card)); }
    .bg-muted { background-color: hsl(var(--muted)); }

    /* Liquid Glass Effect */
    .liquid-glass {
      background: rgba(255, 255, 255, 0.01);
      background-blend-mode: luminosity;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: none;
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }

    .liquid-glass::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1.4px;
      background: linear-gradient(180deg,
        rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
        rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
        rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: hsl(var(--background)); }
    ::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted)); }

    /* Timeline specific styles */
    .timeline-node {
      box-shadow: 0 0 0 4px hsl(var(--background));
      border-color: hsl(var(--primary));
      color: hsl(var(--primary));
    }
    .timeline-line {
      background: linear-gradient(to bottom, hsl(var(--primary)) 0%, transparent 100%);
    }

    /* Greeting wall masonry cards */
    .masonry-card {
      background-color: var(--pastel-light);
      box-shadow: 0 1px 2px rgba(0,0,0,0.18), 0 8px 20px -6px rgba(0,0,0,0.35);
      transition: box-shadow 280ms ease, transform 280ms ease;
      will-change: transform;
    }
    .masonry-card:hover {
      box-shadow: 0 2px 4px rgba(0,0,0,0.22), 0 16px 32px -8px rgba(0,0,0,0.45);
    }
    @media (prefers-color-scheme: dark) {
      .masonry-card {
        background-color: var(--pastel-dark);
      }
    }

    /* Auto-scrolling greeting wall columns */
    .marquee-column:hover .marquee-track {
      animation-play-state: paused;
    }
    @keyframes marquee-up {
      from { transform: translateY(0); }
      to { transform: translateY(-50%); }
    }
    @keyframes marquee-down {
      from { transform: translateY(-50%); }
      to { transform: translateY(0); }
    }
    .animate-marquee-up {
      animation: marquee-up linear infinite;
    }
    .animate-marquee-down {
      animation: marquee-down linear infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .animate-marquee-up, .animate-marquee-down {
        animation: none;
      }
    }

    /* Package card shine sweep, only while selected */
    @keyframes pkg-shine-sweep {
      0% { transform: translateX(-140%) rotate(20deg); }
      100% { transform: translateX(240%) rotate(20deg); }
    }
    .pkg-shine::after {
      content: '';
      position: absolute;
      top: -60%;
      left: 0;
      width: 25%;
      height: 220%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent);
      animation: pkg-shine-sweep 2.4s ease-in-out infinite;
      pointer-events: none;
    }
    @media (prefers-reduced-motion: reduce) {
      .pkg-shine::after {
        animation: none;
        display: none;
      }
    }
  `}</style>
);

export default GlobalStyles;
