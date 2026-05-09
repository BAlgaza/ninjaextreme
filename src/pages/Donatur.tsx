import { motion } from "framer-motion";
import { Heart, MessageCircle, Users, Gift, QrCode, TrendingUp, Sparkles, History, Wallet, Trophy, Loader2, RefreshCw, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
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
  type: "firstime" | "normal" | string;
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

const formatReward = (r: string) => {
  const m = r.match(/^tokens_(\d+)$/);
  if (m) return `${parseInt(m[1], 10).toLocaleString("id-ID")} Tokens`;
  return r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const DiscordIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg ref={ref} viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
  </svg>
));
DiscordIcon.displayName = "DiscordIcon";

interface DonorEntry {
  id: number;
  user_id: number;
  username: string;
  nominal: number;
  kurs: string;
  method: string;
  created_at: string;
}

interface DonorApiResponse {
  code: number;
  total: string;
  total_format: string;
  jumlah_data: number;
  data: DonorEntry[];
}

interface GroupedDonor {
  user_id: number;
  username: string;
  total: number;
  count: number;
  lastDate: string;
  entries: DonorEntry[];
}

const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

const formatDate = (iso: string, lang: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(lang === "id" ? "id-ID" : "en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const Donatur = () => {
  const { t, lang } = useLanguage();
  const { data: session } = useSession();
  const [donorData, setDonorData] = useState<DonorApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyDonor, setHistoryDonor] = useState<GroupedDonor | null>(null);

  // Donation flow state
  const [pkgUsername, setPkgUsername] = useState<string>("");
  const [pkgInput, setPkgInput] = useState<string>("");
  const [pkgData, setPkgData] = useState<DonasiPaketResponse | null>(null);
  const [pkgLoading, setPkgLoading] = useState(false);
  const [pkgError, setPkgError] = useState<string | null>(null);
  const [qrisOpen, setQrisOpen] = useState(false);
  const [qrisLoading, setQrisLoading] = useState(false);
  const [qrisData, setQrisData] = useState<QrisResponse | null>(null);
  const [checkData, setCheckData] = useState<CheckResponse | null>(null);
  const pollRef = useRef<number | null>(null);

  // Auto-fill username from session
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
        setPkgError(j.message || "User not found");
        setPkgData(null);
      } else {
        setPkgData(j);
        setPkgUsername(j.user?.username || username.trim());
      }
    } catch {
      setPkgError("Network error");
      setPkgData(null);
    } finally {
      setPkgLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pkgUsername) loadPackages(pkgUsername);
  }, [pkgUsername, loadPackages]);

  // Restore active transaction from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(TX_KEY);
    if (!raw) return;
    try {
      const tx = JSON.parse(raw) as { username: string; otp: string };
      if (tx.username && tx.otp) {
        // background check; if found and pending/paid -> show dialog
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
        toast({ title: "Failed", description: j.message || "Cannot generate QRIS", variant: "destructive" });
        setQrisOpen(false);
      } else {
        setQrisData(j);
        localStorage.setItem(TX_KEY, JSON.stringify({ username: pkgUsername, otp: j.payment.otp }));
        if (j.reused) toast({ title: "Reused", description: j.message || "Using previous request" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
      setQrisOpen(false);
    } finally {
      setQrisLoading(false);
    }
  }, [pkgUsername]);

  const checkStatus = useCallback(async (silent = false) => {
    if (!qrisData?.payment?.otp || !pkgUsername) return;
    try {
      const r = await fetch(`${API_BASE}/donasi/check/${encodeURIComponent(pkgUsername)}/${encodeURIComponent(qrisData.payment.otp)}`);
      const j: CheckResponse = await r.json();
      if (j.status) {
        setCheckData(j);
        if (!silent) toast({ title: "Status", description: `Payment: ${j.data?.status_pembayaran}` });
        if (j.data?.status_pembayaran === "paid") {
          localStorage.removeItem(TX_KEY);
        }
      } else if (!silent) {
        toast({ title: "Not found", description: j.message || "Transaction not found", variant: "destructive" });
      }
    } catch {
      if (!silent) toast({ title: "Network error", variant: "destructive" });
    }
  }, [qrisData, pkgUsername]);

  // Poll status while dialog open & pending
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

  const waLink = useMemo(() => {
    if (!qrisData?.payment) return `https://wa.me/${WA_NUMBER}`;
    const rewards = (qrisData.package?.rewards || []).map(formatReward).map((x) => `- ${x}`).join("\n");
    const msg = `Halo kak, saya ${pkgUsername} ingin mengkonfirmasi pembayaran donasi sebesar Rp ${qrisData.payment.total_bayar.toLocaleString("id-ID")}.\nPaket: ${qrisData.package?.name}\nReward:\n${rewards}\nOTP: ${qrisData.payment.otp}\nMohon dicek ya kak, terima kasih 🙏`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [qrisData, pkgUsername]);


  useEffect(() => {
    const apiUrl = "https://play.kotagames.web.id/api/donatur/log";
    const tryFetch = async () => {
      // Try direct first, then fall back to CORS proxy
      try {
        const r = await fetch(apiUrl);
        if (!r.ok) throw new Error("bad status");
        return (await r.json()) as DonorApiResponse;
      } catch {
        const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(apiUrl)}`);
        return (await r.json()) as DonorApiResponse;
      }
    };
    tryFetch()
      .then((d) => setDonorData(d))
      .catch(() => setDonorData(null))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo<GroupedDonor[]>(() => {
    if (!donorData?.data) return [];
    const map = new Map<number, GroupedDonor>();
    for (const d of donorData.data) {
      const g = map.get(d.user_id);
      if (g) {
        g.total += d.nominal;
        g.count += 1;
        g.entries.push(d);
        if (new Date(d.created_at) > new Date(g.lastDate)) g.lastDate = d.created_at;
      } else {
        map.set(d.user_id, {
          user_id: d.user_id,
          username: d.username,
          total: d.nominal,
          count: 1,
          lastDate: d.created_at,
          entries: [d],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [donorData]);

  const summary = useMemo(() => {
    if (!donorData?.data?.length) return null;
    const qris = donorData.data.filter((d) => d.method === "qris").reduce((s, d) => s + d.nominal, 0);
    const paypal = donorData.data.filter((d) => d.method === "paypal").reduce((s, d) => s + d.nominal, 0);
    const total = parseInt(donorData.total || "0", 10);
    const avg = Math.round(total / donorData.data.length);
    const top = grouped[0];
    return { qris, paypal, avg, top };
  }, [donorData, grouped]);


  return (
    <div className="min-h-screen bg-background pt-[calc(1.75rem+3.5rem+1rem)] pb-8 px-4">
      <div className="container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Heart className="mx-auto w-10 h-10 text-destructive mb-3" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow">{t("donatur_title")}</h1>
          <p className="text-muted-foreground mt-1">{t("donatur_subtitle")}</p>
        </motion.div>

        {/* Help develop server */}
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

        {/* Dynamic Donation Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 glass-card rounded-2xl p-6 md:p-8 border-accent/30"
        >
          <div className="flex items-center justify-center gap-2 text-accent mb-2">
            <Gift className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold tracking-wider">Donation Packages</h2>
          </div>
          <p className="text-center text-muted-foreground text-sm mb-5">
            Pick a package and pay via QRIS. Admin will confirm payment manually.
          </p>

          {!session && (
            <div className="mb-4">
              <label className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1 block">
                Game Username
              </label>
              <div className="flex gap-2">
                <Input
                  value={pkgInput}
                  onChange={(e) => setPkgInput(e.target.value)}
                  placeholder="your_username"
                  onKeyDown={(e) => e.key === "Enter" && setPkgUsername(pkgInput.trim())}
                />
                <Button
                  onClick={() => setPkgUsername(pkgInput.trim())}
                  disabled={!pkgInput.trim() || pkgLoading}
                  className="gap-2"
                >
                  {pkgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Check
                </Button>
              </div>
            </div>
          )}

          {session && (
            <div className="mb-4 rounded-lg bg-primary/10 border border-primary/30 p-3 text-sm">
              <span className="text-muted-foreground">Logged in as: </span>
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
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Account</p>
                  <p className="font-display font-bold text-foreground truncate">{pkgData.user.username}</p>
                </div>
                {pkgData.user.first_time && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-accent bg-accent/15 border border-accent/30 px-2 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    First Time Eligible
                  </span>
                )}
              </div>

              {(pkgData.data || []).length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No packages available</p>
              )}

              <div className="space-y-2">
                {(pkgData.data || []).map((p) => {
                  const isFirst = p.type === "firstime";
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
                        {isFirst && (
                          <span className="text-[10px] font-display font-bold text-accent bg-accent/15 border border-accent/30 px-2 py-0.5 rounded-full">
                            FIRST TIME
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {p.rewards.map((r) => (
                          <span
                            key={r}
                            className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-foreground bg-card/60 border border-border/40 px-2 py-0.5 rounded-full"
                          >
                            <Sparkles className="w-3 h-3 text-accent" />
                            {formatReward(r)}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>


        {!loading && donorData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 grid grid-cols-3 gap-3"
          >
            <div className="glass-card rounded-xl p-4 text-center">
              <TrendingUp className="mx-auto w-5 h-5 text-accent mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("donatur_total_raised")}</p>
              <p className="font-display text-base font-bold text-foreground mt-1">
                {formatRupiah(parseInt(donorData.total || "0", 10))}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Wallet className="mx-auto w-5 h-5 text-primary mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("donatur_total_donors")}</p>
              <p className="font-display text-base font-bold text-foreground mt-1">{donorData.jumlah_data}</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Users className="mx-auto w-5 h-5 text-accent mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("donatur_unique_donors")}</p>
              <p className="font-display text-base font-bold text-foreground mt-1">{grouped.length}</p>
            </div>
          </motion.div>
        )}

        {/* Income Summary */}
        {!loading && summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mt-4 glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-center gap-2 text-accent mb-4">
              <TrendingUp className="w-5 h-5" />
              <h2 className="font-display text-base font-bold tracking-wider">{t("donatur_summary_title")}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("donatur_summary_qris")}</p>
                <p className="font-display font-bold text-primary mt-1">{formatRupiah(summary.qris)}</p>
              </div>
              <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("donatur_summary_paypal")}</p>
                <p className="font-display font-bold text-accent mt-1">{formatRupiah(summary.paypal)}</p>
              </div>
              <div className="rounded-lg bg-card/50 border border-border/40 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("donatur_summary_avg")}</p>
                <p className="font-display font-bold text-foreground mt-1">{formatRupiah(summary.avg)}</p>
              </div>
              <div className="rounded-lg bg-card/50 border border-border/40 p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> {t("donatur_summary_top")}
                </p>
                <p className="font-display font-bold text-foreground mt-1 truncate">{summary.top?.username}</p>
                <p className="text-[10px] text-accent">{formatRupiah(summary.top?.total ?? 0)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Join Community */}
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

        {/* Donor List (grouped) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="font-display text-xl font-bold text-foreground text-center mb-4 flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            {t("donatur_list_title")}
          </h2>

          {loading ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">{t("donatur_loading")}</p>
            </div>
          ) : grouped.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">{t("donatur_empty")}</p>
            </div>
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="divide-y divide-border/40">
                {grouped.map((g, i) => (
                  <button
                    key={g.user_id}
                    onClick={() => setHistoryDonor(g)}
                    className="w-full flex items-center gap-3 p-3 md:p-4 hover:bg-card/40 transition-colors text-left"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-bold ${
                      i === 0 ? "bg-accent/20 border border-accent/40 text-accent" : "bg-primary/15 border border-primary/30 text-primary"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-foreground truncate text-sm flex items-center gap-2">
                        {g.username}
                        {g.count > 1 && (
                          <span className="text-[10px] font-normal text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                            {g.count}× {t("donatur_times")}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <History className="w-3 h-3" />
                        {t("donatur_view_history")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-accent text-sm">{formatRupiah(g.total)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(g.lastDate, lang)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Donor History Popup */}
      <Dialog open={!!historyDonor} onOpenChange={(o) => !o && setHistoryDonor(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-primary/30">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="font-display text-center text-xl text-primary">
              {historyDonor?.username}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("donatur_history_title")} · {historyDonor?.count}× {t("donatur_times")}
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-5">
            <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 text-center mb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("donatur_total_raised")}</p>
              <p className="font-display text-xl font-bold text-accent mt-1">
                {formatRupiah(historyDonor?.total ?? 0)}
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-border/40 divide-y divide-border/40">
              {historyDonor?.entries
                .slice()
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-2 p-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{formatDate(e.created_at, lang)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{e.method} · {e.kurs}</p>
                    </div>
                    <p className="font-display font-bold text-accent text-sm">{formatRupiah(e.nominal)}</p>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QRIS Popup */}
      <Dialog open={qrisOpen} onOpenChange={setQrisOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-primary/30">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="font-display text-center text-xl text-primary">{t("donatur_qris_title")}</DialogTitle>
            <DialogDescription className="text-center">{t("donatur_qris_desc")}</DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-5">
            <div className="rounded-xl overflow-hidden bg-white">
              <img
                src="https://algaza.site/panel/qris.jpg"
                alt="QRIS"
                width={862}
                height={1104}
                className="w-full h-auto block"
              />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              {t("donatur_reward_min")}: <span className="font-bold text-primary">Rp 10.000</span> →{" "}
              <span className="text-accent font-bold">{t("donatur_reward_bonus")}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Donatur;
