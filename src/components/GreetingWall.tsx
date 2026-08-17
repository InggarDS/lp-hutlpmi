import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Quote } from "lucide-react";

// --- GREETING WALL (Live Display) ---
export const TIER_DURATION_MS = { platinum: 10000, gold: 7000, silver: 3000 };
export const TIER_RANK = { platinum: 0, gold: 1, silver: 2 };
export const TIER_ACCENT = { silver: "#6B7280", gold: "#A9770E", platinum: "#3D6A96" };
export const TIER_LABEL = { silver: "Silver", gold: "Gold", platinum: "Platinum" };
const POLL_INTERVAL_MS = 7000;

const hexToRgba = (hex, alpha) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isImageUrl = (v) => typeof v === "string" && v.startsWith("http");

export const normalizeGreeting = (s) => ({
  _id: s._id,
  nama: s.nama,
  pesan: s.pesan || "",
  gambar: isImageUrl(s.customFile) ? s.customFile : "",
  paket: TIER_RANK[s.paket] !== undefined ? s.paket : "silver",
  createdAt: s.createdAt,
});

export const sortGreetingQueue = (items) =>
  [...items].sort((a, b) => {
    const rankDiff = TIER_RANK[a.paket] - TIER_RANK[b.paket];
    if (rankDiff !== 0) return rankDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

const TierBadge = ({ paket, large = false }: { paket: string; large?: boolean }) => {
  const accent = TIER_ACCENT[paket] || TIER_ACCENT.silver;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-[2px] shrink-0 ${large ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-[10px]"}`}
      style={{ backgroundColor: hexToRgba(accent, 0.12), color: accent, border: `1px solid ${hexToRgba(accent, 0.35)}` }}
    >
      <Sparkles size={large ? 16 : 10} /> {TIER_LABEL[paket] || "Silver"}
    </span>
  );
};

export const GreetingCard = React.memo(function GreetingCard({ item, variant = "inline" }: { item: any; variant?: "inline" | "fullscreen" }) {
  const textLight = { color: "#f5f5f5" };
  const isFullscreen = variant === "fullscreen";
  // Slow Ken Burns zoom-in for the card's own on-screen time, matching the
  // background photo zoom so poster + text feel like part of the same motion.
  const durationSec = (TIER_DURATION_MS[item.paket] || 5000) / 1000;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, y: -10, filter: "blur(6px)" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute inset-0 flex flex-col items-center justify-center text-center ${isFullscreen ? "gap-8 p-10 sm:p-16" : "gap-4 p-6"}`}
    >
      <motion.div
        className="flex flex-col items-center max-w-full max-h-full"
        style={{ gap: isFullscreen ? "2rem" : "1rem" }}
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: durationSec, ease: "easeOut" }}
      >
        {item.gambar && (
          <img
            src={item.gambar}
            alt={item.nama}
            loading="lazy"
            className={`max-w-full w-auto h-auto object-contain rounded-xl ${isFullscreen ? "max-h-[38vh] sm:max-h-[48vh]" : "max-h-48 sm:max-h-64 md:max-h-72"}`}
          />
        )}
        {!item.gambar && <Quote size={isFullscreen ? 48 : 26} style={{ color: "rgba(245,245,245,0.35)" }} />}
        {item.pesan && (
          <p className={`font-serif italic leading-snug ${isFullscreen ? "text-3xl sm:text-5xl md:text-6xl" : "text-xl md:text-2xl"}`} style={textLight}>&ldquo;{item.pesan}&rdquo;</p>
        )}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className={`font-semibold ${isFullscreen ? "text-2xl sm:text-3xl" : "text-[15px]"}`} style={textLight}>{item.nama}</span>
          <TierBadge paket={item.paket} large={isFullscreen} />
        </div>
      </motion.div>
    </motion.div>
  );
});

export const GreetingEmptyState = ({ variant = "inline" }: { variant?: "inline" | "fullscreen" }) => {
  const isFullscreen = variant === "fullscreen";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 rounded-[28px] overflow-hidden flex items-center justify-center liquid-glass border-2 border-[hsl(var(--primary))/0.2]"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(120deg, rgba(229,193,88,0.14), rgba(142,124,195,0.14), rgba(76,154,118,0.14))",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))]"
          style={{ left: `${(i * 47) % 100}%`, top: `${(i * 31) % 100}%` }}
          animate={{ y: [0, -16, 0], opacity: [0.15, 0.6, 0.15] }}
          transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        />
      ))}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className={`relative z-10 flex flex-col items-center gap-3 text-center ${isFullscreen ? "px-16" : "px-8"}`}
      >
        <Sparkles size={isFullscreen ? 48 : 28} className="text-[hsl(var(--primary))]" />
        <p className={`text-white/70 uppercase tracking-[3px] ${isFullscreen ? "text-xl" : "text-sm"}`}>Waiting for new greetings...</p>
      </motion.div>
    </motion.div>
  );
};

export function GreetingWall({ tiers, variant = "inline", className = "" }: { tiers?: string[]; variant?: "inline" | "fullscreen"; className?: string }) {
  const [display, setDisplay] = useState(null);
  const queueRef = useRef([]);
  const lastIdRef = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const advance = () => {
      if (!mountedRef.current) return;
      const q = queueRef.current;
      if (q.length === 0) {
        setDisplay(null);
        timerRef.current = setTimeout(advance, 4000);
        return;
      }
      let nextIdx = 0;
      if (lastIdRef.current) {
        const idx = q.findIndex((it) => it._id === lastIdRef.current);
        nextIdx = idx === -1 ? 0 : (idx + 1) % q.length;
      }
      const item = q[nextIdx];
      lastIdRef.current = item._id;
      setDisplay(item);
      const duration = TIER_DURATION_MS[item.paket] || 5000;
      timerRef.current = setTimeout(advance, duration);
    };

    const refreshQueue = async () => {
      try {
        const res = await fetch("/api/poster?status=approved");
        if (!res.ok) return;
        const raw = await res.json();
        if (Array.isArray(raw)) {
          let normalized = raw.map(normalizeGreeting);
          if (tiers && tiers.length > 0) {
            normalized = normalized.filter((g) => tiers.includes(g.paket));
          }
          queueRef.current = sortGreetingQueue(normalized);
        }
      } catch {}
    };

    (async () => {
      await refreshQueue();
      advance();
    })();

    const poll = setInterval(refreshQueue, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(poll);
      clearTimeout(timerRef.current);
    };
  }, []);

  const defaultClass = variant === "fullscreen"
    ? "relative w-full h-full"
    : "relative mx-auto mt-8 lg:mt-12 w-full max-w-2xl min-h-[320px] sm:min-h-[420px] md:min-h-[460px]";

  return (
    <div className={className || defaultClass}>
      <AnimatePresence>
        {display ? (
          <GreetingCard key={display._id} item={display} variant={variant} />
        ) : (
          <GreetingEmptyState key="empty" variant={variant} />
        )}
      </AnimatePresence>
    </div>
  );
}
