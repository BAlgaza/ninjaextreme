import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Activity, CalendarDays, Swords, Crown, Coins, Trophy, Loader2, ChevronRight, Shield, Server } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Clans from "./Clans";

const API_BASE = "https://play.kotagames.web.id";

interface OnlineUser {
  id: number;
  name: string;
  account_type: number;
  tokens: number;
  updated_at: string;
}

interface OnlineChar {
  id: number;
  character_name: string;
  level: number;
  user_id: number;
  user_name: string;
}

interface TopLevel {
  id: number;
  name: string;
  level: number;
  xp: number;
  rank: number;
  username: string;
}

interface TopSultan {
  id: number;
  username: string;
  tokens: number;
}

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n || 0);

const fetchJson = async (path: string) => {
  const r = await fetch(`${API_BASE}${path}`);
  return r.json();
};

type StatTab = "clans" | "server";

const Statistik = () => {
  const { t, lang } = useLanguage();
  const [tab, setTab] = useState<StatTab>("clans");
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    users: 0,
    usersToday: 0,
    usersOnline: 0,
    users3d: 0,
    chars: 0,
    charsToday: 0,
    charsOnline: 0,
    chars3d: 0,
  });
  const [topLevel, setTopLevel] = useState<TopLevel[]>([]);
  const [topSultan, setTopSultan] = useState<TopSultan[]>([]);

  const [modal, setModal] = useState<null | "users" | "chars">(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [onlineChars, setOnlineChars] = useState<OnlineChar[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchServerData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [
        tu, tut, to5, to3,
        tc, tct, toc5, toc3,
        lvl, sultan,
      ] = await Promise.all([
        fetchJson("/api/stats/totalusers"),
        fetchJson("/api/stats/totalusers/online"),
        fetchJson("/api/stats/totalusers/online-5m"),
        fetchJson("/api/stats/totalusers/online/3hari"),
        fetchJson("/api/stats/totalcharacter"),
        fetchJson("/api/stats/totalcharacter/online"),
        fetchJson("/api/stats/characters/online-5m/total"),
        fetchJson("/api/stats/totalcharacter/online/3hari"),
        fetchJson("/api/stats/toprank/level"),
        fetchJson("/api/stats/toprank/sultan/token"),
      ]);
      setTotals({
        users: tu?.total_users || 0,
        usersToday: tut?.online_today || 0,
        usersOnline: to5?.online_5m || 0,
        users3d: to3?.online_3_days || 0,
        chars: tc?.total_character || 0,
        charsToday: tct?.online_character_today || 0,
        charsOnline: toc5?.total_character_online || 0,
        chars3d: toc3?.online_character_3_days || 0,
      });
      if (lvl?.status) setTopLevel(lvl.data || []);
      if (sultan?.status) setTopSultan(sultan.data || []);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab !== "server") return;
    fetchServerData(true);
    const id = setInterval(() => fetchServerData(false), 3000);
    return () => clearInterval(id);
  }, [tab, fetchServerData]);

  const openOnlineUsers = useCallback(async () => {
    setModal("users");
    setModalLoading(true);
    try {
      const r = await fetchJson("/api/stats/users/online-5m");
      if (r?.status) setOnlineUsers((r.data || []).sort((a: OnlineUser, b: OnlineUser) => b.tokens - a.tokens));
    } finally {
      setModalLoading(false);
    }
  }, []);

  const openOnlineChars = useCallback(async () => {
    setModal("chars");
    setModalLoading(true);
    try {
      const r = await fetchJson("/api/stats/characters/online-5m");
      if (r?.status) setOnlineChars((r.data || []).sort((a: OnlineChar, b: OnlineChar) => b.level - a.level));
    } finally {
      setModalLoading(false);
    }
  }, []);

  const StatCard = ({
    icon: Icon, label, value, accent, onClick,
  }: { icon: typeof Users; label: string; value: number; accent?: boolean; onClick?: () => void }) => (
    <Card
      onClick={onClick}
      className={`p-4 glass-card border-border/50 ${onClick ? "cursor-pointer hover:border-primary/60 transition-colors" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md ${accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-display">{label}</div>
          <div className="text-2xl font-display font-bold">{fmt(value)}</div>
        </div>
        {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </div>
    </Card>
  );

  const tabs: { key: StatTab; label: string; icon: React.ReactNode }[] = [
    { key: "clans", label: "Clans", icon: <Shield className="w-3.5 h-3.5" /> },
    { key: "server", label: "Server", icon: <Server className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary tracking-wider">
            {t("stats_title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t("stats_subtitle")}</p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-display text-xs tracking-wider transition-colors ${
                tab === tb.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tb.icon}
              {tb.label}
            </button>
          ))}
        </div>

        {tab === "clans" ? (
          <Clans embedded />
        ) : (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> {t("stats_loading")}
              </div>
            ) : (
              <>
                <section className="mb-8">
                  <h2 className="font-display text-sm tracking-widest text-muted-foreground mb-3">
                    {t("stats_users_section")}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard icon={Users} label={t("stats_total_users")} value={totals.users} />
                    <StatCard icon={UserCheck} label={t("stats_active_users")} value={totals.usersToday} onClick={openOnlineUsers} />
                    <StatCard icon={Activity} label={t("stats_online_users")} value={totals.usersOnline} accent onClick={openOnlineUsers} />
                    <StatCard icon={CalendarDays} label={t("stats_active_3d")} value={totals.users3d} />
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="font-display text-sm tracking-widest text-muted-foreground mb-3">
                    {t("stats_chars_section")}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard icon={Swords} label={t("stats_total_chars")} value={totals.chars} />
                    <StatCard icon={UserCheck} label={t("stats_active_chars")} value={totals.charsToday} onClick={openOnlineChars} />
                    <StatCard icon={Activity} label={t("stats_online_chars")} value={totals.charsOnline} accent onClick={openOnlineChars} />
                    <StatCard icon={CalendarDays} label={t("stats_active_chars_3d")} value={totals.chars3d} />
                  </div>
                </section>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="glass-card border-border/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="w-5 h-5 text-primary" />
                      <h3 className="font-display text-base tracking-wider">{t("stats_top_level")}</h3>
                    </div>
                    {topLevel.length === 0 ? (
                      <div className="text-muted-foreground text-sm py-6 text-center">{t("stats_no_data")}</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-10">#</TableHead>
                              <TableHead>{t("stats_col_name")}</TableHead>
                              <TableHead className="text-right">{t("stats_col_level")}</TableHead>
                              <TableHead className="text-right hidden sm:table-cell">{t("stats_col_xp")}</TableHead>
                              <TableHead className="text-right">{t("stats_col_rank")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topLevel.map((p, i) => (
                              <TableRow key={p.id}>
                                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                <TableCell>
                                  <div className="font-medium">{p.name}</div>
                                  <div className="text-xs text-muted-foreground">@{p.username}</div>
                                </TableCell>
                                <TableCell className="text-right font-display text-primary">{p.level}</TableCell>
                                <TableCell className="text-right hidden sm:table-cell text-muted-foreground">{fmt(p.xp)}</TableCell>
                                <TableCell className="text-right">{p.rank}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </Card>

                  <Card className="glass-card border-border/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Coins className="w-5 h-5 text-primary" />
                      <h3 className="font-display text-base tracking-wider">{t("stats_top_sultan")}</h3>
                    </div>
                    {topSultan.length === 0 ? (
                      <div className="text-muted-foreground text-sm py-6 text-center">{t("stats_no_data")}</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-10">#</TableHead>
                              <TableHead>{t("stats_col_user")}</TableHead>
                              <TableHead className="text-right">{t("stats_col_tokens")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topSultan.map((p, i) => (
                              <TableRow key={p.id}>
                                <TableCell className="text-muted-foreground">
                                  {i === 0 ? <Trophy className="w-4 h-4 text-yellow-400" /> : i + 1}
                                </TableCell>
                                <TableCell className="font-medium">@{p.username}</TableCell>
                                <TableCell className="text-right font-display text-primary">{fmt(p.tokens)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Dialog open={modal !== null} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="glass-card border-border max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-primary tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {modal === "users" ? t("stats_online_users_title") : t("stats_online_chars_title")}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto -mx-2 px-2">
            {modalLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {t("stats_loading")}
              </div>
            ) : modal === "users" ? (
              onlineUsers.length === 0 ? (
                <div className="text-muted-foreground text-sm py-6 text-center">{t("stats_no_data")}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>{t("stats_col_user")}</TableHead>
                      <TableHead className="text-right">{t("stats_col_tokens")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onlineUsers.map((u, i) => (
                      <TableRow key={u.id}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-right font-display text-primary">{fmt(u.tokens)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            ) : (
              onlineChars.length === 0 ? (
                <div className="text-muted-foreground text-sm py-6 text-center">{t("stats_no_data")}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>{t("stats_col_char")}</TableHead>
                      <TableHead className="text-right">{t("stats_col_level")}</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">{t("stats_col_user")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onlineChars.map((c, i) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{c.character_name}</TableCell>
                        <TableCell className="text-right font-display text-primary">{c.level}</TableCell>
                        <TableCell className="text-right hidden sm:table-cell text-muted-foreground">@{c.user_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            )}
          </div>

          <Button variant="outline" onClick={() => setModal(null)} className="border-border">
            {t("stats_close")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Statistik;
