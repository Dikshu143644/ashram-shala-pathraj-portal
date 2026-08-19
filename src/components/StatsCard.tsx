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
  navy: { accent: '#000000', icon: 'bg-[#F3F2EF] text-[#000000]', glow: 'bg-[#F3F2EF]' },
  gold: { accent: '#000000', icon: 'bg-[#F3F2EF] text-[#000000]', glow: 'bg-[#F3F2EF]' },
  emerald: { accent: '#059669', icon: 'bg-emerald-50 text-emerald-700', glow: 'bg-emerald-50' },
  danger: { accent: '#dc2626', icon: 'bg-red-50 text-red-600', glow: 'bg-red-50' },
};

export default function StatsCard({ icon: Icon, label, labelMr, value, trend, variant = 'navy', language = 'en' }: StatsCardProps) {
  const styles = variantStyles[variant];
  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} whileHover={{ y: -2 }} className="stat-card min-h-32 p-5 sm:p-6">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl ${styles.glow}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#6B6B6B]">{language === 'mr' && labelMr ? labelMr : label}</p>
          <p className="text-3xl font-semibold tracking-tight" style={{ color: styles.accent }}>{value}</p>
          {trend && <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>{trend.direction === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}<span>{trend.percentage}%</span></div>}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}><Icon className="h-6 w-6" /></div>
      </div>
    </motion.article>
  );
}
