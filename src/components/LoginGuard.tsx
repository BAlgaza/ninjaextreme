import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "@/hooks/useSession";
import { useLanguage } from "@/i18n/LanguageContext";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = "https://play.kotagames.web.id/api";

interface Props {
  children: React.ReactNode;
}

const LoginGuard = ({ children }: Props) => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");

  useEffect(() => {
    const sesi = getSession();
    if (!sesi) {
      setStatus("fail");
      return;
    }
    fetch(`${API_BASE}/me/${sesi}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status) {
          setStatus("ok");
        } else {
          localStorage.removeItem("ne_session");
          setStatus("fail");
        }
      })
      .catch(() => setStatus("fail"));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "fail") {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <div className="glass-card max-w-sm w-full text-center p-8 rounded-xl border border-border space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="font-display text-xl text-foreground">
            {lang === "id" ? "Login Diperlukan" : "Login Required"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {lang === "id"
              ? "Halaman ini memerlukan login. Login hanya bisa dilakukan dari dalam game."
              : "This page requires login. Login can only be done from within the game."}
          </p>
          <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
            {lang === "id" ? "Kembali ke Beranda" : "Back to Home"}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoginGuard;
