import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

type CardVariant = 'navy' | 'gold' | 'emerald' | 'danger';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  labelMr?: string;
  value: number | string;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  variant?: CardVariant;
  language?: string;
}

const variantStyles: Record<CardVariant, { border: string; iconBg: string; iconColor: string }> = {
  navy: {
    border: 'border-l-[#1e293b]',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
  },
  gold: {
    border: 'border-l-[#d4af37]',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
  },
  emerald: {
    border: 'border-l-[#059669]',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
  },
  danger: {
    border: 'border-l-red-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-700',
  },
};

export default function StatsCard({
  icon: Icon,
  label,
  labelMr,
  value,
  trend,
  variant = 'navy',
  language = 'en',
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200 border-l-4 ${styles.border} transition-all duration-250 hover:shadow-lg hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${styles.iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">
              {language === 'mr' && labelMr ? labelMr : label}
            </p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{trend.percentage}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
