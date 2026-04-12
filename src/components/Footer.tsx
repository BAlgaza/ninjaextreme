import { MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border/50 py-8">
      <div className="container px-4 space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="font-display text-xs tracking-wider">
            {t("footer_address")}
          </span>
        </div>
        <p className="text-center font-display text-xs tracking-widest text-muted-foreground uppercase">
          {t("footer_copyright")} —{" "}
          <a
            href="https://instagram.com/om_bintangg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            AlgazaDev
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
