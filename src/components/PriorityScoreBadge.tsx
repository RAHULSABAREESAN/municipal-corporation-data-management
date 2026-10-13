import React, { useState } from 'react';
import { PriorityBreakdown } from '../types';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface Props {
  score: number;
  breakdown?: PriorityBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const PriorityScoreBadge: React.FC<Props> = ({
  score,
  breakdown,
  size = 'md',
  showDetails = false,
}) => {
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  let badgeClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let badgeLabel = 'Low Recurrence';

  if (score >= 85) {
    badgeClasses = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
    badgeLabel = 'Critical Recurrence';
  } else if (score >= 70) {
    badgeClasses = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
    badgeLabel = 'High Recurrence';
  } else if (score >= 50) {
    badgeClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium';
    badgeLabel = 'Moderate';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-bold',
  };

  return (
    <div className="relative inline-flex flex-col gap-1">
      <div
        className={`inline-flex items-center gap-1.5 rounded-md border ${badgeClasses} ${sizeClasses[size]} transition`}
        onMouseEnter={() => setShowFormulaTooltip(true)}
        onMouseLeave={() => setShowFormulaTooltip(false)}
      >
        {score >= 80 && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
        <span className="tabular-nums font-semibold tracking-tight">{score}/100</span>
        <span className="text-[11px] opacity-80 hidden sm:inline font-normal">({badgeLabel})</span>
      </div>

      {(showDetails || showFormulaTooltip) && breakdown && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-72 bg-white rounded-lg p-3 border border-gray-200 shadow-xl text-gray-700 text-xs space-y-2 pointer-events-none sm:pointer-events-auto">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 font-semibold text-gray-900">
            <span className="flex items-center gap-1 text-[11px]">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              Recurrence Priority Formula
            </span>
            <span className="text-[11px] font-mono text-indigo-600 tabular-nums font-bold">
              Total: {breakdown.total}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="bg-gray-50 p-1.5 rounded border border-gray-100 flex items-center justify-between">
              <span className="text-gray-500">Recurrence:</span>
              <span className="text-emerald-700 font-semibold tabular-nums">+{breakdown.recurrencePoints}</span>
            </div>
            <div className="bg-gray-50 p-1.5 rounded border border-gray-100 flex items-center justify-between">
              <span className="text-gray-500">Severity:</span>
              <span className="text-amber-700 font-semibold tabular-nums">+{breakdown.severityPoints}</span>
            </div>
            <div className="bg-gray-50 p-1.5 rounded border border-gray-100 flex items-center justify-between">
              <span className="text-gray-500">Duration:</span>
              <span className="text-blue-700 font-semibold tabular-nums">+{breakdown.durationPoints}</span>
            </div>
            <div className="bg-gray-50 p-1.5 rounded border border-gray-100 flex items-center justify-between">
              <span className="text-gray-500">Relapse:</span>
              <span className="text-rose-700 font-semibold tabular-nums">+{breakdown.vulnerabilityModifier}</span>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 leading-relaxed italic border-t border-gray-100 pt-1.5">
            {breakdown.rationale}
          </p>
        </div>
      )}
    </div>
  );
};
