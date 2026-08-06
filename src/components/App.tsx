import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  Calendar, MapPin, Heart, Upload, Check, ChevronRight, Copy, QrCode,
  Landmark, Sparkles, Quote, Image as ImageIcon, ArrowRight
} from "lucide-react";

// --- GLOBAL STYLES & THEME ---
const GlobalStyles = () => (
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

    /* Shining border animation, only while an element with a border class is active (hover/focus) */
    @keyframes border-shine {
      0%, 100% {
        box-shadow: 0 0 0 1px hsl(var(--primary) / 0.3), 0 0 6px 0 hsl(var(--primary) / 0.15);
      }
      50% {
        box-shadow: 0 0 0 1px hsl(var(--primary) / 0.8), 0 0 16px 2px hsl(var(--primary) / 0.45);
      }
    }
    [class*="border"]:hover,
    [class*="border"]:focus-visible,
    [class*="border"]:focus-within {
      animation: border-shine 1.4s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      [class*="border"]:hover,
      [class*="border"]:focus-visible,
      [class*="border"]:focus-within {
        animation: none;
      }
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
  `}</style>
);

// --- ANIMATION HELPERS ---
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

// --- COMPONENTS ---
const Logo = () => (
  <div className="flex items-center gap-3">
    <img
      src="/images/logo.jpeg"
      alt="LPMI 58"
      className="w-9 h-9 rounded-full border-2 border-[hsl(var(--primary))] object-cover"
    />
    <span className="font-bold text-xl tracking-tight">HUT 58 LPMI</span>
  </div>
);

const SectionLabel = ({ children }) => (
  <div className="text-xs tracking-[3px] uppercase text-[hsl(var(--primary))] mb-4 font-semibold">
    {children}
  </div>
);

const HLSVideo = ({ src, className, autoPlay = true, loop = true, muted = true }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let hls;
    const loadVideo = () => {
      const video = videoRef.current;
      if (!video) return;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    };

    if (!window.Hls) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.3.5/dist/hls.light.min.js';
      script.async = true;
      script.onload = loadVideo;
      document.body.appendChild(script);
    } else {
      loadVideo();
    }
    return () => hls?.destroy();
  }, [src]);

  return <video ref={videoRef} className={className} autoPlay={autoPlay} loop={loop} muted={muted} playsInline />;
};

const ScrollRevealWord = ({ children, progress, range, isHighlighted }) => {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className={`mr-[0.25em] inline-block ${isHighlighted ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--hero-subtitle))]"}`}
    >
      {children}
    </motion.span>
  );
};

const ScrollRevealParagraph = ({ text, highlightedWords = [], className = "" }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");

  return (
    <p ref={containerRef} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        const isHighlighted = highlightedWords.some(hw => cleanWord === hw.toLowerCase());
        return (
          <ScrollRevealWord key={i} progress={scrollYProgress} range={[start, end]} isHighlighted={isHighlighted}>
            {word}
          </ScrollRevealWord>
        );
      })}
    </p>
  );
};

// --- MASONRY GREETING WALL ---
// Muted, jewel-adjacent pastels with a warm gold undertone to match the site's
// black & gold palette; each has a matching deeper variant for prefers-color-scheme: dark.
const PASTELS = [
  { light: "#FBF3E7", dark: "#E8DAC3" }, // Champagne Ivory
  { light: "#F5E3E0", dark: "#E4C9C4" }, // Dusty Rose
  { light: "#E9EFE7", dark: "#CBDBC9" }, // Sage Mist
  { light: "#E6EEF5", dark: "#C8DBEA" }, // Powder Blue
  { light: "#F1E9E2", dark: "#E0CFBF" }, // Warm Taupe
  { light: "#EFE6F2", dark: "#D9C6E0" }, // Antique Lilac
  { light: "#EDEEF0", dark: "#D3D6DB" }, // Pearl Gray
  { light: "#F8EFDD", dark: "#E9D9B3" }, // Honey Cream
];

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const randomPastel = () => PASTELS[Math.floor(Math.random() * PASTELS.length)];

const UcapanCard = ({ u, index }) => {
  const seed = hashString(`${u.nama}${u.teks}${index}`);
  // Start from a deterministic pick so server- and client-rendered markup match,
  // then swap to a truly random pastel once mounted on the client.
  const [pastel, setPastel] = useState(PASTELS[seed % PASTELS.length]);
  useEffect(() => {
    setPastel(randomPastel());
  }, []);

  return (
    <div
      className="masonry-card mb-5 rounded-[20px] p-5 md:p-6 relative overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1"
      style={{
        // @ts-ignore custom properties consumed by the .masonry-card rule
        "--pastel-light": pastel.light,
        "--pastel-dark": pastel.dark,
      }}
    >
      <Quote size={28} className="absolute top-4 left-4" style={{ color: "rgba(20,20,24,0.15)" }} />
      <p
        className="relative text-[15px] md:text-base mb-6 mt-8"
        style={{ color: "rgba(20,20,24,0.86)", lineHeight: 1.7 }}
      >
        {u.teks}
      </p>
      <div className="relative font-semibold text-sm" style={{ color: "rgba(20,20,24,0.86)" }}>
        {u.nama}
      </div>
      {u.asal && (
        <div className="relative text-xs mt-0.5" style={{ color: "rgba(20,20,24,0.5)" }}>
          {u.asal}
        </div>
      )}
    </div>
  );
};

// Distributes items round-robin into `count` columns.
const splitIntoColumns = (items: any[], count: number) => {
  const columns: any[][] = Array.from({ length: count }, () => []);
  items.forEach((item, i) => columns[i % count].push(item));
  return columns;
};

// Auto-scroll only kicks in once the wall has enough cards to loop meaningfully.
const AUTO_SCROLL_THRESHOLD = 20;

const MarqueeColumn = ({ items, direction = "up", duration = 32, animate = true, className = "" }: { items: any[]; direction?: "up" | "down"; duration?: number; animate?: boolean; className?: string }) => {
  const shouldReduceMotion = useReducedMotion();
  if (items.length === 0) return null;

  const isAnimated = animate && !shouldReduceMotion;
  // Duplicate the column so the loop can seamlessly wrap at -50%/0.
  const looped = isAnimated ? [...items, ...items] : items;

  return (
    <div className={`marquee-column relative h-full ${isAnimated ? "overflow-hidden" : "overflow-visible"} ${className}`}>
      <div
        className={`marquee-track flex flex-col ${isAnimated ? (direction === "up" ? "animate-marquee-up" : "animate-marquee-down") : ""}`}
        style={isAnimated ? { animationDuration: `${duration}s` } : undefined}
      >
        {looped.map((u, i) => (
          <UcapanCard key={`${u.nama}-${i}`} u={u} index={i} />
        ))}
      </div>
    </div>
  );
};

const ScrollingUcapanWall = ({ items }: { items: any[] }) => {
  const columns = splitIntoColumns(items, 4);
  const animate = items.length > AUTO_SCROLL_THRESHOLD;

  return (
    <div className={`relative w-full ${animate ? "h-[560px] md:h-[640px]" : ""}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 h-full">
        <MarqueeColumn items={columns[0]} direction="up" duration={34} animate={animate} />
        <MarqueeColumn items={columns[1]} direction="down" duration={40} animate={animate} className="hidden sm:block" />
        <MarqueeColumn items={columns[2]} direction="up" duration={30} animate={animate} className="hidden lg:block" />
        <MarqueeColumn items={columns[3]} direction="down" duration={38} animate={animate} className="hidden xl:block" />
      </div>
      {/* Fade top & bottom edges into the page background, only relevant while auto-scrolling */}
      {animate && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />
        </>
      )}
    </div>
  );
};

// --- DATA ---
const timeline = [
  {
    year: "1968",
    title: "Awal Perintisan",
    text: "Pelayanan ini berawal ketika Dr. Bill Bright mengajak Pdt. Ais Pormes untuk memulai pelayanan dan menunjuknya sebagai Direktur CCCI pada tahun 1968. Pada tahun yang sama, organisasi yang bersifat interdenominasi ini didirikan oleh Dr. Ais Pormes dengan nama Lembaga Penginjilan Mahasiswa Indonesia.",
  },
  {
    year: "1976-1977",
    title: "I Found it - Sudah Kutemukan!",
    text: "Sebuah kampanye Kabar Baik yang telah mengangkat peran LPMI dalam misi yang melibatkan para mahasiswa dan gereja-gereja lokal.",
  },
  {
    year: "1977",
    title: "Reorganisasi",
    text: "Reorganisasi pelayanan dilakukan pada tahun 1976 di bawah kepemimpinan kolektif Dewan Perencana Pelayanan Nasional (DPPN). Sejak tanggal 2 Agustus 1977 berubah nama menjadi Lembaga Pelayanan Mahasiswa Indonesia dengan Pdt. Agus B. Lay sebagai Direktur.",
  },
  {
    year: "1981",
    title: "Film Yesus",
    text: "Film Yesus diterjemahkan ke dalam bahasa Indonesia dan telah menjadi sarana yang efektif untuk memperkenalkan Yesus Kristus sebagai Juruselamat dan Tuhan dan menjadi sarana pertumbuhan Iman Kristen.",
  },
  {
    year: "1985",
    title: "EXPLO '85",
    text: "EXPLO '85 menjadi sebuah event yang menjadi tonggak kegerakan pelayanan nasional yang melatih lebih dari 5.000 mahasiswa dan pemuda dari seluruh pelosok Indonesia yang dilaksanakan di Senayan yang secara bersamaan dari berbagai negara yang direlay melalui siaran satelit.",
  },
  {
    year: "1998",
    title: "LPMI 5 Wilayah",
    text: "Untuk tujuan pengembangan kepemimpinan dan mempercepat jangkauan pelayanan, LPMI dibagi ke dalam 5 Wilayah dengan Pdt. Drs. Agus Lay sebagai Direktur Nasional. Sepeninggal Pdt. Agus Lay kembali ke Rumah Bapa di Sorga, kepemimpinan 5 wilayah menjadi lebih otonom. Pdt. Dr. Nus Reimas menjadi penggerak pelayanan di tataran nasional dengan melibatkan para Mitra Pelayanan melalui Histories Handsful.",
  },
  {
    year: "2018",
    title: "Kepemimpinan Nasional Bersatu",
    text: "LPMI kembali menjadi satu dalam kepemimpinan Nasional yang mengangkat Pdt. Drs. Wim Wairata sebagai Direktur Nasional. Integrasi pelayanan dilakukan dengan tidak mudah.",
  },
  {
    year: "2026",
    title: "HUT ke-58",
    text: "HUT ke-58 — \"Allah Berkarya Melalui Setiap Generasi.\"",
  },
];

const initialUcapan = [
  { nama: "Pdt. Samuel Wijaya", asal: "GKJ Bogor", teks: "Selamat ulang tahun ke-58, LPMI! Terus jadi berkat bagi generasi mahasiswa Indonesia." },
  { nama: "Ruth A.", asal: "Alumni 2014", teks: "LPMI membentuk saya jadi pemimpin yang takut akan Tuhan. Selamat ulang tahun!" },
  { nama: "Komisi Pemuda GKI Kebayoran", asal: "Gereja Mitra", teks: "Kiranya LPMI terus setia menjangkau kampus-kampus dengan Injil. Tuhan Yesus memberkati!" },
];

const galeriFoto = [
  { src: "https://picsum.photos/seed/lpmi1/600/450", caption: "Retret pemimpin mahasiswa" },
  { src: "https://picsum.photos/seed/lpmi2/600/450", caption: "KKR kampus tahunan" },
  { src: "https://picsum.photos/seed/lpmi3/600/450", caption: "Pelatihan Woman Mission" },
  { src: "https://picsum.photos/seed/lpmi4/600/450", caption: "Ibadah raya HUT ke-50" },
  { src: "https://picsum.photos/seed/lpmi5/600/450", caption: "Pengutusan tim pelayanan" },
  { src: "https://picsum.photos/seed/lpmi6/600/450", caption: "Persekutuan lintas kampus" },
];

const posterUcapan = [
  { nama: "GKJ Bogor", pesan: "Selamat 58 tahun berkarya bagi generasi muda Indonesia. Tuhan Yesus memberkati!", warna: "var(--card)" },
  { nama: "GKI Kebayoran", pesan: "Kiranya LPMI terus menjadi terang di kampus-kampus Indonesia. Selamat HUT ke-58!", warna: "var(--muted)" },
  { nama: "Kel. Hartono", pesan: "Terima kasih LPMI sudah membentuk iman anak kami. Selamat ulang tahun!", warna: "var(--card)" },
  { nama: "Alumni 1998", pesan: "26 tahun berlalu, nilai-nilai LPMI masih kami bawa. Selamat 58 tahun!", warna: "var(--muted)" },
];

const packages = [
  { id: "silver", nama: "Silver", harga: "Rp 250.000", benefit: ["Poster tayang di website selama 1 bulan"] },
  { id: "gold", nama: "Gold", harga: "Rp 500.000", benefit: ["Poster tayang di website selama 1 bulan", "Tayang di LED saat acara di Hotel Aryaduta"] },
  { id: "platinum", nama: "Platinum", harga: "Rp 1.000.000", benefit: ["Poster tayang di website 1 bulan", "Tayang di LED acara", "Posisi utama & durasi lebih lama"] },
];

// --- MAIN APP ---
export default function App() {
  const [ucapanList, setUcapanList] = useState(initialUcapan);
  const [nama, setNama] = useState("");
  const [asal, setAsal] = useState("");
  const [teks, setTeks] = useState("");
  const [submittingUcapan, setSubmittingUcapan] = useState(false);

  const [selectedPkg, setSelectedPkg] = useState("gold");
  const [payMethod, setPayMethod] = useState("transfer");
  const [posterNama, setPosterNama] = useState("");
  const [posterPesan, setPosterPesan] = useState("");
  const [customUpload, setCustomUpload] = useState(false);
  const [customFile, setCustomFile] = useState("");
  const [posterSubmitted, setPosterSubmitted] = useState(false);
  const [posterSubmitting, setPosterSubmitting] = useState(false);
  const [buktiFile, setBuktiFile] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/ucapan")
      .then((res) => (res.ok ? res.json() : []))
      .then((saved) => {
        if (Array.isArray(saved) && saved.length > 0) {
          setUcapanList([...saved, ...initialUcapan]);
        }
      })
      .catch(() => {});
  }, []);

  const [posterIndex, setPosterIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setPosterIndex((i) => (i + 1) % posterUcapan.length), 5000);
    return () => clearInterval(timer);
  }, []);
  const activePoster = posterUcapan[posterIndex];

  const submitUcapan = async (e) => {
    e.preventDefault();
    if (!nama.trim() || !teks.trim() || submittingUcapan) return;
    setSubmittingUcapan(true);
    try {
      const res = await fetch("/api/ucapan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, asal, teks }),
      });
      const saved = res.ok ? await res.json() : { nama, asal, teks };
      setUcapanList([saved, ...ucapanList]);
      setNama(""); setAsal(""); setTeks("");
    } finally {
      setSubmittingUcapan(false);
    }
  };

  const submitPoster = async (e) => {
    e.preventDefault();
    if (!posterNama.trim() || posterSubmitting) return;
    setPosterSubmitting(true);
    try {
      await fetch("/api/poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: posterNama,
          pesan: customUpload ? "" : posterPesan,
          customFile: customUpload ? customFile : "",
          paket: selectedPkg,
          metodeBayar: payMethod,
        }),
      });
      setPosterSubmitted(true);
    } finally {
      setPosterSubmitting(false);
    }
  };

  const copyRek = () => {
    navigator.clipboard?.writeText("1234567890 a.n. Yayasan LPMI - BCA");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="relative w-full selection:bg-white selection:text-black min-h-screen text-[hsl(var(--foreground))] bg-background">
      <GlobalStyles />

      {/* 1. Navbar */}
      <nav className="relative z-50 px-8 md:px-28 py-4 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#sejarah" className="hover:text-[hsl(var(--foreground))] transition-colors">Sejarah</a>
          <span>•</span>
          <a href="#ucapan" className="hover:text-[hsl(var(--foreground))] transition-colors">Ucapan</a>
          <span>•</span>
          <a href="#poster" className="hover:text-[hsl(var(--foreground))] transition-colors">Persembahan</a>
          <span>•</span>
          <a href="#acara" className="hover:text-[hsl(var(--foreground))] transition-colors">Acara</a>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <HLSVideo src="https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />

          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[hsl(var(--primary))] opacity-[0.03] blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[hsl(var(--primary))] opacity-[0.03] blur-[120px]" />

          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[hsl(var(--background))] to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl w-full">
          <motion.div {...fadeUp(0)} className="flex items-center justify-center gap-2 mb-6">
            <span className="text-xs uppercase tracking-widest text-[hsl(var(--primary))]">30 Agustus 2026</span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] leading-tight mb-6">
            Allah Berkarya Melalui <br/><span className="font-serif italic font-normal text-[hsl(var(--primary))]">Setiap Generasi</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg text-hero-subtitle max-w-2xl mx-auto mb-12 leading-relaxed">
            Bersama Bp. David Robbins, President CCC International, sebagai tamu kehormatan. 
            Bergabunglah merayakan 58 tahun kesetiaan Tuhan dalam pelayanan mahasiswa.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center gap-4">
            <a href="#poster" className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold rounded-full px-8 py-3.5 flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Heart size={18} /> Kirim Poster Ucapan
            </a>
            <a href="#acara" className="liquid-glass text-foreground font-medium rounded-full px-8 py-3.5 flex items-center gap-2 hover:bg-white/5 transition-colors border border-[hsl(var(--primary))/0.3]">
              <Calendar size={18} className="text-[hsl(var(--primary))]" /> Info Acara
            </a>
          </motion.div>
        </div>
      </section>

      {/* 3. Sejarah Section (Adapting "Search has changed") */}
      <section id="sejarah" className="pt-32 md:pt-44 pb-20 md:pb-32 px-8 md:px-28 max-w-5xl mx-auto bg-black">
        <div className="text-center mb-24">
          <motion.div {...fadeUp(0)}>
            <SectionLabel>Sejarah Singkat</SectionLabel>
          </motion.div>
          <motion.h2 {...fadeUp(0.1)} className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-6">
            58 Tahun <span className="font-serif italic font-normal text-[hsl(var(--primary))]">Perjalanan.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.2)} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dari kelompok kecil doa dan pemuridan, meluas menjadi jejaring pergerakan mahasiswa yang memberkati bangsa.
          </motion.p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {timeline.map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
              className="relative flex gap-8 pb-16 last:pb-0 group"
            >
              {/* Connecting Line */}
              {i !== timeline.length - 1 && (
                <div className="absolute left-[27px] top-[60px] bottom-[-20px] w-0.5 timeline-line opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              
              {/* Year Node */}
              <div className="shrink-0 relative z-10">
                <motion.div 
                  whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-14 h-14 rounded-full border bg-card flex items-center justify-center font-serif text-xl timeline-node cursor-default transition-colors duration-300"
                >
                  {item.year.slice(0, 4)}
                </motion.div>
              </div>

              {/* Content Box */}
              <div className="pt-2 flex-1">
                <motion.div 
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="liquid-glass rounded-2xl p-6 md:p-8 hover:bg-white/5 transition-colors duration-300 border border-[hsl(var(--primary))/0.1]"
                >
                  <div className="font-serif italic text-3xl mb-1 text-[hsl(var(--primary))]">{item.year}</div>
                  <div className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">{item.title}</div>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Dinding Ucapan (Adapting Mission Section style) */}
      <section id="ucapan" className="pt-0 pb-32 md:pb-44 px-8 md:px-28 max-w-7xl mx-auto flex flex-col items-center ">
        <motion.div {...fadeUp(0)} className="w-full max-w-[800px] aspect-square rounded-[3rem] overflow-hidden mb-24 relative bg-black">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80"
            src="/videos/motion-58.mp4" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </motion.div>

        <div className="max-w-4xl text-center mb-20">
          <ScrollRevealParagraph
            text="Tinggalkan jejak kasih dan dukungan. Setiap ucapan menjadi pengingat akan kesetiaan Tuhan yang merajut persaudaraan di sepanjang generasi."
            highlightedWords={['kasih', 'dukungan', 'kesetiaan', 'persaudaraan']}
            className="text-2xl md:text-4xl lg:text-5xl font-medium tracking-[-1px] justify-center leading-tight mb-10"
          />
        </div>

        <motion.div {...fadeUp(0.2)} className="w-full">
          <div className="max-w-4xl mx-auto">
            <SectionLabel>Dinding Ucapan</SectionLabel>
            <form onSubmit={submitUcapan} className="liquid-glass rounded-2xl p-6 mb-16 flex flex-col gap-4">
               <div className="grid sm:grid-cols-2 gap-4">
                <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama Anda"
                  className="bg-transparent border border-white/20 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/50 text-white placeholder:text-white/40" />
                <input value={asal} onChange={(e) => setAsal(e.target.value)} placeholder="Organisasi / Volunteer / Mitra / Gereja"
                  className="bg-transparent border border-white/20 rounded-lg px-4 py-3 text-sm outline-none focus:border-white/50 text-white placeholder:text-white/40" />
              </div>
              <textarea value={teks} onChange={(e) => setTeks(e.target.value)} placeholder="Tulis ucapan selamat..." rows={4}
                className="bg-transparent border border-white/20 rounded-lg px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))] text-white placeholder:text-white/40 resize-none" />
              <button type="submit" className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold rounded-lg px-6 py-3 text-sm self-end hover:opacity-90 transition-opacity">
                Kirim Ucapan
              </button>
            </form>
          </div>

          <ScrollingUcapanWall items={ucapanList} />
        </motion.div>
      </section>

      {/* 5. Poster & Persembahan (Adapting Solution Section) */}
      <section id="poster" className="py-32 md:py-44 px-8 md:px-28 border-t border-border/30 max-w-7xl mx-auto">
        <motion.div {...fadeUp(0)} className="mb-16">
          <SectionLabel>BERMITRA</SectionLabel>
          <h2 className="text-4xl md:text-6xl tracking-tight max-w-2xl mb-6">
            Dukung pelayanan melalui <span className="font-serif italic">Persembahan</span>
          </h2>
          <p className="text-muted-foreground">Poster tayang di website dan LED Gala Dinner.</p>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_1.5fr] gap-12">
          {/* Packages */}
          <motion.div {...fadeUp(0.2)} className="flex flex-col gap-4">
            {packages.map((p) => (
              <button key={p.id} onClick={() => setSelectedPkg(p.id)}
                className={`text-left rounded-2xl p-6 border transition-all ${selectedPkg === p.id ? 'bg-[hsl(var(--primary))/0.1] border-[hsl(var(--primary))]' : 'bg-transparent border-white/10 hover:border-white/20'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold text-lg ${selectedPkg === p.id ? 'text-[hsl(var(--primary))]' : ''}`}>{p.nama}</span>
                  {selectedPkg === p.id && <Check size={18} className="text-[hsl(var(--primary))]" />}
                </div>
                <div className="font-serif italic text-xl mb-4 text-white/70">{p.harga}</div>
                <ul className="space-y-2">
                  {p.benefit.map((b, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2 items-start">
                      <ChevronRight size={14} className="shrink-0 mt-0.5 text-[hsl(var(--primary))]" /> {b}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div {...fadeUp(0.3)}>
            {!posterSubmitted ? (
               <form onSubmit={submitPoster} className="bg-card border border-white/10 rounded-3xl p-8">
                <div className="mb-6">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">Nama / Gereja Mitra</label>
                  <input value={posterNama} onChange={(e) => setPosterNama(e.target.value)} required
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))] text-white"
                    placeholder="cth. GKJ Bogor" />
                </div>

                <div className="mb-6">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">Pesan Singkat / Desain</label>
                  <div className="flex gap-4 mb-4">
                    <button type="button" onClick={() => setCustomUpload(false)} className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${!customUpload ? 'bg-white/10 border-white/30' : 'border-white/10 text-white/50 hover:bg-white/5'}`}>Teks</button>
                    <button type="button" onClick={() => setCustomUpload(true)} className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${customUpload ? 'bg-white/10 border-white/30' : 'border-white/10 text-white/50 hover:bg-white/5'}`}>Unggah Gambar</button>
                  </div>
                  
                  {customUpload ? (
                    <label className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                      <Upload size={20} className="text-white/40" />
                      <span className="text-sm text-white/60">{customFile || "Format JPG/PNG (4:5)"}</span>
                      <input type="file" className="hidden" onChange={(e) => setCustomFile(e.target.files?.[0]?.name || "")} />
                    </label>
                  ) : (
                    <textarea value={posterPesan} onChange={(e) => setPosterPesan(e.target.value)} rows={3}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))] text-white"
                      placeholder="Ucapan yang akan tampil..." />
                  )}
                </div>

                <div className="mb-8">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">Pembayaran</label>
                   <div className="flex gap-2 mb-4">
                    <button type="button" onClick={() => setPayMethod("transfer")} className={`flex-1 py-2 text-sm flex items-center justify-center gap-2 rounded-lg border transition-colors ${payMethod === "transfer" ? 'bg-white/10 border-white/30' : 'border-white/10 text-white/50 hover:bg-white/5'}`}><Landmark size={14} /> Transfer</button>
                    <button type="button" onClick={() => setPayMethod("qris")} className={`flex-1 py-2 text-sm flex items-center justify-center gap-2 rounded-lg border transition-colors ${payMethod === "qris" ? 'bg-white/10 border-white/30' : 'border-white/10 text-white/50 hover:bg-white/5'}`}><QrCode size={14} /> QRIS</button>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4 text-sm border border-white/5 flex flex-col sm:flex-row items-center gap-4">
                    {payMethod === "transfer" ? (
                      <div className="w-full">
                        <div className="font-mono text-white mb-1">BCA &middot; 34230213450</div>
                        <div className="text-white/60">a.n. Yayasan LPMI</div>
                        <button type="button" onClick={copyRek} className="mt-3 text-xs flex items-center gap-1 font-medium text-white/80 hover:text-white transition-colors">
                          <Copy size={12} /> {copied ? "Tersalin!" : "Salin Rekening"}
                        </button>
                      </div>
                    ) : (
                       <>
                        <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shrink-0">
                          <QrCode size={40} className="text-black" />
                        </div>
                        <div className="text-white/60 text-xs leading-relaxed">Pindai QRIS ini menggunakan aplikasi bank/e-wallet pilihan Anda.</div>
                      </>
                    )}
                  </div>
                </div>

                <button type="submit" className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg px-6 py-4 transition-opacity hover:opacity-90">
                  Kirim & Ajukan Verifikasi
                </button>
              </form>
            ) : (
              <div className="bg-card border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <Check size={32} className="text-foreground" />
                </div>
                <h3 className="text-2xl font-medium mb-2">Terima kasih, {posterNama}!</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Pengajuan paket <span className="text-white font-medium">{packages.find(p => p.id === selectedPkg)?.nama}</span> diterima. Poster akan tayang setelah diverifikasi panitia.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 6. Live Display (Adapting Gallery/CTA logic) */}
      <section className="py-24 border-t border-border/30 overflow-hidden flex flex-col items-center justify-center relative">
        <div className="text-center z-10 px-4 w-full max-w-4xl">
          <SectionLabel>Sedang Tayang</SectionLabel>
           
           <div className="relative mx-auto mt-12 w-full max-w-xl aspect-[4/3] rounded-3xl overflow-hidden liquid-glass flex flex-col items-center justify-center p-8 text-center border-2 border-[hsl(var(--primary))/0.3]" 
                style={{ backgroundColor: activePoster.warna, transition: 'background-color 0.8s ease' }}>
             <Sparkles size={24} className="text-[hsl(var(--primary))] mb-6" />
             <p className="font-serif italic text-2xl md:text-3xl leading-snug text-white mb-8">"{activePoster.pesan}"</p>
             <div className="text-xs uppercase tracking-[3px] text-white/60">{activePoster.nama}</div>
           </div>
        </div>
      </section>

      {/* 7. Galeri & Acara (CTA Section) */}
      <section id="acara" className="relative py-32 md:py-44 border-t border-border/30 overflow-hidden flex flex-col items-center justify-center text-center px-4 bg-background">
        <div className="relative z-10 flex flex-col items-center w-full max-w-6xl">
           <motion.div {...fadeUp(0)} className="mb-16">
             <SectionLabel>Gala Dinner</SectionLabel>
             <h2 className="text-5xl md:text-7xl font-serif italic mb-6 text-[hsl(var(--primary))]">Puncak Perayaan</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-8 w-full max-w-3xl mb-24">
             <motion.div {...fadeUp(0.2)} className="liquid-glass rounded-2xl p-8 flex flex-col items-center justify-center gap-3 border border-[hsl(var(--primary))/0.2]">
               <Calendar size={28} className="text-[hsl(var(--primary))] mb-2" />
               <div className="font-medium text-lg">30 Agustus 2026</div>
               <div className="text-sm text-muted-foreground">Pukul 18.00 WIB</div>
             </motion.div>
             <motion.div {...fadeUp(0.3)} className="liquid-glass rounded-2xl p-8 flex flex-col items-center justify-center gap-3 border border-[hsl(var(--primary))/0.2]">
               <MapPin size={28} className="text-[hsl(var(--primary))] mb-2" />
               <div className="font-medium text-lg">Hotel Aryaduta</div>
               <div className="text-sm text-muted-foreground">Jakarta Pusat</div>
             </motion.div>
          </div>

          <motion.div {...fadeUp(0.4)} className="w-full">
            <h3 className="text-2xl font-medium mb-8">Momen Pelayanan</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galeriFoto.map((f, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                  <img src={f.src} alt={f.caption} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <span className="text-xs text-white/90 text-left">{f.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-12 px-8 md:px-28 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 bg-background">
        <div className="text-sm text-muted-foreground">
          © 2026 LPMI. Lembaga Pelayanan Mahasiswa Indonesia.
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>panitia@lpmi.or.id</span>
          <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}