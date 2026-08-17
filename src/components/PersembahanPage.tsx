import React from "react";
import { GlobalStyles } from "./GlobalStyles";
import { PosterForm } from "./PosterForm";

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

export default function PersembahanPage() {
  return (
    <div className="relative w-full selection:bg-white selection:text-black min-h-screen text-[hsl(var(--foreground))] bg-background">
      <GlobalStyles />

      <nav className="relative z-50 px-8 md:px-28 py-4 flex items-center justify-between">
        <a href="/"><Logo /></a>
        <a href="/" className="text-sm text-muted-foreground hover:text-[hsl(var(--foreground))] transition-colors">
          &larr; Kembali ke Beranda
        </a>
      </nav>

      <main className="py-16 md:py-24 px-8 md:px-28 max-w-7xl mx-auto">
        <PosterForm />
      </main>

      <footer className="py-12 px-8 md:px-28 border-t border-border/30 text-center text-sm text-muted-foreground">
        © 2026 LPMI. Lembaga Pelayanan Mahasiswa Indonesia.
      </footer>
    </div>
  );
}
