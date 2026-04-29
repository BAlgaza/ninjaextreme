import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Gift, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "https://play.kotagames.web.id";

interface LogItem {
  character_id: number;
  character_name: string;
  voucher: string;
  rewards: string[];
  created_at: string;
}

const Voucher = () => {
  const { t, lang } = useLanguage();
  const [kode, setKode] = useState("");
  const [karakterId, setKarakterId] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    document.title = `${t("voucher_title")} — Ninja's Extreme`;
  }, [t]);

  const timeAgo = useCallback(
    (s: string) => {
      const diff = Math.floor((Date.now() - new Date(s).getTime()) / 1000);
      if (diff < 60) return `${diff} ${t("sec_ago")}`;
      const m = Math.floor(diff / 60);
      if (m < 60) return `${m} ${t("min_ago")}`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h} ${t("hr_ago")}`;
      return `${Math.floor(h / 24)} ${t("days_ago")}`;
    },
    [t],
  );

  const rewardClass = (r: string) => {
    const x = r.toLowerCase();
    if (x.includes("gold")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
    if (x.includes("token")) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    if (x.includes("tp")) return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40";
    if (x.includes("skill")) return "bg-primary/20 text-primary border-primary/40";
    return "bg-muted text-muted-foreground border-border";
  };

  const loadLogs = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLogsLoading(true);
    setLogsError(false);
    const url = `${API_BASE}/api/voucher/log?page=${page}&limit=8&sort=${sort}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (!json?.status || !Array.isArray(json.data)) {
        setLogs([]);
        setTotalPages(1);
      } else {
        setLogs(json.data);
        setTotalPages(json.meta?.total_pages || 1);
      }
    } catch {
      setLogsError(true);
      setLogs([]);
    } finally {
      setLogsLoading(false);
      isLoadingRef.current = false;
    }
  }, [page, sort]);

  useEffect(() => {
    loadLogs();
    const id = setInterval(loadLogs, 10000);
    return () => clearInterval(id);
  }, [loadLogs]);

  const validate = (): string | null => {
    const k = kode.trim().toUpperCase();
    const cid = parseInt(karakterId, 10);
    const u = username.trim();
    if (!k || !cid) return t("voucher_err_required");
    if (!u) return t("voucher_err_userid");
    if (k.length > 32) return t("voucher_err_too_long");
    if (!/^[A-Z0-9]+$/.test(k)) return t("voucher_err_format");
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setLoading(true);
    const k = kode.trim().toUpperCase();
    const url = `${API_BASE}/api/voucher/claim/${encodeURIComponent(k)}/${encodeURIComponent(username.trim())}/${parseInt(karakterId, 10)}`;
    try {
      const res = await fetch(url);
      const data = await res.json().catch(() => null);
      if (!data || typeof data.status === "undefined") {
        setErrorMsg(lang === "id" ? "Response API tidak valid." : "Invalid API response.");
      } else if (!data.status) {
        setErrorMsg(data.message || (lang === "id" ? "Gagal klaim voucher." : "Failed to claim voucher."));
      } else {
        const rewards: string[] = Array.isArray(data.reward) ? data.reward : [];
        const rewardStr = rewards.map(formatReward).join(", ");
        const baseMsg = data.message || (lang === "id" ? "Voucher berhasil diklaim!" : "Voucher claimed successfully!");
        setSuccessMsg(rewardStr ? `${baseMsg} — ${rewardStr}` : baseMsg);
        setKode("");
        loadLogs();
      }
    } catch {
      setErrorMsg(t("err_network"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-16 px-4">
      <div className="container max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary tracking-wider flex items-center justify-center gap-3">
            <Ticket className="w-8 h-8" />
            {t("voucher_title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{t("voucher_subtitle")}</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 rounded-xl border border-border space-y-4 mb-8"
        >
          <div className="space-y-1.5">
            <Label htmlFor="kode">{t("voucher_code")}</Label>
            <Input
              id="kode"
              value={kode}
              onChange={(e) => setKode(e.target.value.toUpperCase())}
              placeholder={t("voucher_code_ph")}
              maxLength={32}
              required
              className="font-mono tracking-wider uppercase"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">{t("voucher_user_id")}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("voucher_user_id_ph")}
                maxLength={30}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="charid">{t("voucher_char_id")}</Label>
              <Input
                id="charid"
                type="number"
                inputMode="numeric"
                value={karakterId}
                onChange={(e) => setKarakterId(e.target.value)}
                placeholder={t("voucher_char_id_ph")}
                required
              />
            </div>
          </div>

          {successMsg && (
            <div className="flex items-start gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-md p-3">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-md p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 font-display tracking-wider gap-2 glow-primary"
          >
            <Gift className="w-4 h-4" />
            {loading ? t("voucher_processing") : t("voucher_submit")}
          </Button>
        </motion.form>

        <div className="glass-card p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-display text-lg text-primary tracking-wider">
              {t("voucher_logs_title")}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPage(1); setSort("desc"); }}
                className={`px-3 py-1 rounded-md text-xs font-display tracking-wider transition-colors ${
                  sort === "desc" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {t("voucher_newest")}
              </button>
              <button
                onClick={() => { setPage(1); setSort("asc"); }}
                className={`px-3 py-1 rounded-md text-xs font-display tracking-wider transition-colors ${
                  sort === "asc" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {t("voucher_oldest")}
              </button>
              <button
                onClick={loadLogs}
                disabled={logsLoading}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${logsLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {logsError ? (
            <div className="text-center py-8 text-destructive text-sm">{t("voucher_load_failed")}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {logsLoading ? "..." : t("voucher_no_logs")}
            </div>
          ) : (
            <ul className="space-y-2">
              {logs.map((log, i) => {
                const mine = username && log.character_name?.toLowerCase() === username.trim().toLowerCase();
                return (
                  <li
                    key={`${log.character_id}-${log.created_at}-${i}`}
                    className={`p-3 rounded-lg border ${
                      mine ? "bg-primary/10 border-primary/40" : "bg-muted/30 border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-sm text-foreground truncate">
                          {log.character_name}{" "}
                          <span className="text-muted-foreground font-normal">({log.character_id})</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {t("voucher_claimed_voucher")}{" "}
                          <span className="font-mono text-foreground">{log.voucher}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {timeAgo(log.created_at)}
                      </span>
                    </div>
                    {log.rewards?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {log.rewards.map((r, j) => (
                          <span
                            key={j}
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${rewardClass(r)}`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="h-8 px-2 rounded-md text-xs font-display bg-muted text-muted-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                « {t("pg_first")}
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-3 rounded-md text-xs font-display bg-muted text-muted-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹ {t("pg_prev")}
              </button>
              <span className="h-8 px-3 inline-flex items-center rounded-md text-xs font-display bg-primary text-primary-foreground">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 px-3 rounded-md text-xs font-display bg-muted text-muted-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("pg_next")} ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="h-8 px-2 rounded-md text-xs font-display bg-muted text-muted-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("pg_last")} »
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Voucher;
