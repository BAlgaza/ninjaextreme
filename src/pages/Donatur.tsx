import { motion } from "framer-motion";
import { Heart, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const Donatur = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pt-20 pb-8 px-4">
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
          <p className="text-foreground text-sm font-medium">{t("donatur_join")}</p>

          <a
            href="https://chat.whatsapp.com/KGeNuqoy0oxCqeHVBWbtEn?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="h-12 px-8 font-display text-base gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground">
              <MessageCircle className="w-5 h-5" />
              {t("donatur_wa")}
            </Button>
          </a>
        </motion.div>

        {/* Donor List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
