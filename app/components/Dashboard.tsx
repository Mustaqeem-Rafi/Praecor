'use client';

import React from 'react';
import { useVitalSimulator } from '../hooks/useVitalSimulator';
import { StandardMonitor } from './StandardMonitor';
import { PredictiveMonitor } from './PredictiveMonitor';
import { ShowcaseNarrator } from './ShowcaseNarrator';
import { Play, RotateCcw, Activity } from 'lucide-react';

export default function Dashboard() {
    const {
        currentHR,
        history,
        isRunning,
        setIsRunning,
        scenario,
        setScenario,
        reset,
        analysis
    } = useVitalSimulator();

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-8">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-600 rounded-xl text-white shadow-lg shadow-teal-200">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-none">Praecor Prototype</h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">Detecting the Invisible</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                    <select
                        className="bg-white border text-slate-700 font-bold border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={scenario}
                        onChange={(e) => {
                            setScenario(e.target.value as 'A' | 'B');
                            reset();
                        }}
                    >
                        <option value="A">Scenario A: Stable Patient</option>
                        <option value="B">Scenario B: Sepsis Onset (Drift)</option>
                    </select>

                    <div className="w-px h-8 bg-slate-300 mx-1"></div>

                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${isRunning
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200'
                            }`}
                    >
                        <Play className={`w-4 h-4 ${isRunning ? 'fill-current' : ''}`} />
                        {isRunning ? 'PAUSE' : 'START SIMULATION'}
                    </button>

                    <button
                        onClick={reset}
                        className="p-2 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
                        title="Reset Simulation"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </header>


            {/* Showcase Narrator: Replaces static observation guide */}
            <ShowcaseNarrator status={analysis.status} trend={analysis.slope} />


            {/* Main Split Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">

                {/* VS Badge */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-12 h-12 bg-slate-800 text-white font-black rounded-full border-4 border-slate-50 shadow-xl">
                    VS
                </div>

                {/* Panel 1 */}
                <div className="flex flex-col gap-4">
                    <div className="px-2">
                        <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest">The Old Way</h3>
                        <p className="text-sm text-slate-400">Reactive Medicine</p>
                    </div>
                    <StandardMonitor heartRate={currentHR} />
                </div>

                {/* Panel 2 */}
                <div className="flex flex-col gap-4">
                    <div className="px-2 text-right">
                        <h3 className="text-lg font-bold text-teal-600 uppercase tracking-widest">The Praecor Way</h3>
                        <p className="text-sm text-slate-400">Predictive Analytics</p>
                    </div>
                    <PredictiveMonitor history={history} currentHR={currentHR} analysis={analysis} />
                </div>
            </div>

            {/* Contextual Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center text-blue-800 text-sm max-w-2xl mx-auto mt-8">
                <p className="font-semibold">Observation Guide:</p>
                <p className="mt-1 opacity-80">
                    Select <strong>Scenario B</strong> and watch how the Right Panel detects the issue (Drift) WAY before the Left Panel triggers an alarm (at 100 BPM).
                </p>
            </div>


        </div>
    );
}
