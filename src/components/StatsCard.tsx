import { type LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

type CardVariant = 'navy' | 'gold' | 'emerald' | 'danger';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  labelMr?: string;
  value: number | string;
  trend?: { direction: 'up' | 'down'; percentage: number };
  variant?: CardVariant;
  language?: string;
}

const variantStyles: Record<CardVariant, { accent: string; icon: string; glow: string }> = {
  navy: { accent: '#545f73', icon: 'bg-[#d5e0f8]/70 text-[#3c475a]', glow: 'bg-[#d5e0f8]/45' },
  gold: { accent: '#735c00', icon: 'bg-[#ffe088]/55 text-[#735c00]', glow: 'bg-[#ffe088]/40' },
  emerald: { accent: '#006948', icon: 'bg-[#85f8c4]/35 text-[#006948]', glow: 'bg-[#85f8c4]/40' },
  danger: { accent: '#ba1a1a', icon: 'bg-[#ffdad6]/65 text-[#ba1a1a]', glow: 'bg-[#ffdad6]/45' },
};

export default function StatsCard({ icon: Icon, label, labelMr, value, trend, variant = 'navy', language = 'en' }: StatsCardProps) {
  const styles = variantStyles[variant];
  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }} whileHover={{ y: -4 }} className="stat-card min-h-32 p-5 sm:p-6">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl ${styles.glow}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="font-label mb-3 text-[10px] text-[#545f73]">{language === 'mr' && labelMr ? labelMr : label}</p>
          <p className="font-display text-3xl font-bold tracking-tight" style={{ color: styles.accent }}>{value}</p>
          {trend && <div className={`mt-3 flex items-center gap-1 text-xs font-semibold ${trend.direction === 'up' ? 'text-[#006948]' : 'text-[#ba1a1a]'}`}>{trend.direction === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}<span>{trend.percentage}%</span></div>}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}><Icon className="h-6 w-6" /></div>
      </div>
    </motion.article>
  );
}
