import { useState, useEffect } from "react";
import { Clock, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const server = new Date(utc + 8 * 3600000);
      setTime(
        server.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
          " (UTC+8)"
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="border-t border-border/50 py-8">
      <div className="container px-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-display text-xs tracking-wider">
              {t("footer_server_time")}: <span className="text-foreground font-semibold">{time}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="font-display text-xs tracking-wider">
              {t("footer_address")}
            </span>
          </div>
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
