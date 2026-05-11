import { motion } from "framer-motion";
import { Heart, MessageCircle, Users, Gift, Sparkles, Loader2, RefreshCw, CheckCircle2, Clock, XCircle, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSession } from "@/hooks/useSession";
import { toast } from "@/hooks/use-toast";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE = "https://play.kotagames.web.id/api";
const WA_NUMBER = "6289506227608";
const TX_KEY = "ne_donasi_active";

interface DonasiPackage {
  id: number;
  name: string;
  price: number;
  type: string;
  rewards: string[];
}
interface DonasiPaketResponse {
  status: boolean;
  message?: string;
  user?: { id: number; username: string; first_time: boolean };
  total?: number;
  data?: DonasiPackage[];
}
interface QrisResponse {
  status: boolean;
  reused?: boolean;
  message?: string;
  user?: { id: number; username: string; name: string };
  package?: { id: number; name: string; price: number; rewards: string[] };
  payment?: {
    nominal: number;
    unique_code: number;
    total_bayar: number;
    qris: string;
    otp: string;
    status: string;
  };
}
interface CheckResponse {
  status: boolean;
  message?: string;
  user?: { id: number; username: string; name: string };
  data?: {
    id: number;
    paket_id: number;
    paket: { name: string; rewards: string[] };
    nominal: number;
    unique_code: number;
    total_bayar: number;
    qris: string;
    status_pembayaran: "pending" | "paid" | "expired" | string;
    otp: string;
    created_at: string;
    updated_at: string;
  };
}

const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

const DiscordIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg ref={ref} viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
  </svg>
));
DiscordIcon.displayName = "DiscordIcon";


interface ItemkuCek {
  status: boolean;
  category?: string;
  id?: string;
  name?: string;
  description?: string;
  level?: number;
  premium?: boolean;
  price_gold?: number;
  price_tokens?: number;
  skills?: string;
}

const itemkuCache: Record<string, ItemkuCek | "pending" | "error"> = {};
const itemkuListeners = new Set<() => void>();
const notifyItemku = () => itemkuListeners.forEach((fn) => fn());

const fetchItemku = (id: string) => {
  if (itemkuCache[id]) return;
  itemkuCache[id] = "pending";
  fetch(`${API_BASE}/itemku/cek/${encodeURIComponent(id)}`)
    .then((r) => r.json())
    .then((j: ItemkuCek) => {
      itemkuCache[id] = j?.status ? j : "error";
      notifyItemku();
    })
    .catch(() => { itemkuCache[id] = "error"; notifyItemku(); });
};

interface ResolvedReward {
  raw: string;
  label: string;
  description?: string;
  level?: number;
  kind: "tokens" | "skill" | "item" | "pet" | "weapon" | "other";
  loading?: boolean;
}

const resolveReward = (r: string): ResolvedReward => {
  const tok = r.match(/^tokens_(\d+)$/);
  if (tok) return { raw: r, label: `${parseInt(tok[1], 10).toLocaleString("id-ID")} Tokens`, kind: "tokens" };

  const cached = itemkuCache[r];
  if (!cached) {
    fetchItemku(r);
    return { raw: r, label: r.replace(/_/g, " "), kind: "other", loading: true };
  }
  if (cached === "pending") return { raw: r, label: r.replace(/_/g, " "), kind: "other", loading: true };
  if (cached === "error") {
    const fallback = r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    if (/^skill_/.test(r)) return { raw: r, label: fallback, kind: "skill" };
    if (/^pet_/.test(r)) return { raw: r, label: fallback, kind: "pet" };
    if (/^wpn_/.test(r)) return { raw: r, label: fallback, kind: "weapon" };
    return { raw: r, label: fallback, kind: "other" };
  }
  const cat = cached.category;
  const kind: ResolvedReward["kind"] =
    cat === "skill" ? "skill" :
    cat === "pet" ? "pet" :
    cat === "weapon" ? "weapon" :
    /^(wpn_|set_|hair_|accessory_|back_|item_)/.test(r) ? "item" : "other";
  return {
    raw: r,
    label: cached.name || r,
    description: cached.description,
    level: cached.level,
    kind,
  };
};

const Donatur = () => {
  const { t, lang } = useLanguage();
  const { data: session } = useSession();

  const [pkgUsername, setPkgUsername] = useState<string>("");
  const [pkgInput, setPkgInput] = useState<string>("");
  const [pkgData, setPkgData] = useState<DonasiPaketResponse | null>(null);
  const [pkgLoading, setPkgLoading] = useState(false);
  const [pkgError, setPkgError] = useState<string | null>(null);
  const [qrisOpen, setQrisOpen] = useState(false);
  const [qrisLoading, setQrisLoading] = useState(false);
  const [qrisData, setQrisData] = useState<QrisResponse | null>(null);
  const [checkData, setCheckData] = useState<CheckResponse | null>(null);
  const [, setLibReady] = useState(0);
  const pollRef = useRef<number | null>(null);

  // Subscribe to itemku cache updates
  useEffect(() => {
    const listener = () => setLibReady((v) => v + 1);
    itemkuListeners.add(listener);
    return () => { itemkuListeners.delete(listener); };
  }, []);

  useEffect(() => {
    if (session?.user?.username && !pkgUsername) {
      setPkgUsername(session.user.username);
      setPkgInput(session.user.username);
    }
  }, [session, pkgUsername]);

  const loadPackages = useCallback(async (username: string) => {
    if (!username.trim()) return;
    setPkgLoading(true);
    setPkgError(null);
    try {
      const r = await fetch(`${API_BASE}/donasi/paket/${encodeURIComponent(username.trim())}`);
      const j: DonasiPaketResponse = await r.json();
      if (!j.status) {
        setPkgError(j.message || (lang === "id" ? "User tidak ditemukan" : "User not found"));
        setPkgData(null);
      } else {
        setPkgData(j);
        setPkgUsername(j.user?.username || username.trim());
      }
    } catch {
      setPkgError(lang === "id" ? "Gagal terhubung" : "Network error");
      setPkgData(null);
    } finally {
      setPkgLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    if (pkgUsername) loadPackages(pkgUsername);
  }, [pkgUsername, loadPackages]);

  // Restore active transaction
  useEffect(() => {
    const raw = localStorage.getItem(TX_KEY);
    if (!raw) return;
    try {
      const tx = JSON.parse(raw) as { username: string; otp: string };
      if (tx.username && tx.otp) {
        fetch(`${API_BASE}/donasi/check/${encodeURIComponent(tx.username)}/${encodeURIComponent(tx.otp)}`)
          .then((r) => r.json())
          .then((j: CheckResponse) => {
            if (j.status && j.data && j.data.status_pembayaran !== "expired") {
              setCheckData(j);
              setQrisData({
                status: true,
                reused: true,
                user: j.user,
                package: { id: j.data.paket_id, name: j.data.paket.name, price: j.data.nominal, rewards: j.data.paket.rewards },
                payment: {
                  nominal: j.data.nominal,
                  unique_code: j.data.unique_code,
                  total_bayar: j.data.total_bayar,
                  qris: j.data.qris,
                  otp: j.data.otp,
                  status: j.data.status_pembayaran,
                },
              });
            } else {
              localStorage.removeItem(TX_KEY);
            }
          })
          .catch(() => {});
      }
    } catch {
      localStorage.removeItem(TX_KEY);
    }
  }, []);

  const selectPackage = useCallback(async (pkg: DonasiPackage) => {
    if (!pkgUsername) return;
    setQrisLoading(true);
    setQrisOpen(true);
    setQrisData(null);
    setCheckData(null);
    try {
      const r = await fetch(`${API_BASE}/donasi/qris/${pkg.id}/${encodeURIComponent(pkgUsername)}`);
      const j: QrisResponse = await r.json();
      if (!j.status || !j.payment) {
        toast({ title: lang === "id" ? "Gagal" : "Failed", description: j.message || (lang === "id" ? "Tidak dapat membuat QRIS" : "Cannot generate QRIS"), variant: "destructive" });
        setQrisOpen(false);
      } else {
        setQrisData(j);
        localStorage.setItem(TX_KEY, JSON.stringify({ username: pkgUsername, otp: j.payment.otp }));
        if (j.reused) toast({ title: lang === "id" ? "Transaksi Aktif" : "Active Transaction", description: j.message || (lang === "id" ? "Menggunakan transaksi sebelumnya" : "Reusing previous request") });
      }
    } catch {
      toast({ title: lang === "id" ? "Gagal terhubung" : "Network error", variant: "destructive" });
      setQrisOpen(false);
    } finally {
      setQrisLoading(false);
    }
  }, [pkgUsername, lang]);

  const checkStatus = useCallback(async (silent = false) => {
    if (!qrisData?.payment?.otp || !pkgUsername) return;
    try {
      const r = await fetch(`${API_BASE}/donasi/check/${encodeURIComponent(pkgUsername)}/${encodeURIComponent(qrisData.payment.otp)}`);
      const j: CheckResponse = await r.json();
      if (j.status) {
        setCheckData(j);
        if (!silent) toast({ title: "Status", description: `${lang === "id" ? "Pembayaran" : "Payment"}: ${j.data?.status_pembayaran}` });
        if (j.data?.status_pembayaran === "paid") localStorage.removeItem(TX_KEY);
      } else if (!silent) {
        toast({ title: lang === "id" ? "Tidak ditemukan" : "Not found", description: j.message, variant: "destructive" });
      }
    } catch {
      if (!silent) toast({ title: lang === "id" ? "Gagal terhubung" : "Network error", variant: "destructive" });
    }
  }, [qrisData, pkgUsername, lang]);

  useEffect(() => {
    if (!qrisOpen || !qrisData?.payment?.otp) return;
    const status = checkData?.data?.status_pembayaran ?? qrisData.payment.status;
    if (status !== "pending") return;
    pollRef.current = window.setInterval(() => checkStatus(true), 8000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [qrisOpen, qrisData, checkData, checkStatus]);

  const currentStatus = checkData?.data?.status_pembayaran ?? qrisData?.payment?.status ?? "pending";
  const currentTotal = checkData?.data?.total_bayar ?? qrisData?.payment?.total_bayar ?? 0;

  // Group packages by type
  const groupedPackages = useMemo(() => {
    const groups = new Map<string, DonasiPackage[]>();
    for (const p of pkgData?.data || []) {
      const key = p.type || "other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
    // Order: firstime first, then normal, then others
    const order = ["firstime", "normal"];
    return Array.from(groups.entries()).sort((a, b) => {
      const ai = order.indexOf(a[0]); const bi = order.indexOf(b[0]);
      if (ai === -1 && bi === -1) return a[0].localeCompare(b[0]);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [pkgData]);

  const categoryLabel = (type: string) => {
    if (type === "firstime") return lang === "id" ? "Spesial First Time" : "First Time Special";
    if (type === "normal") return lang === "id" ? "Paket Reguler" : "Regular Packages";
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const waLink = useMemo(() => {
    if (!qrisData?.payment) return `https://wa.me/${WA_NUMBER}`;
    const resolved = (qrisData.package?.rewards || []).map(resolveReward);
    const rewards = resolved
      .map((r) => {
        const parts = [`• ${r.label}`];
        if (r.level != null) parts.push(`(Lv ${r.level})`);
        return parts.join(" ");
      })
      .join("\n");
    const total = qrisData.payment.total_bayar.toLocaleString("id-ID");
    const otp = qrisData.payment.otp;
    const pkg = qrisData.package?.name || "-";
    const msg = lang === "id"
      ? `Halo Admin Kota Games,

Saya ingin mengkonfirmasi pembayaran donasi.

• Username : ${pkgUsername}
• Paket    : ${pkg}
• Total    : Rp ${total}
• Kode OTP : ${otp}

Reward:
${rewards}

Mohon dicek pembayarannya. Terima kasih 🙏`
      : `Hello Kota Games Admin,

I would like to confirm a donation payment.

• Username : ${pkgUsername}
• Package  : ${pkg}
• Total    : Rp ${total}
• OTP Code : ${otp}

Rewards:
${rewards}

Please verify the payment. Thank you 🙏`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [qrisData, pkgUsername, lang]);

  const dialogRewards = useMemo(
    () => (qrisData?.package?.rewards || []).map(resolveReward),
    [qrisData]
  );

  return (
    <div className="min-h-screen bg-background pt-[calc(1.75rem+3.5rem+1rem)] pb-8 px-4">
      <div className="container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Heart className="mx-auto w-10 h-10 text-destructive mb-3" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow">{t("donatur_title")}</h1>
          <p className="text-muted-foreground mt-1">{t("donatur_subtitle")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card glow-primary rounded-2xl p-6 md:p-8 text-center"
        >
          <Sparkles className="mx-auto w-8 h-8 text-accent mb-2" />
          <h2 className="font-display text-xl font-bold text-foreground tracking-wide">{t("donatur_help_title")}</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{t("donatur_help_desc")}</p>
          <p className="text-muted-foreground text-sm leading-relaxed mt-3">{t("donatur_msg")}</p>
        </motion.div>

        {/* Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 glass-card rounded-2xl p-6 md:p-8 border-accent/30"
        >
          <div className="flex items-center justify-center gap-2 text-accent mb-2">
            <Gift className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold tracking-wider">
              {lang === "id" ? "Paket Donasi" : "Donation Packages"}
            </h2>
          </div>
          <p className="text-center text-muted-foreground text-sm mb-5">
            {lang === "id"
              ? "Pilih paket dan bayar via QRIS. Admin akan konfirmasi pembayaran secara manual."
              : "Pick a package and pay via QRIS. Admin will confirm payment manually."}
          </p>

          {!session && (
            <div className="mb-4">
              <label className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1 block">
                {lang === "id" ? "Username Game" : "Game Username"}
              </label>
              <div className="flex gap-2">
                <Input
                  value={pkgInput}
                  onChange={(e) => setPkgInput(e.target.value)}
                  placeholder={lang === "id" ? "username_kamu" : "your_username"}
                  onKeyDown={(e) => e.key === "Enter" && setPkgUsername(pkgInput.trim())}
                />
                <Button
                  onClick={() => setPkgUsername(pkgInput.trim())}
                  disabled={!pkgInput.trim() || pkgLoading}
                  className="gap-2"
                >
                  {pkgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {lang === "id" ? "Cek" : "Check"}
                </Button>
              </div>
            </div>
          )}

          {session && (
            <div className="mb-4 rounded-lg bg-primary/10 border border-primary/30 p-3 text-sm">
              <span className="text-muted-foreground">{lang === "id" ? "Login sebagai: " : "Logged in as: "}</span>
              <span className="font-display font-bold text-primary">{session.user.username}</span>
            </div>
          )}

          {pkgLoading && (
            <div className="text-center py-6">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            </div>
          )}

          {pkgError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-center text-sm text-destructive">
              {pkgError}
            </div>
          )}

          {!pkgLoading && pkgData?.status && pkgData.user && (
            <>
              <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-card/40 border border-border/40 p-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {lang === "id" ? "Akun" : "Account"}
                  </p>
                  <p className="font-display font-bold text-foreground truncate">{pkgData.user.username}</p>
                </div>
                {pkgData.user.first_time && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-accent bg-accent/15 border border-accent/30 px-2 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    {lang === "id" ? "Eligible First Time" : "First Time Eligible"}
                  </span>
                )}
              </div>

              {groupedPackages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  {lang === "id" ? "Tidak ada paket" : "No packages available"}
                </p>
              )}

              <div className="space-y-5">
                {groupedPackages.map(([type, list]) => {
                  const isFirst = type === "firstime";
                  return (
                    <div key={type}>
                      <h3 className={`font-display text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isFirst ? "text-accent" : "text-primary"}`}>
                        {isFirst ? <Sparkles className="w-3.5 h-3.5" /> : <Gift className="w-3.5 h-3.5" />}
                        {categoryLabel(type)}
                      </h3>
                      <div className="space-y-2">
                        {list.map((p) => {
                          const resolved = p.rewards.map(resolveReward);
                          return (
                            <button
                              key={p.id}
                              onClick={() => selectPackage(p)}
                              disabled={qrisLoading}
                              className={`w-full text-left rounded-lg border p-3 transition-colors disabled:opacity-50 ${
                                isFirst
                                  ? "bg-accent/10 border-accent/30 hover:bg-accent/20"
                                  : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className={`font-display font-bold text-sm ${isFirst ? "text-accent" : "text-primary"}`}>
                                    {p.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{formatRupiah(p.price)}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {resolved.map((r) => (
                                  <span
                                    key={r.raw}
                                    title={r.description ? `${r.label}${r.level != null ? ` · Lv ${r.level}` : ""}\n${r.description}` : r.label}
                                    className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-foreground bg-card/60 border border-border/40 px-2 py-0.5 rounded-full"
                                  >
                                    {r.kind === "skill" ? <Zap className="w-3 h-3 text-accent" /> : <Sparkles className="w-3 h-3 text-accent" />}
                                    {r.label}
                                    {r.level != null && (
                                      <span className="text-muted-foreground font-normal">Lv{r.level}</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>

        {/* Community */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 glass-card rounded-2xl p-6 md:p-8 space-y-5 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-accent">
            <Users className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold tracking-wider">{t("donatur_join_community")}</h2>
          </div>
          <p className="text-muted-foreground text-sm">{t("donatur_join_desc")}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="https://chat.whatsapp.com/KGeNuqoy0oxCqeHVBWbtEn?mode=gi_t" target="_blank" rel="noopener noreferrer">
              <Button className="h-12 px-6 font-display text-sm gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground w-full sm:w-auto">
                <MessageCircle className="w-5 h-5" />
                {t("donatur_wa")}
              </Button>
            </a>
            <a href="https://discord.gg/zWBcCPYAj" target="_blank" rel="noopener noreferrer">
              <Button className="h-12 px-6 font-display text-sm gap-2 bg-[hsl(235,86%,65%)] hover:bg-[hsl(235,86%,55%)] text-white w-full sm:w-auto">
                <DiscordIcon />
                {t("donatur_discord")}
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

      {/* QRIS Dialog */}
      <Dialog open={qrisOpen} onOpenChange={setQrisOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-primary/30 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="font-display text-center text-xl text-primary">
              {qrisData?.package?.name || "QRIS Payment"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {lang === "id" ? "Scan dengan aplikasi QRIS apa saja" : "Scan with any QRIS-supported app"}
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-5 space-y-3">
            {qrisLoading && (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">
                  {lang === "id" ? "Membuat QRIS..." : "Generating QRIS..."}
                </p>
              </div>
            )}

            {!qrisLoading && qrisData?.payment && (
              <>
                <div className="rounded-xl overflow-hidden bg-white p-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=0&data=${encodeURIComponent(qrisData.payment.qris)}`}
                    alt="QRIS"
                    className="w-full h-auto block"
                  />
                </div>

                <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {lang === "id" ? "Total Pembayaran" : "Total Payment"}
                  </p>
                  <p className="font-display text-2xl font-black text-primary">{formatRupiah(currentTotal)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {lang === "id" ? "Nominal" : "Nominal"}: {formatRupiah(qrisData.payment.nominal)} + {lang === "id" ? "Kode Unik" : "Unique Code"}: {qrisData.payment.unique_code}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-card/50 border border-border/40 p-2">
                    <p className="text-[10px] text-muted-foreground uppercase">OTP</p>
                    <p className="font-display font-bold text-foreground">{qrisData.payment.otp}</p>
                  </div>
                  <div className="rounded-lg bg-card/50 border border-border/40 p-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Status</p>
                    <p className={`font-display font-bold inline-flex items-center gap-1 ${
                      currentStatus === "paid" ? "text-accent" :
                      currentStatus === "expired" ? "text-destructive" : "text-primary"
                    }`}>
                      {currentStatus === "paid" ? <CheckCircle2 className="w-3 h-3" /> :
                       currentStatus === "expired" ? <XCircle className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      {currentStatus.toUpperCase()}
                    </p>
                  </div>
                </div>

                {dialogRewards.length > 0 && (
                  <div className="rounded-lg bg-accent/10 border border-accent/30 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                      {lang === "id" ? "Hadiah" : "Rewards"}
                    </p>
                    <ul className="space-y-1.5">
                      {dialogRewards.map((r) => (
                        <li key={r.raw} className="text-xs">
                          <div className="flex items-center gap-1.5 font-display font-bold text-accent">
                            {r.kind === "skill" ? <Zap className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                            {r.label}
                            {r.kind === "skill" && r.cooldown != null && (
                              <span className="text-[10px] font-normal text-muted-foreground">CD {r.cooldown}</span>
                            )}
                          </div>
                          {r.description && (
                            <p className="text-[10px] text-muted-foreground leading-relaxed pl-4.5 ml-0.5">{r.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => checkStatus(false)} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    {lang === "id" ? "Cek Status" : "Check Status"}
                  </Button>
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </a>
                </div>

                <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                  {lang === "id"
                    ? "Pembayaran diverifikasi manual oleh admin via WhatsApp sebelum hadiah dikirim."
                    : "Payment is verified manually by admin via WhatsApp before rewards are delivered."}
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Donatur;
