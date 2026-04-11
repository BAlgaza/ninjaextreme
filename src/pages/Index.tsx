import { motion } from "framer-motion";
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
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import FeatureCard from "@/components/FeatureCard";

const features = [
  { icon: Coins, title: "UP TO 70K TOKENS", description: "Dapatkan 10.000 Tokens gratis saat pertama bermain, dan klaim hingga 60.000 Tokens tambahan melalui Welcome Event. Modal awal melimpah!", highlight: true },
  { icon: Shield, title: "FREE EMBLEM UPGRADE", description: "Upgrade ke Emblem secara gratis dan unlock kekuatan 3 Element sekaligus. Dominasi pertarungan dengan kombinasi jutsu yang mematikan." },
  { icon: Zap, title: "EASY LEVELING", description: "Exp berlipat ganda di setiap misi! Naik level lebih cepat tanpa grinding berlebihan. Langsung menuju endgame content." },
  { icon: Star, title: "BONUS EXP EUDMON & HUNTING", description: "Farming di Eudmon dan Hunting House jadi jauh lebih mudah dan rewarding. Kumpulkan resource tanpa lelah." },
  { icon: Sparkles, title: "RARE SKILL DEALS", description: "Skill-skill langka yang sulit didapat kini tersedia di Event Deals dan shop spesial. Bangun build impianmu dengan mudah." },
  { icon: Swords, title: "CLAN BATTLE — ON!", description: "Adu strategi bersama klanmu! Clan Battle aktif dan siap menguji kekompakan timmu dalam pertempuran epik." },
  { icon: Users, title: "CREW BATTLE — ON!", description: "Bentuk crew terkuat dan buktikan dominasimu di arena Crew Battle. Siapa yang paling tangguh?" },
  { icon: Construction, title: "SERVER PVP (COMING SOON)", description: "Mode PvP server sedang dalam pengembangan. Bersiaplah untuk adu skill melawan ninja lain dari seluruh server!", highlight: false },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center">
        {/* BG Image */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="relative z-10 container text-center px-4 py-20">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-display tracking-widest text-primary uppercase mb-6">
              Private Server — Ninja Saga
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-foreground text-glow leading-none"
          >
            NINJA'S
            <br />
            <span className="text-primary">EXTREME</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-6 max-w-xl text-lg md:text-xl text-muted-foreground font-medium leading-relaxed"
          >
            Rasakan sensasi bermain Ninja Saga yang <span className="text-foreground">lebih seru</span>, lebih <span className="text-primary">rewarding</span>, dan penuh <span className="text-accent">bonus eksklusif</span>. Server modifikasi terbaik yang dirancang untuk pengalaman ninja sejati.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://algaza.site/download/ne.apk"
              className="group inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 font-display text-sm font-bold tracking-wider text-primary-foreground uppercase glow-primary transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
            >
              <Download className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
              Download Android
            </a>
            <a
              href="https://algaza.site/download/wa.php"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-lg border border-border bg-card/60 backdrop-blur-sm px-8 py-4 font-display text-sm font-bold tracking-wider text-foreground uppercase transition-all hover:border-secondary/50 hover:bg-secondary/10 w-full sm:w-auto justify-center"
            >
              <MessageCircle className="h-5 w-5 text-secondary" />
              Join WhatsApp
            </a>
          </motion.div>

          {/* Scroll indicator */}
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

      {/* Features */}
      <section className="relative py-20 md:py-28">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-2xl md:text-4xl font-bold tracking-wide text-foreground">
              KENAPA <span className="text-primary">NINJA'S EXTREME</span>?
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-lg mx-auto">
              Fitur-fitur eksklusif yang bikin kamu gak mau balik ke server lain.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 max-w-3xl mx-auto">
            {features.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} delay={i * 0.07} highlight={f.highlight} />
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
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
              SIAP JADI NINJA TERKUAT?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-md mx-auto">
              Download sekarang, klaim token gratismu, dan mulai petualangan ninja yang gak ada duanya!
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://algaza.site/download/ne.apk"
                className="group inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 font-display text-sm font-bold tracking-wider text-primary-foreground uppercase transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
              >
                <Download className="h-5 w-5" />
                Download APK
              </a>
              <a
                href="https://algaza.site/download/wa.php"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-lg border border-secondary/40 bg-secondary/10 px-8 py-4 font-display text-sm font-bold tracking-wider text-secondary uppercase transition-all hover:bg-secondary/20 w-full sm:w-auto justify-center"
              >
                <MessageCircle className="h-5 w-5" />
                Group WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container px-4 text-center">
          <p className="font-display text-xs tracking-widest text-muted-foreground uppercase">
            © 2026 Ninja's Extreme — All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
