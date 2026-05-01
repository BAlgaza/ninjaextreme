import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { setSession } from "@/hooks/useSession";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const { sesi } = useParams<{ sesi: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (sesi) {
      setSession(sesi);
    }
    navigate("/profile", { replace: true });
  }, [sesi, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default Auth;
