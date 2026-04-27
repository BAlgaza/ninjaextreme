import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, RefreshCw, UserPlus, Copy, CheckCircle2 } from "lucide-react";
import bcrypt from "bcryptjs";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_URL = "https://play.kotagames.web.id/api/daftar";

const randomCaptcha = () => Math.floor(1000 + Math.random() * 9000).toString();

interface SuccessData {
  username: string;
  password: string;
  email: string;
  msg?: string;
}

const Register = () => {
  const { t } = useLanguage();

  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [email, setEmail] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState(randomCaptcha());
  const [showPwd, setShowPwd] = useState(false);
  const [showRePwd, setShowRePwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState<SuccessData | null>(null);

  useEffect(() => {
    document.title = t("reg_title") + " — Ninja's Extreme";
  }, [t]);

  const refreshCaptcha = () => {
    setCaptchaCode(randomCaptcha());
    setCaptchaInput("");
  };

  const captchaSvgBg = useMemo(
    () =>
      `repeating-linear-gradient(45deg, hsl(var(--muted)) 0 6px, hsl(var(--background)) 6px 12px)`,
    [],
  );

  const validate = (): string | null => {
    if (password !== repassword) return t("err_pass_not_match");
    if (captchaInput.trim() !== captchaCode) return t("err_captcha");
    if (!/^[a-zA-Z0-9_]{4,}$/.test(username)) return t("err_username");
    if (password.length < 6) return t("err_password");
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) return t("err_email");
    if (
      nama.trim().toLowerCase() === username.trim().toLowerCase() &&
      !/\d/.test(username)
    )
      return t("err_name_same");
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(null);

    const err = validate();
    if (err) {
      setErrorMsg(err);
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const payload = {
        nama: nama.trim(),
        username: username.trim(),
        password: hashedPassword,
        email: email.trim(),
      };

      const doFetch = async (url: string) =>
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

      let res: Response;
      try {
        res = await doFetch(API_URL);
      } catch {
        res = await doFetch(`https://corsproxy.io/?${encodeURIComponent(API_URL)}`);
      }

      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setErrorMsg(`HTTP ${res.status}`);
      } else if (data.code === 1) {
        setSuccess({
          username: payload.username,
          password,
          email: payload.email,
          msg: data.msg,
        });
      } else {
        setErrorMsg(data.msg || "Unknown error");
      }
    } catch {
      setErrorMsg(t("err_network"));
    } finally {
      setLoading(false);
      refreshCaptcha();
    }
  };

  const copyAll = () => {
    if (!success) return;
    const text = `Username: ${success.username}\nPassword: ${success.password}\nEmail: ${success.email}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <main className="min-h-screen pt-32 pb-16 px-4">
      <div className="container max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary tracking-wider">
            {t("reg_title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{t("reg_subtitle")}</p>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-xl border border-primary/40"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <h2 className="font-display text-lg text-primary">
                {t("reg_success_title")}
              </h2>
            </div>
            {success.msg && (
              <p className="text-sm text-muted-foreground mb-4">{success.msg}</p>
            )}
            <div className="bg-muted/40 rounded-lg p-4 space-y-2 font-mono text-sm">
              <div>
                <span className="text-muted-foreground">Username: </span>
                <span className="text-foreground break-all">{success.username}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Password: </span>
                <span className="text-foreground break-all">{success.password}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="text-foreground break-all">{success.email}</span>
              </div>
            </div>
            <p className="text-xs text-destructive mt-4">{t("reg_save_warning")}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={copyAll} variant="outline" className="flex-1 gap-2">
                <Copy className="w-4 h-4" /> Copy
              </Button>
              <Button
                onClick={() => {
                  setSuccess(null);
                  setNama(""); setUsername(""); setPassword(""); setRepassword(""); setEmail("");
                }}
                className="flex-1"
              >
                OK
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 rounded-xl border border-border space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="nama">{t("reg_name")}</Label>
              <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required maxLength={50} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">{t("reg_username")}</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required maxLength={30} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t("reg_password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={64}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? t("reg_hide") : t("reg_show")}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="repassword">{t("reg_repassword")}</Label>
              <div className="relative">
                <Input
                  id="repassword"
                  type={showRePwd ? "text" : "password"}
                  value={repassword}
                  onChange={(e) => setRepassword(e.target.value)}
                  required
                  maxLength={64}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRePwd(!showRePwd)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showRePwd ? t("reg_hide") : t("reg_show")}
                >
                  {showRePwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("reg_email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={100} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="captcha">{t("reg_captcha")}</Label>
              <div className="flex items-center gap-2">
                <div
                  className="px-4 h-10 flex items-center justify-center rounded-md font-mono text-lg font-bold tracking-[0.4em] text-primary border border-border select-none"
                  style={{ backgroundImage: captchaSvgBg }}
                >
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Refresh captcha"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <Input
                  id="captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                  maxLength={4}
                  inputMode="numeric"
                  className="flex-1"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-md p-3">
                {errorMsg}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-11 font-display tracking-wider gap-2 glow-primary">
              <UserPlus className="w-4 h-4" />
              {loading ? t("reg_loading") : t("reg_submit")}
            </Button>

            <p className="text-xs text-center text-muted-foreground">{t("reg_have_account")}</p>
          </motion.form>
        )}
      </div>
    </main>
  );
};

export default Register;
