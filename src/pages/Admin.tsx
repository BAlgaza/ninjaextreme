import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "https://play.kotagames.web.id/api";

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
  const clean = username.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${clean}-${rand}`;
};

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

  useEffect(() => {
    document.title = "Admin — Ninja's Extreme";
  }, []);

  // Generate code once we have user data
  useEffect(() => {
    if (data?.user?.username) {
      setKode(generateCode(data.user.username));
    }
  }, [data?.user?.username]);

  const regenCode = () => {
    if (data?.user?.username) setKode(generateCode(data.user.username));
  };

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
              <p className="text-sm text-muted-foreground">
                You do not have admin privileges.
              </p>
              <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
                Back to Home
              </Button>
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

              {/* Package Selection (donasi / firstime) */}
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

              {/* Stock / Limit */}
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
                    onChange={(e) => setKode(e.target.value)}
                    className="bg-muted/50 border-border font-mono"
                  />
                  <Button size="sm" variant="outline" onClick={regenCode} className="shrink-0">
                    🔄
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Auto-generated from your username + random code</p>
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
      </div>
    </div>
  );
};

export default Admin;
