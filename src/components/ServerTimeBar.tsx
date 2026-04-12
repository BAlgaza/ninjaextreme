import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const ServerTimeBar = () => {
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
    <div className="fixed top-0 left-0 right-0 z-[60] bg-muted/80 backdrop-blur-sm border-b border-border/30">
      <div className="container flex items-center justify-center h-7 px-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3 text-primary" />
          <span className="font-display tracking-wider">
            {t("server_time")}: <span className="text-foreground font-semibold">{time}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServerTimeBar;
