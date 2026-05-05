import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, getSession } from "@/hooks/useSession";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Loader2, AlertCircle, ShieldCheck, Ticket, Copy, Check, Gift,
  ChevronLeft, ChevronRight, Clock, Package, Ban,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "https://play.kotagames.web.id/api";
const PER_PAGE = 10;

/* ── Preset packages ── */
const DONASI_PACKAGES = [
  { label: "Rp 10.000", hadiah: "tokens_15000", desc: "15,000 Tokens" },
  { label: "Rp 30.000", hadiah: "tokens_44000", desc: "44,000 Tokens" },
  { label: "Rp 50.000", hadiah: "tokens_80000", desc: "80,000 Tokens" },
  { label: "Rp 100.000", hadiah: "tokens_145000", desc: "145,000 Tokens" },
  { label: "Rp 150.000", hadiah: "tokens_220000", desc: "220,000 Tokens" },
];

const FIRSTIME_PACKAGES = [
  { label: "Rp 10.000", hadiah: "tokens_40000", desc: "40,000 Tokens" },
  { label: "Rp 20.000", hadiah: "tokens_50000,pet_whitehand", desc: "50,000 Tokens + Pet Whitehand" },
];

const GIVEAWAY_OPTIONS = [
  { label: "Tokens 10K", hadiah: "tokens_10000" },
  { label: "Tokens 5K", hadiah: "tokens_5000" },
  { label: "Tokens 2K", hadiah: "tokens_2000" },
];

type VoucherMode = "donasi" | "firstime" | "giveaway" | "manual";

const generateCode = (username: string) => {
  const clean = username.replace(/[^a-zA-Z0-9]/g, "");
  const rand = Math.random().toString(36).substring(2, 8).replace(/[^a-z0-9]/g, "");
  return `${clean}${rand}`;
};

const sanitizeCode = (val: string) => val.replace(/[^a-zA-Z0-9 ]/g, "");

interface VoucherItem {
  id: number;
  kode: string;
  saldo: number;
  saldo_awal: number;
  used: number;
  usage_percent: number;
  hadiah: string[];
  expired: string;
  created: string;
  creator: { id: number; username: string };
  status: { empty: boolean; expired: boolean; active: boolean };
}

type ListTab = "active" | "out_of_stock" | "expired";

const Admin = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { loading, data, error } = useSession();
  const { toast } = useToast();

  const [mode, setMode] = useState<VoucherMode>("donasi");
  const [selectedHadiah, setSelectedHadiah] = useState("");
  const [manualHadiah, setManualHadiah] = useState("");
  const [saldo, setSaldo] = useState("1");
  const [kode, setKode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Voucher list state
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [listTab, setListTab] = useState<ListTab>("active");
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = "Admin — Ninja's Extreme";
  }, []);

  useEffect(() => {
    if (data?.user?.username) {
      setKode(generateCode(data.user.username));
    }
  }, [data?.user?.username]);

  const regenCode = () => {
    if (data?.user?.username) setKode(generateCode(data.user.username));
  };

  // Fetch voucher list
  const fetchVouchers = useCallback(async () => {
    const sesi = getSession();
    if (!sesi) return;
    setVoucherLoading(true);
    try {
      const res = await fetch(`${API_BASE}/voucher-admin/list`);
      const json = await res.json();
      if (json.status && Array.isArray(json.data)) {
        setVouchers(json.data);
      }
    } catch {
      // silent
    } finally {
      setVoucherLoading(false);
    }
  }, []);

  useEffect(() => {
    if (data?.admin) fetchVouchers();
  }, [data?.admin, fetchVouchers]);

  // Filter vouchers by tab
  const filteredVouchers = vouchers.filter((v) => {
    if (listTab === "active") return v.status.active;
    if (listTab === "out_of_stock") return !v.status.active && v.status.empty && !v.status.expired;
    if (listTab === "expired") return v.status.expired;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / PER_PAGE));
  const pagedVouchers = filteredVouchers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset page when tab changes
  useEffect(() => { setPage(1); }, [listTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data || !data.admin) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card max-w-sm w-full text-center">
            <CardContent className="p-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="font-display text-xl text-foreground">Access Denied</h2>
              <p className="text-sm text-muted-foreground">You do not have admin privileges.</p>
              <Button onClick={() => navigate("/")} variant="outline" className="mt-4">Back to Home</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const finalHadiah = mode === "manual" ? manualHadiah : selectedHadiah;

  const handleCreate = async () => {
    if (!kode.trim() || !finalHadiah.trim()) {
      toast({ title: "Error", description: "Fill in all fields", variant: "destructive" });
      return;
    }
    if (/[^a-zA-Z0-9 ]/.test(kode)) {
      toast({ title: "Error", description: "Voucher code can only contain letters, numbers, and spaces", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/voucher-admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode: kode.trim(),
          saldo: Number(saldo) || 1,
          hadiah: finalHadiah.trim(),
          user_id: data.user.id,
        }),
      });
      const json = await res.json();
      if (json.status) {
        setResult(json.data);
        toast({ title: "Success", description: "Voucher created!" });
        regenCode();
        fetchVouchers();
      } else {
        toast({ title: "Error", description: json.message || "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modes: { key: VoucherMode; label: string }[] = [
    { key: "donasi", label: "Donation" },
    { key: "firstime", label: "First Time" },
    { key: "giveaway", label: "Giveaway" },
    { key: "manual", label: "Manual" },
  ];

  const currentPackages = mode === "donasi" ? DONASI_PACKAGES : mode === "firstime" ? FIRSTIME_PACKAGES : [];

  const listTabs: { key: ListTab; label: string; icon: React.ReactNode }[] = [
    { key: "active", label: "Active", icon: <Check className="w-3 h-3" /> },
    { key: "out_of_stock", label: "Out of Stock", icon: <Package className="w-3 h-3" /> },
    { key: "expired", label: "Expired", icon: <Ban className="w-3 h-3" /> },
  ];

  const formatReward = (hadiah: string[]) => {
    return hadiah.map((h) => {
      if (h.startsWith("tokens_")) return `Tokens ${Number(h.replace("tokens_", "")).toLocaleString()}`;
      if (h.startsWith("wpn_")) return `Weapon ${h.replace("wpn_", "")}`;
      if (h.startsWith("set_")) return `Set ${h.replace("set_", "")}`;
      if (h.startsWith("pet_")) return `Pet ${h.replace("pet_", "")}`;
      return h;
    }).join(", ");
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl text-foreground">Admin Panel</h1>
            <Badge className="bg-primary/20 text-primary text-xs">{data.user.username}</Badge>
          </div>
        </motion.div>

        {/* Create Voucher */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display text-lg text-primary flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Create Voucher
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Mode Tabs */}
              <div className="flex flex-wrap gap-2">
                {modes.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => { setMode(m.key); setSelectedHadiah(""); setManualHadiah(""); }}
                    className={`px-3 py-1.5 rounded-md font-display text-xs tracking-wider transition-colors ${
                      mode === m.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Package Selection */}
              {(mode === "donasi" || mode === "firstime") && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">
                    {mode === "donasi" ? "Donation Package" : "First Time Package"}
                  </p>
                  <div className="grid gap-2">
                    {currentPackages.map((pkg) => (
                      <button
                        key={pkg.hadiah}
                        onClick={() => setSelectedHadiah(pkg.hadiah)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          selectedHadiah === pkg.hadiah
                            ? "border-primary bg-primary/10"
                            : "border-border bg-muted/30 hover:border-muted-foreground/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-sm text-foreground">{pkg.label}</span>
                          <Badge variant="outline" className="text-[10px]">{pkg.desc}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Giveaway Selection */}
              {mode === "giveaway" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">Giveaway Reward</p>
                  <div className="grid grid-cols-3 gap-2">
                    {GIVEAWAY_OPTIONS.map((opt) => (
                      <button
                        key={opt.hadiah}
                        onClick={() => setSelectedHadiah(opt.hadiah)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          selectedHadiah === opt.hadiah
                            ? "border-primary bg-primary/10"
                            : "border-border bg-muted/30 hover:border-muted-foreground/40"
                        }`}
                      >
                        <span className="font-display text-xs text-foreground">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Input */}
              {mode === "manual" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">Custom Reward</p>
                  <Input
                    placeholder="e.g. tokens_10000 or wpn_katana"
                    value={manualHadiah}
                    onChange={(e) => setManualHadiah(e.target.value)}
                    className="bg-muted/50 border-border"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Separate multiple rewards with comma: tokens_5000,pet_whitehand
                  </p>
                </div>
              )}

              {/* Stock */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">Stock (Limit)</p>
                <Input
                  type="number"
                  min={1}
                  value={saldo}
                  onChange={(e) => setSaldo(e.target.value)}
                  className="bg-muted/50 border-border w-32"
                />
              </div>

              {/* Voucher Code */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">Voucher Code</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={kode}
                    onChange={(e) => setKode(sanitizeCode(e.target.value))}
                    className="bg-muted/50 border-border font-mono"
                    placeholder="Letters, numbers, spaces only"
                  />
                  <Button size="sm" variant="outline" onClick={regenCode} className="shrink-0">
                    🔄
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Only letters, numbers, and spaces allowed</p>
              </div>

              {/* Submit */}
              <Button
                onClick={handleCreate}
                disabled={submitting || !finalHadiah.trim()}
                className="w-full glow-primary font-display"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
                Create Voucher
              </Button>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    <span className="font-display text-sm text-foreground">Voucher Created!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-mono text-primary font-bold">{result.kode}</code>
                    <button onClick={() => copyCode(result.kode)} className="text-muted-foreground hover:text-foreground">
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Stock: {result.saldo}/{result.saldo_awal}</span>
                    <span>Reward: {Array.isArray(result.hadiah) ? result.hadiah.join(", ") : result.hadiah}</span>
                    {result.expired && <span>Expires: {new Date(result.expired).toLocaleString()}</span>}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Voucher List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display text-lg text-primary flex items-center gap-2">
                <Package className="w-5 h-5" />
                Voucher List
                {voucherLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* List Tabs */}
              <div className="flex flex-wrap gap-2">
                {listTabs.map((t) => {
                  const count = vouchers.filter((v) => {
                    if (t.key === "active") return v.status.active;
                    if (t.key === "out_of_stock") return !v.status.active && v.status.empty && !v.status.expired;
                    if (t.key === "expired") return v.status.expired;
                    return false;
                  }).length;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setListTab(t.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-display text-xs tracking-wider transition-colors ${
                        listTab === t.key
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.icon}
                      {t.label}
                      <span className="ml-1 opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Voucher Items */}
              {pagedVouchers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No vouchers in this category</p>
              ) : (
                <div className="space-y-2">
                  {pagedVouchers.map((v) => (
                    <div
                      key={v.id}
                      className={`p-3 rounded-lg border transition-all ${
                        v.status.active
                          ? "border-primary/30 bg-primary/5"
                          : v.status.expired
                          ? "border-destructive/30 bg-destructive/5 opacity-70"
                          : "border-muted-foreground/20 bg-muted/20 opacity-70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <code className="font-mono text-sm font-bold text-foreground truncate">{v.kode}</code>
                          <button
                            onClick={() => copyCode(v.kode)}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {v.status.active && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] border-0">Active</Badge>
                          )}
                          {v.status.empty && (
                            <Badge className="bg-amber-500/20 text-amber-400 text-[9px] border-0">Empty</Badge>
                          )}
                          {v.status.expired && (
                            <Badge className="bg-destructive/20 text-destructive text-[9px] border-0">Expired</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span>🎁 {formatReward(v.hadiah)}</span>
                        <span>📦 {v.saldo}/{v.saldo_awal} ({v.used} used)</span>
                        <span>👤 {v.creator.username}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground/60 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          Created: {new Date(v.created).toLocaleDateString()}
                        </span>
                        {v.expired && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            Expires: {new Date(v.expired).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {/* Usage bar */}
                      <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            v.status.active ? "bg-primary" : v.status.expired ? "bg-destructive" : "bg-amber-500"
                          }`}
                          style={{ width: `${v.usage_percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground font-display">
                    {page} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
