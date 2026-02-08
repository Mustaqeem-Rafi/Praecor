import React from 'react';
import clsx from 'clsx';
import { SimulationStatus } from '../hooks/useVitalSimulator';
import { Info, AlertTriangle, AlertOctagon } from 'lucide-react';

interface ShowcaseNarratorProps {
    status: SimulationStatus;
    trend: number;
}

export const ShowcaseNarrator: React.FC<ShowcaseNarratorProps> = ({ status, trend }) => {
    return (
        <div className={clsx(
            "w-full rounded-2xl p-6 mb-8 border-l-8 shadow-sm transition-all duration-300",
            status === 'NORMAL' && "bg-slate-50 border-slate-400 text-slate-600",
            status === 'DRIFT_WARNING' && "bg-amber-50 border-amber-500 text-amber-800",
            status === 'CRITICAL_FAILURE' && "bg-red-50 border-red-600 text-red-900"
        )}>
            <div className="flex items-start gap-4">
                <div className={clsx(
                    "p-2 rounded-full mt-1 shrink-0",
                    status === 'NORMAL' && "bg-slate-200",
                    status === 'DRIFT_WARNING' && "bg-amber-100",
                    status === 'CRITICAL_FAILURE' && "bg-red-100"
                )}>
                    {status === 'NORMAL' && <Info className="w-6 h-6 text-slate-500" />}
                    {status === 'DRIFT_WARNING' && <AlertTriangle className="w-6 h-6 text-amber-600 animate-pulse" />}
                    {status === 'CRITICAL_FAILURE' && <AlertOctagon className="w-6 h-6 text-red-600 animate-bounce" />}
                </div>

                <div className="flex flex-col">
                    <h3 className="text-lg font-bold uppercase tracking-wide">
                        {status === 'NORMAL' && "System Status: Nominal"}
                        {status === 'DRIFT_WARNING' && "⚠️ AI Insight: Silent Deterioration Detected"}
                        {status === 'CRITICAL_FAILURE' && "🚨 CRITICAL EVENT: Reactive Failure"}
                    </h3>

                    <p className="mt-1 text-md leading-relaxed font-medium opacity-90">
                        {status === 'NORMAL' && (
                            "Patient is currently stable. Both the Standard Monitor and AI Predictive Engine show safe levels. No intervention required."
                        )}
                        {status === 'DRIFT_WARNING' && (
                            <span>
                                <strong>Look at the difference.</strong> The Predictive Engine (Right) has detected a <span className="p-0.5 bg-amber-200 rounded">+{trend.toFixed(1)} trend</span>.
                                Crucially, the Standard Monitor (Left) is <em>still Green</em> because the absolute rate hasn't hit 100 yet. <strong>This is the gap where lives are lost.</strong>
                            </span>
                        )}
                        {status === 'CRITICAL_FAILURE' && (
                            <span>
                                <strong>Too late.</strong> The patient has now crashed (100+ BPM). The Standard Monitor finally alerts, but we lost valuable time.
                                With Praecor, clinicians would have been warned 15 seconds ago.
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};
