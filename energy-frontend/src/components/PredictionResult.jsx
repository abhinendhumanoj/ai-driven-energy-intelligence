import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { toNumber } from '../utils/dataHelpers.js';

const confidenceMap = { HIGH: 90, MEDIUM: 70, LOW: 45 };

const PredictionResult = ({ prediction, lastActualConsumption }) => {
  if (!prediction) {
    return (
      <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-sm">
        <h3 className="text-base font-semibold mb-2">Prediction Result</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Generate prediction to view results.</p>
      </div>
    );
  }

  const consumption = toNumber(prediction.predicted_consumption);
  const bill = toNumber(prediction.predicted_bill);
  const isUp = consumption >= toNumber(lastActualConsumption);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111827] p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">Prediction Result</h3>
        <Sparkles size={16} className="text-emerald-500" />
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Predicted Consumption</p>
          <p className="text-xl font-semibold">{consumption.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Predicted Bill</p>
          <p className="text-xl font-semibold">₹{bill.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Confidence</p>
          <p className="text-xl font-semibold">{confidenceMap[prediction.confidence] || 60}%</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Trend</p>
          <p className="text-xl font-semibold inline-flex items-center gap-1">
            {isUp ? <ArrowUpRight className="text-emerald-500" size={18} /> : <ArrowDownRight className="text-amber-500" size={18} />}
            {isUp ? 'Up' : 'Down'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionResult;
