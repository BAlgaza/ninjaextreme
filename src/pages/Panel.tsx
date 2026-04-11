import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Coins, Package, Sparkles, ShieldAlert, ArrowLeft, Gift, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const API_BASE = "https://vps.algaza.site/api";

interface CharacterData {
  id: number;
  user_id: number;
  name: string;
  level: number;
  xp: number;
  gender: number;
  gold: number;
  tp: number;
  element_1: number;
  element_2: number;
  element_3: number;
  klaim: number;
  last_klaim: string;
  equipment_weapon: string;
  equipment_skills: string[];
  created_at: string;
  updated_at: string;
}

interface SearchResultItem {
  id: number;
  skill_id?: string;
  item_id?: string;
  name: string;
  level: number;
  element?: number;
  price_gold?: number;
  price_tokens?: number;
  premium?: number;
  icon?: string | null;
}

type Step = "input" | "choose" | "search" | "done";

const Panel = () => {
  const [charId, setCharId] = useState("");
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"skills" | "items" | "">("");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");
  const [dialogType, setDialogType] = useState<"success" | "error" | "info">("info");

  const showDialog = (title: string, msg: string, type: "success" | "error" | "info" = "info") => {
    setDialogTitle(title);
    setDialogMsg(msg);
    setDialogType(type);
    setDialogOpen(true);
  };

  const fetchCharacter = async () => {
    if (!charId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(charId.trim())}/tarik`);
      const json = await res.json();
      if (json.status && json.data) {
        const data = json.data as CharacterData;
        if (data.klaim === 0) {
          showDialog("Akses Ditolak", "Kamu sudah limit klaim hari ini. Kembali besok! 🕐", "error");
        } else {
          setCharacter(data);
          setStep("choose");
        }
      } else {
        showDialog("Error", json.message || "Karakter tidak ditemukan", "error");
      }
    } catch {
      showDialog("Error", "Gagal menghubungi server. Coba lagi nanti.", "error");
    } finally {
      setLoading(false);
    }
  };

  const claimTokens = async () => {
    if (!character) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${character.id}/tokens/10000`);
      const json = await res.json();
      showDialog(
        json.status ? "Berhasil! 🎉" : "Gagal",
        json.message || (json.status ? "10.000 Tokens berhasil diklaim!" : "Klaim gagal."),
        json.status ? "success" : "error"
      );
      if (json.status) {
        setCharacter((prev) => prev ? { ...prev, klaim: prev.klaim - 1 } : prev);
      }
    } catch {
      showDialog("Error", "Gagal menghubungi server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const searchItems = useCallback(async (q: string, cat: "skills" | "items") => {
    if (!character || q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${cat}/${character.id}?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setSearchResults(json.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [character]);

  const claimItem = async (item: SearchResultItem) => {
    if (!character) return;
    setLoading(true);
    const idField = selectedCategory === "skills" ? item.skill_id : item.item_id;
    try {
      const res = await fetch(`${API_BASE}/${character.id}/${selectedCategory}/${idField}`);
      const json = await res.json();
      showDialog(
        json.status ? "Berhasil! 🎉" : "Gagal",
        json.message || (json.status ? `${item.name} berhasil diklaim!` : "Klaim gagal."),
        json.status ? "success" : "error"
      );
      if (json.status) {
        setCharacter((prev) => prev ? { ...prev, klaim: prev.klaim - 1 } : prev);
      }
    } catch {
      showDialog("Error", "Gagal menghubungi server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat: "skills" | "items") => {
    setSelectedCategory(cat);
    setSearchQuery("");
    setSearchResults([]);
    setStep("search");
  };

  const reset = () => {
    setStep("input");
    setCharacter(null);
    setCharId("");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedCategory("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary text-glow mb-2">
          NINJA'S EXTREME
        </h1>
        <p className="text-muted-foreground font-body">Web Panel — Klaim Reward</p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card rounded-2xl p-6 space-y-6"
      >
        <AnimatePresence mode="wait">
          {/* STEP 1: Input Character ID */}
          {step === "input" && (
            <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="flex items-center gap-2 text-accent">
                <ShieldAlert className="w-5 h-5" />
                <span className="font-display text-sm font-semibold tracking-wider">MASUKKAN KARAKTER ID</span>
              </div>
              <Input
                type="number"
                placeholder="Contoh: 1"
                value={charId}
                onChange={(e) => setCharId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchCharacter()}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground text-lg h-12"
              />
              <Button onClick={fetchCharacter} disabled={loading || !charId.trim()} className="w-full h-12 text-base font-display glow-primary">
                {loading ? <Loader2 className="animate-spin" /> : "TARIK DATA"}
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Choose Category */}
          {step === "choose" && character && (
            <motion.div key="choose" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
              {/* Character Info */}
              <div className="glass-card rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-primary">{character.name}</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-display">Lv.{character.level}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>Gold: <span className="text-accent font-semibold">{character.gold.toLocaleString()}</span></span>
                  <span>TP: <span className="text-secondary font-semibold">{character.tp.toLocaleString()}</span></span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-accent">
                <Gift className="w-5 h-5" />
                <span className="font-display text-sm font-semibold">HAK KLAIM: <span className="text-primary">{character.klaim}x</span></span>
              </div>

              <p className="text-muted-foreground text-sm">Pilih kategori yang ingin diklaim:</p>

              <div className="space-y-3">
                <Button onClick={claimTokens} disabled={loading || character.klaim <= 0} className="w-full h-14 text-base font-display justify-start gap-3 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30">
                  {loading ? <Loader2 className="animate-spin" /> : <Coins className="w-5 h-5" />}
                  <div className="text-left">
                    <div className="font-bold">TOKENS</div>
                    <div className="text-xs opacity-70">Klaim 10.000 Tokens</div>
                  </div>
                </Button>

                <Button onClick={() => handleCategorySelect("skills")} disabled={character.klaim <= 0} className="w-full h-14 text-base font-display justify-start gap-3 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30" variant="ghost">
                  <Sparkles className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold">SKILL</div>
                    <div className="text-xs opacity-70">Cari & klaim skill</div>
                  </div>
                </Button>

                <Button onClick={() => handleCategorySelect("items")} disabled={character.klaim <= 0} className="w-full h-14 text-base font-display justify-start gap-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30" variant="ghost">
                  <Package className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold">ITEM</div>
                    <div className="text-xs opacity-70">Cari & klaim item</div>
                  </div>
                </Button>
              </div>

              <Button onClick={reset} variant="ghost" className="w-full text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
            </motion.div>
          )}

          {/* STEP 3: Search */}
          {step === "search" && character && (
            <motion.div key="search" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="flex items-center gap-2 text-accent">
                <Search className="w-5 h-5" />
                <span className="font-display text-sm font-semibold tracking-wider">
                  CARI {selectedCategory === "skills" ? "SKILL" : "ITEM"}
                </span>
              </div>

              <div className="relative">
                <Input
                  placeholder={`Ketik nama ${selectedCategory === "skills" ? "skill" : "item"}...`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchItems(e.target.value, selectedCategory as "items" | "skills");
                  }}
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground h-12 pr-10"
                />
                {searchLoading && <Loader2 className="absolute right-3 top-3.5 w-5 h-5 animate-spin text-muted-foreground" />}
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
                {searchResults.map((item) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => claimItem(item)}
                    disabled={loading}
                    className="w-full text-left glass-card rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-semibold text-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground">Lv.{item.level}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ID: {item.skill_id || item.item_id}
                    </div>
                  </motion.button>
                ))}
                {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">Tidak ditemukan</p>
                )}
              </div>

              <Button onClick={() => { setStep("choose"); setSearchResults([]); setSearchQuery(""); }} variant="ghost" className="w-full text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Result Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className={`font-display text-xl ${dialogType === "success" ? "text-accent" : dialogType === "error" ? "text-destructive" : "text-primary"}`}>
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              {dialogMsg}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setDialogOpen(false)} className="w-full mt-2 font-display">
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Panel;
