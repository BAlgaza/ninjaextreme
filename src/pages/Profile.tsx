import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSession, rankNames, genderLabel } from "@/hooks/useSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  User, Coins, Swords, Shield, Star, Crown, Wind, Flame, Zap, Droplets, Mountain,
  Sparkles, LogOut, Trophy, Heart, Loader2, AlertCircle,
} from "lucide-react";

const formatNumber = (n: number) => n.toLocaleString();

const elementInfo: Record<number, { icon: typeof Wind; label: string; color: string }> = {
  1: { icon: Wind, label: "Wind", color: "text-emerald-400" },
  2: { icon: Flame, label: "Fire", color: "text-orange-400" },
  3: { icon: Zap, label: "Lightning", color: "text-yellow-400" },
  4: { icon: Droplets, label: "Water", color: "text-blue-400" },
  5: { icon: Mountain, label: "Earth", color: "text-amber-600" },
};

const Profile = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { loading, data, error, logout } = useSession();

  useEffect(() => {
    document.title = `${lang === "id" ? "Profil" : "Profile"} — Ninja's Extreme`;
  }, [lang]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card max-w-sm w-full text-center">
            <CardContent className="p-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="font-display text-xl text-foreground">
                {error || (lang === "id" ? "Sesi tidak ditemukan" : "Session not found")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {lang === "id"
                  ? "Login hanya bisa dilakukan dari dalam game."
                  : "Login can only be done from within the game."}
              </p>
              <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
                {lang === "id" ? "Kembali ke Beranda" : "Back to Home"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const { user, characters, donatur, donatur_nom } = data;

  const isDoubleXpActive = (expireAt: string | null) => {
    if (!expireAt) return false;
    return new Date(expireAt) > new Date();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container max-w-2xl mx-auto space-y-6">
        {/* User Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-xl text-primary flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {user.username}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {donatur && (
                    <Badge className="bg-accent text-accent-foreground gap-1">
                      <Crown className="w-3 h-3" />
                      Donatur
                    </Badge>
                  )}
                  <Button size="sm" variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Coins className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tokens</p>
                    <p className="text-sm font-bold text-foreground">{formatNumber(user.tokens)}</p>
                  </div>
                </div>
                {donatur && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {lang === "id" ? "Total Donasi" : "Total Donated"}
                      </p>
                      <p className="text-sm font-bold text-foreground">Rp {formatNumber(donatur_nom)}</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === "id" ? "Bergabung" : "Joined"}: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Characters */}
        <div className="space-y-4">
          <h2 className="font-display text-lg text-foreground flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            {lang === "id" ? "Karakter" : "Characters"}
            <Badge variant="secondary" className="text-xs">{characters.length}</Badge>
          </h2>

          {characters.map((char, idx) => {
            const els = [char.element_1, char.element_2, char.element_3].filter((e) => e > 0);
            const points = [
              { label: "Wind", value: char.point_wind, color: "text-emerald-400" },
              { label: "Fire", value: char.point_fire, color: "text-orange-400" },
              { label: "Lightning", value: char.point_lightning, color: "text-yellow-400" },
              { label: "Water", value: char.point_water, color: "text-blue-400" },
              { label: "Earth", value: char.point_earth, color: "text-amber-600" },
              { label: "Free", value: char.point_free, color: "text-muted-foreground" },
            ].filter((p) => p.value > 0);

            return (
              <motion.div key={char.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className="glass-card overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    {/* Name + Level + Rank + Gender */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-lg font-bold text-foreground">{char.name}</h3>
                        <Badge className="text-xs">Lv.{char.level}</Badge>
                        {rankNames[char.rank] && (
                          <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                            {rankNames[char.rank]}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {genderLabel(char.gender, lang)}
                        </Badge>
                      </div>
                      {isDoubleXpActive(char.double_xp_expire_at) && (
                        <Badge className="bg-secondary text-secondary-foreground text-xs gap-1 animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          {char.xp_bonus_rate}% XP
                        </Badge>
                      )}
                    </div>

                    {/* Elements */}
                    {els.length > 0 && (
                      <div className="flex items-center gap-2">
                        {els.map((el, i) => {
                          const info = elementInfo[el];
                          if (!info) return null;
                          const Icon = info.icon;
                          return (
                            <span key={i} className={`flex items-center gap-1 text-xs ${info.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                              {info.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-md bg-muted/50 text-center">
                        <Coins className="w-3.5 h-3.5 text-accent mx-auto mb-0.5" />
                        <p className="text-[10px] text-muted-foreground">Gold</p>
                        <p className="text-xs font-bold">{formatNumber(char.gold)}</p>
                      </div>
                      <div className="p-2 rounded-md bg-muted/50 text-center">
                        <Star className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                        <p className="text-[10px] text-muted-foreground">Prestige</p>
                        <p className="text-xs font-bold">{formatNumber(char.prestige)}</p>
                      </div>
                      <div className="p-2 rounded-md bg-muted/50 text-center">
                        <Shield className="w-3.5 h-3.5 text-secondary mx-auto mb-0.5" />
                        <p className="text-[10px] text-muted-foreground">SS</p>
                        <p className="text-xs font-bold">{formatNumber(char.ss)}</p>
                      </div>
                    </div>

                    {/* PvP */}
                    {char.pvp_played > 0 && (
                      <div className="flex items-center gap-3 text-xs">
                        <Trophy className="w-3.5 h-3.5 text-accent" />
                        <span className="text-muted-foreground">PvP:</span>
                        <span className="text-emerald-400">{char.pvp_won}W</span>
                        <span className="text-destructive">{char.pvp_lost}L</span>
                        <span className="text-accent">🏆 {char.pvp_trophy}</span>
                      </div>
                    )}

                    {/* Element Points */}
                    {points.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {points.map((p) => (
                          <span key={p.label} className={`text-xs ${p.color}`}>
                            {p.label}: {p.value}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Equipment */}
                    <div className="flex flex-wrap gap-1.5">
                      {char.equipment_weapon && <Badge variant="outline" className="text-[10px]">⚔️ {char.equipment_weapon}</Badge>}
                      {char.equipment_clothing && <Badge variant="outline" className="text-[10px]">👕 {char.equipment_clothing}</Badge>}
                      {char.equipment_back && <Badge variant="outline" className="text-[10px]">🎒 {char.equipment_back}</Badge>}
                      {char.equipment_accessory && <Badge variant="outline" className="text-[10px]">💍 {char.equipment_accessory}</Badge>}
                      {char.equipment_skills?.map((sk) => (
                        <Badge key={sk} variant="outline" className="text-[10px]">🔥 {sk}</Badge>
                      ))}
                    </div>

                    {/* Last Login */}
                    <p className="text-[10px] text-muted-foreground">
                      {lang === "id" ? "Terakhir login" : "Last login"}: {new Date(char.last_login).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Profile;
