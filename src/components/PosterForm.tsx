import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Check, ChevronRight, Copy, QrCode, Landmark } from "lucide-react";
import { compressImage, MAX_UPLOAD_SIZE } from "../lib/image";
import { uploadToSupabase } from "../lib/uploadClient";
import { fadeUp } from "../lib/motion";

const packages = [
  { id: "silver", nama: "Silver", harga: "Rp 250.000", warna: "#C0C4CC", teks: "#3F4550", benefit: ["Poster tayang di website selama 1 bulan"] },
  { id: "gold", nama: "Gold", harga: "Rp 500.000", warna: "#E5C158", teks: "#6B4E0A", benefit: ["Poster tayang di website selama 1 bulan", "Tayang di LED saat acara di Hotel Aryaduta"] },
  { id: "platinum", nama: "Platinum", harga: "Rp 1.000.000", warna: "#B8C6D9", teks: "#294159", benefit: ["Poster tayang di website 1 bulan", "Tayang di LED acara", "Posisi utama & durasi lebih lama"] },
];

export function PosterForm({ showHeading = true }: { showHeading?: boolean }) {
  const [selectedPkg, setSelectedPkg] = useState("");
  const [payMethod, setPayMethod] = useState("transfer");
  const [posterNama, setPosterNama] = useState("");
  const [posterPesan, setPosterPesan] = useState("");
  const [customFile, setCustomFile] = useState("");
  const [customFilePreview, setCustomFilePreview] = useState("");
  const [customFileObj, setCustomFileObj] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [posterSubmitted, setPosterSubmitted] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState({ nama: "", paket: "" });
  const [posterSubmitting, setPosterSubmitting] = useState(false);
  const [buktiFile, setBuktiFile] = useState("");
  const [buktiFilePreview, setBuktiFilePreview] = useState("");
  const [buktiFileObj, setBuktiFileObj] = useState(null);
  const [buktiUploadError, setBuktiUploadError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    const compressed = await compressImage(file);
    if (compressed.size > MAX_UPLOAD_SIZE) {
      setUploadError("Ukuran file maksimal 3MB");
      return;
    }
    setCustomFile(compressed.name);
    setCustomFilePreview(URL.createObjectURL(compressed));
    setCustomFileObj(compressed);
  };

  const handleBuktiFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBuktiUploadError("");
    const compressed = await compressImage(file);
    if (compressed.size > MAX_UPLOAD_SIZE) {
      setBuktiUploadError("Ukuran file maksimal 3MB");
      return;
    }
    setBuktiFile(compressed.name);
    setBuktiFilePreview(URL.createObjectURL(compressed));
    setBuktiFileObj(compressed);
  };

  const submitPoster = async (e) => {
    e.preventDefault();
    if (!posterNama.trim() || posterSubmitting) return;
    if (!posterPesan.trim() || !customFileObj) return;
    if (!buktiFileObj) return;
    if (!selectedPkg) return;
    setPosterSubmitting(true);
    setUploadError("");
    setBuktiUploadError("");
    try {
      let customFileUrl = "";
      if (customFileObj) {
        try {
          const blob = await uploadToSupabase(`poster/${Date.now()}-${customFileObj.name}`, customFileObj);
          customFileUrl = blob.url;
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : "Gagal mengunggah gambar");
          return;
        }
      }

      let buktiFileUrl = "";
      try {
        const blob = await uploadToSupabase(`poster/${Date.now()}-${buktiFileObj.name}`, buktiFileObj);
        buktiFileUrl = blob.url;
      } catch (err) {
        setBuktiUploadError(err instanceof Error ? err.message : "Gagal mengunggah bukti transfer");
        return;
      }

      await fetch("/api/poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: posterNama,
          pesan: posterPesan,
          customFile: customFileUrl,
          paket: selectedPkg,
          metodeBayar: payMethod,
          buktiTransfer: buktiFileUrl,
        }),
      });
      setSubmittedInfo({ nama: posterNama, paket: packages.find((p) => p.id === selectedPkg)?.nama || "" });
      setPosterSubmitted(true);
      setPosterNama(""); setPosterPesan(""); setCustomFile(""); setCustomFilePreview(""); setCustomFileObj(null);
      setBuktiFile(""); setBuktiFilePreview(""); setBuktiFileObj(null);
      setTimeout(() => setPosterSubmitted(false), 5000);
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
    <>
      {showHeading && (
        <motion.div {...fadeUp(0)} className="mb-16">
          <div className="text-xs tracking-[3px] uppercase text-[hsl(var(--primary))] mb-4 font-semibold">BERMITRA</div>
          <h2 className="text-4xl md:text-6xl tracking-tight max-w-2xl mb-6">
            Dukung pelayanan melalui <span className="font-serif italic">Persembahan</span>
          </h2>
          <p className="text-muted-foreground">Poster tayang di website dan LED Gala Dinner.</p>
        </motion.div>
      )}

      <div className="grid md:grid-cols-[1fr_1.5fr] gap-12">
        {/* Packages */}
        <motion.div {...fadeUp(0.2)} className="flex flex-col gap-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50 block">Pilih Paket</label>
          {packages.map((p) => (
            <button key={p.id} onClick={() => setSelectedPkg(p.id)}
              style={{
                background: `linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0) 60%), linear-gradient(135deg, ${p.warna}E6, ${p.warna}80)`,
                borderColor: selectedPkg === p.id ? p.warna : `${p.warna}80`,
                boxShadow: selectedPkg === p.id
                  ? `inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -10px 20px -12px rgba(0,0,0,0.35), 0 0 0 3px ${p.warna}40, 0 12px 32px -8px ${p.warna}CC`
                  : `inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -8px 16px -12px rgba(0,0,0,0.3)`,
              }}
              className={`relative overflow-hidden text-left rounded-2xl p-6 border transition-all hover:border-opacity-80 ${selectedPkg === p.id ? "pkg-shine" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg" style={{ color: p.teks }}>{p.nama}</span>
                {selectedPkg === p.id && <Check size={18} style={{ color: p.teks }} />}
              </div>
              <div className="font-serif italic text-xl mb-4" style={{ color: p.teks }}>{p.harga}</div>
              <ul className="space-y-2">
                {p.benefit.map((b, i) => (
                  <li key={i} className="text-xs font-medium flex gap-2 items-start" style={{ color: p.teks }}>
                    <ChevronRight size={14} className="shrink-0 mt-0.5" style={{ color: p.teks }} /> {b}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </motion.div>

        {/* Form */}
        <motion.div {...fadeUp(0.3)}>
          <form onSubmit={submitPoster} className="bg-card border border-white/10 rounded-3xl p-8">
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">Nama / Gereja Mitra</label>
              <input value={posterNama} onChange={(e) => setPosterNama(e.target.value)} required
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))] text-white"
                placeholder="cth. GKJ Bogor" />
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1 block">Poster Ucapan Anda</label>
              <p className="text-xs text-white/40 mb-3">Ini yang akan tayang di layar &amp; website — tulis ucapan dan unggah gambar.</p>

              <textarea value={posterPesan} onChange={(e) => setPosterPesan(e.target.value)} rows={3} required
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))] text-white mb-3"
                placeholder="Ucapan yang akan tampil..." />

              <label className="relative w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors overflow-hidden">
                {customFilePreview ? (
                  <img src={customFilePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload size={20} className="text-white/40" />
                    <span className="text-sm text-white/60">Unggah logo, foto, atau gambar lainnya</span>
                  </>
                )}
                {posterSubmitting && customFileObj && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-white">Mengunggah...</div>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} required />
              </label>
            </div>

            <div className="mb-8">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 block">Pembayaran</label>
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setPayMethod("transfer")} className={`flex-1 py-2 text-sm flex items-center justify-center gap-2 rounded-lg border transition-colors ${payMethod === "transfer" ? 'bg-white/10 border-white/30' : 'border-white/10 text-white/50 hover:bg-white/5'}`}><Landmark size={14} /> Transfer</button>
                <button type="button" onClick={() => setPayMethod("qris")} className={`flex-1 py-2 text-sm flex items-center justify-center gap-2 rounded-lg border transition-colors ${payMethod === "qris" ? 'bg-white/10 border-white/30' : 'border-white/10 text-white/50 hover:bg-white/5'}`}><QrCode size={32} /> QRIS</button>
              </div>

              <div className={`bg-black/50 rounded-lg p-4 text-sm border border-white/5 flex items-center gap-4 ${payMethod === "transfer" ? "flex-col sm:flex-row" : "flex-col"}`}>
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
                    <div className="text-white/60 text-xs leading-relaxed text-center">Pindai QRIS ini menggunakan aplikasi bank/e-wallet pilihan Anda.</div>
                    <img src="/images/qris.jpeg" alt="QRIS Jesus Film Project, Digital & Kreatif" className="w-56 sm:w-64 h-auto rounded-lg shrink-0" />
                  </>
                )}
              </div>
            </div>

            <div className="mb-8">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1 block">Bukti Pembayaran</label>
              <p className="text-xs text-white/40 mb-3">Wajib diisi untuk verifikasi panitia — bukan poster Anda, dan tidak akan tayang di layar.</p>
              <label className="relative w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors overflow-hidden">
                {buktiFilePreview ? (
                  <img src={buktiFilePreview} alt="Bukti transfer" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload size={20} className="text-white/40" />
                    <span className="text-sm text-white/60">Unggah bukti transfer/pembayaran (JPG/PNG/WEBP)</span>
                  </>
                )}
                {posterSubmitting && buktiFileObj && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-white">Mengunggah...</div>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBuktiFileChange} required />
              </label>
              {buktiUploadError && <div className="text-xs text-red-400 mt-2">{buktiUploadError}</div>}
            </div>

            {uploadError && <div className="text-xs text-red-400 mb-3">{uploadError}</div>}

            <button type="submit" disabled={posterSubmitting || !buktiFileObj || !posterPesan.trim() || !customFileObj || !selectedPkg}
              className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg px-6 py-4 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
              {posterSubmitting ? "Mengunggah & Mengirim..." : "Kirim & Ajukan Verifikasi"}
            </button>
          </form>
        </motion.div>
      </div>

      <AnimatePresence>
        {posterSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setPosterSubmitted(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-white/10 rounded-3xl p-10 md:p-12 text-center flex flex-col items-center max-w-md w-full relative"
            >
              <button
                onClick={() => setPosterSubmitted(false)}
                aria-label="Tutup"
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Check size={32} className="text-foreground" />
              </div>
              <h3 className="text-2xl font-medium mb-2">Terima kasih, {submittedInfo.nama}!</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Pengajuan paket <span className="text-white font-medium">{submittedInfo.paket}</span> diterima. Poster akan tayang setelah diverifikasi panitia.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PosterForm;
