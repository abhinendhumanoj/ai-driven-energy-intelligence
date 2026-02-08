import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, subtitle }) => (
  <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-semibold mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {Icon ? <Icon size={18} className="text-emerald-500" /> : null}
    </div>
  </motion.div>
);

export default StatCard;
