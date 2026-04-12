import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Loader2, RefreshCw } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface RankPlayer {
  id: number;
  name: string;
  level: number;
  gold: number;
  xp: number;
}

const rankIcons = [Crown, Medal, Medal];
const rankColors = ["text-accent", "text-muted-foreground", "text-primary"];

const TopRank = () => {
  const { t } = useLanguage();
  const [players, setPlayers] = useState<RankPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch("https://vps.algaza.site/api/top10/level");
      const json = await r.json();
      if (json.status) {
        setPlayers(json.data);
        setLastUpdate(new Date());
        setSecondsAgo(0);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    if (!lastUpdate) return;
    const id = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdate.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [lastUpdate]);

  return (
    <div className="min-h-screen bg-background pt-[calc(1.75rem+3.5rem+1rem)] pb-8 px-4">
      <div className="container max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Trophy className="mx-auto w-10 h-10 text-accent mb-3" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow">{t("rank_title")}</h1>
          <p className="text-muted-foreground mt-1">{t("rank_subtitle")}</p>
        </motion.div>

        {/* Last sync info */}
        {lastUpdate && (
          <div className="flex items-center justify-center gap-3 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-primary animate-spin" style={{ animationDuration: "3s" }} />
              <span>{t("rank_last_sync")}: <span className="text-foreground font-semibold">{secondsAgo}{t("rank_seconds_ago")}</span></span>
            </div>
            <span className="text-border">•</span>
            <span>{t("rank_auto_refresh")}</span>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && <p className="text-center text-destructive py-10">{t("rank_error")}</p>}

        {!loading && !error && (
          <div className="space-y-3">
            {players.map((p, i) => {
              const Icon = rankIcons[i] || null;
              const color = rankColors[i] || "text-foreground";
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card rounded-xl p-4 flex items-center gap-4 ${i === 0 ? "border-accent/40 glow-primary" : ""}`}
                >
                  <div className={`font-display text-2xl font-black w-8 text-center ${color}`}>
                    {Icon ? <Icon className="w-6 h-6 mx-auto" /> : `#${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-foreground truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t("rank_xp")}: {p.xp.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-sm font-bold text-primary">Lv.{p.level}</div>
                    <div className="text-xs text-accent">{p.gold.toLocaleString()} G</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopRank;
