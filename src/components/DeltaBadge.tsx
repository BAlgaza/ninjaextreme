import { AnimatePresence, motion } from "framer-motion";
import type { DeltaInfo } from "@/hooks/useDeltaTracker";

interface Props {
  info: DeltaInfo;
  className?: string;
  compact?: boolean;
}

const fmt = (n: number) => {
  const sign = n > 0 ? "+" : n < 0 ? "" : "";
  return `${sign}${new Intl.NumberFormat("en-US").format(n)}`;
};

const DeltaBadge = ({ info, className = "", compact }: Props) => {
  const total = info?.total ?? 0;
  const recent = info?.recent;
  const totalColor = total > 0 ? "text-emerald-400" : total < 0 ? "text-destructive" : "text-muted-foreground/60";

  return (
    <span className={`inline-flex items-center gap-1 align-middle ${className}`}>
      {total !== 0 && (
        <span className={`text-[9px] font-mono leading-none ${totalColor}`}>
          ({fmt(total)})
        </span>
      )}
      <AnimatePresence>
        {recent && (
          <motion.span
            key={recent.ts}
            initial={{ opacity: 0, y: -4, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.35 }}
            className={`${compact ? "text-[9px]" : "text-[10px]"} font-display font-bold leading-none px-1 py-0.5 rounded ${
              recent.value > 0
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-destructive/20 text-destructive border border-destructive/40"
            }`}
          >
            {fmt(recent.value)}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

export default DeltaBadge;
