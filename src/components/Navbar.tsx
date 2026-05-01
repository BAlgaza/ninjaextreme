import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, Download, Monitor, Smartphone, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { getSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const DOWNLOAD_LINK = "https://drive.google.com/drive/mobile/folders/1RqCSzcesOLWkJ72-jIKmUffc6u6WPFXa";

const Navbar = () => {
  const { t, lang, setLang } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const isLoggedIn = !!getSession();

  const links = [
    { to: "/", label: t("nav_home") },
    { to: "/register", label: t("nav_register") },
    { to: "/voucher", label: t("nav_voucher") },
    { to: "/clans", label: t("nav_clans") },
    { to: "/statistik", label: t("nav_stats") },
    { to: "/donatur", label: t("nav_donatur") },
    ...(isLoggedIn ? [{ to: "/profile", label: lang === "id" ? "Profil" : "Profile" }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;
  const toggleLang = () => setLang(lang === "en" ? "id" : "en");

  return (
    <>
      <nav className="fixed top-7 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/" className="font-display text-lg font-bold text-primary tracking-wider">
            NE
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 rounded-md font-display text-xs tracking-wider transition-colors ${
                  isActive(l.to)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {l.to === "/profile" && <User className="w-3 h-3 inline mr-1" />}
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => setDownloadOpen(true)}
              className="px-3 py-1.5 rounded-md font-display text-xs tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              {t("nav_download")}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-display text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang.toUpperCase()}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 overflow-hidden"
            >
              <div className="flex flex-col px-4 py-2 gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className={`px-3 py-2 rounded-md font-display text-sm tracking-wider transition-colors ${
                      isActive(l.to)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {l.to === "/profile" && <User className="w-4 h-4 inline mr-1" />}
                    {l.label}
                  </Link>
                ))}
                <button
                  onClick={() => { setDownloadOpen(true); setMenuOpen(false); }}
                  className="px-3 py-2 rounded-md font-display text-sm tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t("nav_download")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent className="glass-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary flex items-center gap-2">
              <Download className="w-5 h-5" />
              {t("download_title")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("download_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <a href={DOWNLOAD_LINK} target="_blank" rel="noopener noreferrer" className="w-full block">
              <Button className="w-full h-12 font-display text-base glow-primary gap-2">
                <Smartphone className="w-5 h-5" />
                {t("download_android")}
              </Button>
            </a>
            <a href={DOWNLOAD_LINK} target="_blank" rel="noopener noreferrer" className="w-full block">
              <Button variant="outline" className="w-full h-12 font-display text-base gap-2 border-border hover:bg-muted">
                <Monitor className="w-5 h-5" />
                {t("download_windows")}
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
