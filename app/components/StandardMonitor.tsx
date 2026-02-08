import React from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

interface StandardMonitorProps {
    heartRate: number;
}

export const StandardMonitor: React.FC<StandardMonitorProps> = ({ heartRate }) => {
    const isCritical = heartRate >= 100;

    return (
        <div className={clsx(
            "relative flex flex-col items-center justify-between p-8 rounded-xl border-4 transition-all duration-300 h-96 shadow-2xl overflow-hidden",
            isCritical
                ? "bg-red-950 border-red-800 shadow-red-900/50"
                : "bg-slate-900 border-slate-700 shadow-slate-900/50"
        )}>
            {/* Heavy Industrial Header */}
            <div className="w-full flex justify-between items-center border-b-2 border-slate-700 pb-4 mb-4 z-10">
                <h2 className="text-xl font-bold text-slate-400 font-mono tracking-widest uppercase">
                    VITALS_MON_V1
                </h2>
                <div className={clsx("w-4 h-4 rounded-full animate-pulse", isCritical ? "bg-red-500 shadow-[0_0_10px_red]" : "bg-green-500 shadow-[0_0_10px_green]")}></div>
            </div>

            {/* Retro Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(slate-800 1px, transparent 1px), linear-gradient(90deg, slate-800 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Main Digital Display */}
            <div className="flex-1 flex flex-col items-center justify-center z-10">
                <div className={clsx(
                    "text-9xl font-mono font-black tracking-widest transition-colors duration-100",
                    isCritical ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" : "text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                )}>
                    {Math.floor(heartRate).toString().padStart(3, '0')}
                </div>
                <div className="text-xl text-slate-500 mt-2 font-mono uppercase tracking-widest">Beats Per Minute</div>
            </div>

            {/* Old School Status Bar */}
            <div className={clsx(
                "w-full py-3 text-center rounded-sm text-lg font-mono font-bold border-2 tracking-widest uppercase z-10",
                isCritical ? "bg-red-900 text-red-100 border-red-700" : "bg-slate-800 text-slate-400 border-slate-600"
            )}>
                {isCritical ? "!!! CRITICAL !!!" : "SYSTEM: OK"}
            </div>
        </div>
    );
};
