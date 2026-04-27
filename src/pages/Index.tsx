import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Download,
  MessageCircle,
  Coins,
  Shield,
  Zap,
  Swords,
  Users,
  Star,
  Sparkles,
  Trophy,
  Construction,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import FeatureCard from "@/components/FeatureCard";
import { useLanguage } from "@/i18n/LanguageContext";

const DOWNLOAD_LINK = "https://drive.google.com/drive/mobile/folders/1RqCSzcesOLWkJ72-jIKmUffc6u6WPFXa";
const WHATSAPP_LINK = "https://chat.whatsapp.com/KGeNuqoy0oxCqeHVBWbtEn?mode=gi_t";
const DISCORD_LINK = "https://discord.gg/zWBcCPYAj";

const Index = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Coins, title: t("feat_tokens_title"), description: t("feat_tokens_desc"), highlight: true },
    { icon: Shield, title: t("feat_emblem_title"), description: t("feat_emblem_desc") },
    { icon: Zap, title: t("feat_level_title"), description: t("feat_level_desc") },
    { icon: Star, title: t("feat_eudmon_title"), description: t("feat_eudmon_desc") },
    { icon: Sparkles, title: t("feat_skill_title"), description: t("feat_skill_desc") },
    { icon: Swords, title: t("feat_clan_title"), description: t("feat_clan_desc") },
    { icon: Users, title: t("feat_crew_title"), description: t("feat_crew_desc") },
    { icon: Construction, title: t("feat_pvp_title"), description: t("feat_pvp_desc"), highlight: false },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="relative z-10 container text-center px-4 py-20">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-display tracking-widest text-primary uppercase mb-6">
              {t("home_badge")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-foreground text-glow leading-none"
          >
            {t("home_title_1")}
            <br />
            <span className="text-primary">{t("home_title_2")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-6 max-w-xl text-lg md:text-xl text-muted-foreground font-medium leading-relaxed"
          >
            {t("home_tagline_1")} <span className="text-foreground">{t("home_tagline_more")}</span>
            {t("home_tagline_2")} <span className="text-primary">{t("home_tagline_rewarding")}</span>
            {t("home_tagline_3")} <span className="text-accent">{t("home_tagline_bonus")}</span>
            {t("home_tagline_4")}
          </motion.p>

          {/* Primary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 font-display text-sm font-bold tracking-wider text-primary-foreground uppercase glow-primary transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
            >
              <UserPlus className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
              {t("home_register_now")}
            </Link>
            <a
              href={DOWNLOAD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-lg border border-border bg-card/60 backdrop-blur-sm px-8 py-4 font-display text-sm font-bold tracking-wider text-foreground uppercase transition-all hover:border-primary/50 hover:bg-primary/10 w-full sm:w-auto justify-center"
            >
              <Download className="h-5 w-5 text-primary" />
              {t("nav_download")}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 animate-bounce"
          >
            <div className="mx-auto h-8 w-5 rounded-full border-2 border-muted-foreground/40 flex items-start justify-center pt-1.5">
              <div className="h-1.5 w-1 rounded-full bg-muted-foreground/60" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Register + Community */}
      <section className="relative py-16 md:py-20">
        <div className="container px-4 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Register card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card glow-primary rounded-2xl p-7 flex flex-col"
          >
            <UserPlus className="h-10 w-10 text-primary mb-3" />
            <h3 className="font-display text-xl font-bold text-foreground tracking-wide">
              {t("home_register_now")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground flex-1">{t("home_register_desc")}</p>
            <Link
              to="/register"
              className="mt-5 group inline-flex items-center justify-between gap-2 rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold tracking-wider text-primary-foreground uppercase transition-transform hover:scale-[1.02] active:scale-95"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {t("home_register_btn")}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Community card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-7 border-secondary/30 flex flex-col"
          >
            <Users className="h-10 w-10 text-secondary mb-3" />
            <h3 className="font-display text-xl font-bold text-foreground tracking-wide">
              {t("home_join_community")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground flex-1">{t("home_join_desc")}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-secondary/40 bg-secondary/10 px-3 py-3 font-display text-xs font-bold tracking-wider text-secondary uppercase transition-all hover:bg-secondary/20"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={DISCORD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-3 font-display text-xs font-bold tracking-wider text-primary uppercase transition-all hover:bg-primary/20"
              >
                <MessageCircle className="h-4 w-4" />
                Discord
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 md:py-28">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-2xl md:text-4xl font-bold tracking-wide text-foreground">
              {t("home_features_title_1")} <span className="text-primary">{t("home_features_title_2")}</span>?
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-lg mx-auto">
              {t("home_features_subtitle")}
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 max-w-3xl mx-auto">
            {features.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} delay={i * 0.07} highlight={f.highlight} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card glow-primary rounded-2xl p-8 md:p-14 text-center max-w-2xl mx-auto"
          >
            <Trophy className="mx-auto h-12 w-12 text-accent mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-wide">
              {t("home_cta_title")}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-md mx-auto">
              {t("home_cta_desc")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 font-display text-sm font-bold tracking-wider text-primary-foreground uppercase transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
              >
                <UserPlus className="h-5 w-5" />
                {t("home_register_btn")}
              </Link>
              <a
                href={DOWNLOAD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-lg border border-secondary/40 bg-secondary/10 px-8 py-4 font-display text-sm font-bold tracking-wider text-secondary uppercase transition-all hover:bg-secondary/20 w-full sm:w-auto justify-center"
              >
                <Download className="h-5 w-5" />
                {t("nav_download")}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
