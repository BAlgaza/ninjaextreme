import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, Crown, Users, Coins, Swords, Trophy, Loader2, X, Building2, Droplet, ShieldCheck, Ban } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const API_BASE = "https://play.kotagames.web.id";

interface Clan {
  id: number;
  season_id: number;
  name: string;
  master_id: number;
  master_name: string;
  prestige: number;
  max_members: number;
  gold: number;
  tokens: number;
  buildings: string;
  total_members?: number;
  alive_members?: number;
  is_bleeding?: boolean;
  is_protected?: boolean;
  attackable?: boolean;
  created_at: string;
  updated_at: string;
}

interface Member {
  id: number;
  clan_id: number;
  character_id: number;
  name: string;
  level: number;
  class: string;
  pvp_trophy: number;
  role: number;
  stamina: number;
  max_stamina: number;
  donated_golds: number;
  donated_tokens: number;
  reputation: number;
  prestige_boost_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Battle {
  id: number;
  season_id: number;
  attacker_clan_id: number;
  attacker_name: string;
  defender_clan_id: number;
  defender_name: string;
  is_attacker: boolean;
  result: string;
  attacker_won: boolean;
  battle_data: { hit_members?: number[] };
  created_at: string;
}

const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n || 0);
const fmtDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return s;
  }
};
const fmtDateTime = (s: string) => {
  try {
    return new Date(s).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return s;
  }
};

const parseBuildings = (raw: string): Record<string, number> => {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
};

const Clans = () => {
  const { t } = useLanguage();
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [modalTab, setModalTab] = useState<"members" | "battles" | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    document.title = `${t("clans_title")} — Ninja's Extreme`;
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const r = await fetch(`${API_BASE}/api/klan/all`);
        const data = await r.json();
        if (cancelled) return;
        if (data?.status && Array.isArray(data.clans)) {
          const sorted = [...data.clans].sort((a: Clan, b: Clan) => b.prestige - a.prestige);
          setClans(sorted);
        } else {
          setError(true);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openMembers = useCallback(async (clan: Clan) => {
    setSelectedClan(clan);
    setModalTab("members");
    setMembers([]);
    setSubLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/klan/lihat/${clan.id}/members`);
      const data = await r.json();
      if (data?.status && Array.isArray(data.members)) {
        const sorted = [...data.members].sort(
          (a: Member, b: Member) => (b.stamina ?? 0) - (a.stamina ?? 0),
        );
        setMembers(sorted);
      }
    } catch {
      /* noop */
    } finally {
      setSubLoading(false);
    }
  }, []);

  const openBattles = useCallback(async (clan: Clan) => {
    setSelectedClan(clan);
    setModalTab("battles");
    setBattles([]);
    setSubLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/klan/lihat/${clan.id}/battle`);
      const data = await r.json();
      if (data?.status && Array.isArray(data.battles)) {
        setBattles(data.battles);
      }
    } catch {
      /* noop */
    } finally {
      setSubLoading(false);
    }
  }, []);

  const closeModal = () => {
    setSelectedClan(null);
    setModalTab(null);
  };

  const roleLabel = (role: number) => {
    if (role >= 2) return t("clans_role_master");
    if (role === 1) return t("clans_role_elder");
    return t("clans_role_member");
  };

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container max-w-6xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-display tracking-widest text-primary">CLANS</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">
            {t("clans_title")}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">{t("clans_subtitle")}</p>
        </motion.div>

        {/* Status */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t("clans_loading")}</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 text-destructive font-display">{t("clans_error")}</div>
        )}

        {!loading && !error && (
          <>
            <div className="text-center mb-6 text-sm text-muted-foreground">
              {t("clans_total")}: <span className="text-primary font-bold">{clans.length}</span>
            </div>

            <div className="grid gap-3">
              {clans.map((clan, idx) => {
                const buildings = parseBuildings(clan.buildings);
                const rankColor =
                  idx === 0
                    ? "text-yellow-400"
                    : idx === 1
                    ? "text-gray-300"
                    : idx === 2
                    ? "text-amber-600"
                    : "text-muted-foreground";
                return (
                  <motion.div
                    key={clan.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                  >
                    <Card
                      className={`glass-card border-border/50 p-4 hover:border-primary/40 transition-colors relative overflow-hidden ${
                        clan.is_bleeding ? "clan-bleeding border-destructive/70" : ""
                      }`}
                    >
                      {clan.is_bleeding && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-destructive/15 via-destructive/5 to-transparent pointer-events-none animate-pulse" />
                          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(239,68,68,0.35)]" />
                        </>
                      )}
                      <div className="relative flex flex-col md:flex-row md:items-center gap-4">
                        {/* Rank + Name */}
                        <div className="flex items-center gap-3 md:w-64">
                          <div className={`font-display text-2xl font-bold w-10 text-center ${rankColor}`}>
                            #{idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-display text-lg font-bold text-foreground truncate flex items-center gap-1.5">
                              {clan.name}
                              {clan.is_bleeding && (
                                <span
                                  title={t("clans_bleeding")}
                                  className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-destructive/30 text-destructive border border-destructive/60 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                                >
                                  <Droplet className="w-2.5 h-2.5 animate-bounce" />
                                  {t("clans_bleeding")}
                                </span>
                              )}
                              {clan.is_protected && (
                                <span
                                  title={t("clans_protected")}
                                  className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                >
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  {t("clans_protected")}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                              <Crown className="w-3 h-3 text-yellow-400 shrink-0" />
                              <span className="truncate">{clan.master_name}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 md:flex md:flex-1 gap-3 md:gap-6 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-primary shrink-0" />
                            <div>
                              <div className="text-muted-foreground">{t("clans_prestige")}</div>
                              <div className="font-bold text-foreground">{fmtNum(clan.prestige)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                            <div>
                              <div className="text-muted-foreground">{t("clans_gold")}</div>
                              <div className="font-bold text-foreground">{fmtNum(clan.gold)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-accent shrink-0" />
                            <div>
                              <div className="text-muted-foreground">{t("clans_members")}</div>
                              <div className="font-bold text-foreground">
                                {clan.alive_members != null && clan.total_members != null ? (
                                  <>
                                    <span className="text-primary">{clan.alive_members}</span>
                                    <span className="text-muted-foreground">/{clan.total_members}</span>
                                    <span className="text-[10px] text-muted-foreground">/{clan.max_members}</span>
                                  </>
                                ) : (
                                  <>{clan.total_members ?? clan.max_members}/{clan.max_members}</>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Buildings + Actions */}
                        <div className="flex flex-col md:items-end gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            {Object.entries(buildings).map(([k, v]) => (
                              <span key={k} className="px-1.5 py-0.5 bg-muted rounded">
                                {k}:{v}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openMembers(clan)}
                              className="h-8 text-xs"
                            >
                              <Users className="w-3 h-3 mr-1" />
                              {t("clans_view_members")}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openBattles(clan)}
                              className="h-8 text-xs"
                            >
                              <Swords className="w-3 h-3 mr-1" />
                              {t("clans_view_battles")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <Dialog open={!!selectedClan && !!modalTab} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="glass-card border-border max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary flex items-center gap-2">
              {modalTab === "members" ? <Users className="w-5 h-5" /> : <Swords className="w-5 h-5" />}
              {selectedClan?.name} —{" "}
              {modalTab === "members" ? t("clans_members_title") : t("clans_battles_title")}
            </DialogTitle>
          </DialogHeader>

          {subLoading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t("clans_loading")}</span>
            </div>
          )}

          {!subLoading && modalTab === "members" && (
            <>
              {members.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">{t("clans_no_members")}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>{t("clans_member_name")}</TableHead>
                        <TableHead className="text-center">{t("clans_member_level")}</TableHead>
                        <TableHead className="min-w-[140px]">{t("clans_member_stamina")}</TableHead>
                        <TableHead className="text-right">{t("clans_member_donated")}</TableHead>
                        <TableHead className="text-right">{t("clans_member_reputation")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((m, i) => {
                        const max = m.max_stamina || 1;
                        const pct = Math.min(100, Math.max(0, (m.stamina / max) * 100));
                        const barColor =
                          pct > 66 ? "bg-primary" : pct > 33 ? "bg-yellow-400" : "bg-destructive";
                        return (
                          <TableRow key={m.id}>
                            <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                            <TableCell>
                              <div className="font-medium text-foreground flex items-center gap-1.5">
                                {m.role >= 2 && <Crown className="w-3 h-3 text-yellow-400" />}
                                {m.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                ID: {m.character_id} · {roleLabel(m.role)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono text-primary">{m.level}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden min-w-[60px]">
                                  <div
                                    className={`h-full ${barColor} transition-all`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                                  {m.stamina}/{m.max_stamina}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="text-yellow-400 text-xs">{fmtNum(m.donated_golds)}g</div>
                              <div className="text-accent text-[10px]">{fmtNum(m.donated_tokens)}t</div>
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground">
                              {fmtNum(m.reputation)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}

          {!subLoading && modalTab === "battles" && (
            <>
              {battles.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">{t("clans_no_battles")}</div>
              ) : (
                <div className="space-y-2">
                  {battles.map((b) => {
                    const isAttacker = b.attacker_clan_id === selectedClan?.id;
                    const ourWon = isAttacker ? b.attacker_won : !b.attacker_won;
                    return (
                      <div
                        key={b.id}
                        className={`p-3 rounded-lg border ${
                          ourWon
                            ? "border-primary/40 bg-primary/5"
                            : "border-destructive/40 bg-destructive/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-sm">
                            <span className={isAttacker ? "font-bold text-foreground" : "text-muted-foreground"}>
                              {b.attacker_name}
                            </span>
                            <Swords className="w-3 h-3 text-muted-foreground" />
                            <span className={!isAttacker ? "font-bold text-foreground" : "text-muted-foreground"}>
                              {b.defender_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-display font-bold px-2 py-0.5 rounded ${
                                ourWon
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-destructive text-destructive-foreground"
                              }`}
                            >
                              {ourWon ? t("clans_battle_win") : t("clans_battle_lose")}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                          <span>
                            {isAttacker ? t("clans_battle_attacker") : t("clans_battle_defender")} ·{" "}
                            {b.battle_data?.hit_members?.length || 0} hits
                          </span>
                          <span>{fmtDateTime(b.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={closeModal}>
              <X className="w-3 h-3 mr-1" />
              {t("clans_close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Clans;
