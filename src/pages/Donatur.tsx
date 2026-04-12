import { motion } from "framer-motion";
import { Heart, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
  </svg>
);

const Donatur = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pt-[calc(1.75rem+3.5rem+1rem)] pb-8 px-4">
      <div className="container max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Heart className="mx-auto w-10 h-10 text-destructive mb-3" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow">{t("donatur_title")}</h1>
          <p className="text-muted-foreground mt-1">{t("donatur_subtitle")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-6 md:p-8 space-y-5 text-center"
        >
          <p className="text-muted-foreground text-base leading-relaxed">{t("donatur_msg")}</p>
        </motion.div>

        {/* Join Community */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 glass-card rounded-2xl p-6 md:p-8 space-y-5 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-accent">
            <Users className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold tracking-wider">{t("donatur_join_community")}</h2>
          </div>
          <p className="text-muted-foreground text-sm">{t("donatur_join_desc")}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://chat.whatsapp.com/KGeNuqoy0oxCqeHVBWbtEn?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="h-12 px-6 font-display text-sm gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground w-full sm:w-auto">
                <MessageCircle className="w-5 h-5" />
                {t("donatur_wa")}
              </Button>
            </a>
            <a
              href="https://discord.gg/zWBcCPYAj"
              target="_blank"
              rel="noopener noreferrer"
            >
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
          transition={{ delay: 0.35 }}
          className="mt-8"
        >
          <h2 className="font-display text-xl font-bold text-foreground text-center mb-4 flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            {t("donatur_list_title")}
          </h2>
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-muted-foreground text-sm">{t("donatur_empty")}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Donatur;
