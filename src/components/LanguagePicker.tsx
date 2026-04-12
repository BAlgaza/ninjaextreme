import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";

const LanguagePicker = () => {
  const { showPicker, setShowPicker, setLang, t } = useLanguage();

  const pick = (lang: "en" | "id") => {
    setLang(lang);
    setShowPicker(false);
  };

  return (
    <Dialog open={showPicker} onOpenChange={setShowPicker}>
      <DialogContent className="glass-card border-border max-w-xs">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t("lang_title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t("lang_desc")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-2">
          <Button onClick={() => pick("id")} className="flex-1 h-14 font-display text-base" variant="outline">
            🇮🇩 Indonesia
          </Button>
          <Button onClick={() => pick("en")} className="flex-1 h-14 font-display text-base" variant="outline">
            🇬🇧 English
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguagePicker;
