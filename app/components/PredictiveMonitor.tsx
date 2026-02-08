'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, YAxis, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';
import { Activity, TrendingUp, ShieldCheck, AlertOctagon } from 'lucide-react';
import clsx from 'clsx';
import { VitalData } from '../hooks/useVitalSimulator';

interface PredictiveMonitorProps {
    history: VitalData[];
    currentHR: number;
    analysis: {
        slope: number;
        isDrifting: boolean;
        status: 'NORMAL' | 'DRIFT_WARNING' | 'CRITICAL_FAILURE';
    };
}

export const PredictiveMonitor: React.FC<PredictiveMonitorProps> = ({ history, currentHR, analysis }) => {
    // Logic: Analysis is now passed down from the centralized hook
    const { isDrifting, slope } = analysis;
    const isCritical = currentHR >= 100;

    // Visual State:
    // Green = Stable
    // Amber = Drifting (Warning)
    // Red = Critical (Late stage)

    let statusColor = "emerald";
    let statusText = "STABLE PREDICTION";
    let Icon = ShieldCheck;

    if (isCritical) {
        statusColor = "red";
        statusText = "CRITICAL FAILURE";
        Icon = AlertOctagon;
    } else if (isDrifting) {
        statusColor = "amber";
        statusText = "DRIFT DETECTED";
        Icon = TrendingUp;
    }

    return (
        <div className={clsx(
            "relative flex flex-col p-8 rounded-[2rem] border transition-all duration-500 h-96 overflow-hidden",
            // Glassmorphism base
            isCritical
                ? "bg-red-600 border-red-500 shadow-red-900/50 text-white"
                : "bg-white/90 backdrop-blur-xl shadow-2xl border-teal-100 shadow-teal-100/50",
            !isCritical && isDrifting && "border-orange-200 shadow-orange-200/50"
        )}>
            {/* Subtle Gradient background blob */}
            <div className={clsx(
                "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000",
                isCritical ? "bg-red-900" : isDrifting ? "bg-orange-400" : "bg-teal-400"
            )}></div>

            {/* Header */}
            <div className="w-full flex justify-between items-start mb-6 z-10">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={clsx("w-2 h-2 rounded-full", isCritical ? "bg-white" : "bg-teal-50")}></div>
                        <h2 className={clsx("text-sm font-bold uppercase tracking-widest", isCritical ? "text-red-100" : "text-slate-400")}>
                            Praecor AI
                        </h2>
                    </div>
                    <div className={clsx("text-3xl font-bold tracking-tight flex items-baseline gap-2", isCritical ? "text-white" : "text-slate-800")}>
                        {Math.floor(currentHR)}
                        <span className={clsx("text-sm font-medium", isCritical ? "text-red-100" : "text-slate-400")}>BPM</span>
                    </div>
                </div>

                <div className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border transition-all duration-300",
                    isCritical
                        ? "bg-red-700 text-white border-red-500"
                        : isDrifting
                            ? "bg-orange-50 text-orange-600 border-orange-100"
                            : "bg-teal-50 text-teal-600 border-teal-100"
                )}>
                    <Icon className="w-4 h-4" />
                    {statusText}
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                        <defs>
                            <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isCritical ? "#ffffff" : isDrifting ? "#f97316" : "#14b8a6"} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={isCritical ? "#ffffff" : isDrifting ? "#f97316" : "#14b8a6"} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <YAxis domain={[60, 110]} hide />

                        <ReferenceLine y={100} stroke={isCritical ? "rgba(255,255,255,0.5)" : "#cbd5e1"} strokeDasharray="3 3" />

                        <Line
                            type="monotone"
                            dataKey="heartRate"
                            stroke={isCritical ? "#ffffff" : isDrifting ? "#f97316" : "#14b8a6"}
                            strokeWidth={4}
                            dot={false}
                            isAnimationActive={false}
                            fill="url(#colorHr)"
                        />
                    </LineChart>
                </ResponsiveContainer>

                {/* Overlay Alert for Drift - Modern Toast Style */}
                {isDrifting && !isCritical && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md border border-orange-100 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(249,115,22,0.3)] flex items-center gap-4 animate-[fade-in-up_0.5s_ease-out]">
                        <div className="p-3 bg-orange-100/50 rounded-xl text-orange-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-slate-800 font-bold text-sm">Predictive Alert</p>
                            <p className="text-slate-500 text-xs mt-0.5">abnormal rising trend detected</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Details */}
            <div className={clsx("mt-2 flex justify-between items-center text-xs font-medium border-t pt-4 z-10", isCritical ? "border-red-500/30 text-red-100" : "border-slate-100 text-slate-400")}>
                <div className="flex gap-4">
                    <span>Confidence: 98%</span>
                    <span>Window: 10s</span>
                </div>
                <div>Risk Trend: {analysis.slope > 0 ? "+" : ""}{analysis.slope.toFixed(2)}</div>
            </div>
        </div>
    );
};
