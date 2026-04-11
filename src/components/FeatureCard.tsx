import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  highlight?: boolean;
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0, highlight = false }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`glass-card rounded-lg p-5 md:p-6 transition-all duration-300 hover:border-primary/50 group ${highlight ? "glow-primary border-primary/30" : ""}`}
  >
    <div className="flex items-start gap-4">
      <div className="rounded-lg bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-display text-sm md:text-base font-semibold tracking-wide text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

export default FeatureCard;
