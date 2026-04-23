import { motion } from "framer-motion";
import { Heart, MessageCircle, Users, Gift, QrCode, TrendingUp, Sparkles, History, Wallet, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEffect, useMemo, useState } from "react";

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
  </svg>
);

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
  const [donorData, setDonorData] = useState<DonorApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrisOpen, setQrisOpen] = useState(false);
  const [historyDonor, setHistoryDonor] = useState<GroupedDonor | null>(null);

  useEffect(() => {
    fetch("https://play.kotagames.web.id/api/donatur/log")
      .then((r) => r.json())
      .then((d: DonorApiResponse) => setDonorData(d))
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

        {/* Donation Reward + QRIS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 glass-card rounded-2xl p-6 md:p-8 border-accent/30"
        >
          <div className="flex items-center justify-center gap-2 text-accent mb-3">
            <Gift className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold tracking-wider">{t("donatur_reward_title")}</h2>
          </div>
          <p className="text-center text-muted-foreground text-sm mb-5">{t("donatur_reward_desc")}</p>

          <div className="rounded-xl bg-primary/10 border border-primary/30 p-5 text-center mb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">{t("donatur_reward_min")}</p>
            <p className="font-display text-3xl font-black text-primary text-glow mt-1">Rp 10.000</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/15 border border-accent/30 px-4 py-1.5">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-display font-bold text-accent">{t("donatur_reward_bonus")}</span>
            </div>
          </div>

          <Button
            onClick={() => setQrisOpen(true)}
            className="w-full h-12 font-display text-sm gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <QrCode className="w-5 h-5" />
            {t("donatur_show_qris")}
          </Button>
        </motion.div>

        {/* Stats */}
        {!loading && donorData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 grid grid-cols-2 gap-3"
          >
            <div className="glass-card rounded-xl p-4 text-center">
              <TrendingUp className="mx-auto w-5 h-5 text-accent mb-1" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("donatur_total_raised")}</p>
              <p className="font-display text-lg font-bold text-foreground mt-1">
                {formatRupiah(parseInt(donorData.total || "0", 10))}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Users className="mx-auto w-5 h-5 text-primary mb-1" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("donatur_total_donors")}</p>
              <p className="font-display text-lg font-bold text-foreground mt-1">{donorData.jumlah_data}</p>
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

        {/* Donor List */}
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
          ) : !donorData || donorData.data.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">{t("donatur_empty")}</p>
            </div>
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="divide-y divide-border/40">
                {donorData.data.map((d, i) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 md:p-4 hover:bg-card/40 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center font-display text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-foreground truncate text-sm">{d.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(d.created_at, lang)} · {d.method.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-accent text-sm">{formatRupiah(d.nominal)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{d.kurs}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

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
