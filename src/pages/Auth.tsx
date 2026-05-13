import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { setSession } from "@/hooks/useSession";
import { Loader2 } from "lucide-react";

const API_BASE = "https://play.kotagames.web.id/api";

const Auth = () => {
  const { sesi } = useParams<{ sesi: string }>();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Verifying session...");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!sesi) {
        navigate("/", { replace: true });
        return;
      }
      setSession(sesi);
      // Warm up: poll /me/ until it returns status:true (server propagation delay
      // sometimes makes the first call fail; we retry a few times so downstream
      // pages immediately see the user + admin/season state).
      for (let i = 0; i < 5; i++) {
        if (cancelled) return;
        try {
          const r = await fetch(`${API_BASE}/me/${sesi}`, { cache: "no-store" });
          const j = await r.json();
          if (j?.status) break;
        } catch { /* ignore */ }
        setMsg(`Verifying session... (${i + 1}/5)`);
        await new Promise((res) => setTimeout(res, 400));
      }
      if (!cancelled) navigate("/profile", { replace: true });
    };
    run();
    return () => { cancelled = true; };
  }, [sesi, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-24 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{msg}</p>
    </div>
  );
};

export default Auth;
