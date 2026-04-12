import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Loader2 } from "lucide-react";
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

  useEffect(() => {
    fetch("https://vps.algaza.site/api/top10/level")
      .then((r) => r.json())
      .then((json) => {
        if (json.status) setPlayers(json.data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background pt-20 pb-8 px-4">
      <div className="container max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Trophy className="mx-auto w-10 h-10 text-accent mb-3" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow">{t("rank_title")}</h1>
          <p className="text-muted-foreground mt-1">{t("rank_subtitle")}</p>
        </motion.div>

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
