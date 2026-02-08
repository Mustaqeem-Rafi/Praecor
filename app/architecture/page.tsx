'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Database, Brain, TrendingUp, ShieldCheck, Bell, Activity, ChevronRight, Server, Play, Pause, RotateCcw, Microscope, AlertOctagon, CheckCircle2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { SCENARIO_STABLE, SCENARIO_SEPSIS, VitalSignData } from '../data/patient_scenarios';
import { KalmanFilter, BayesianNetwork, DriftDetector } from '../lib/algorithms';

// Node Configuration
const NODES = [
    {
        id: 'ingest',
        title: 'Data Ingestion',
        subtitle: 'Kafka Stream',
        icon: Database,
        color: 'text-sky-400',
        border: 'border-sky-500/50',
        gradient: 'from-sky-500/20',
        desc: 'Buffers 100Hz sensor data via FHIR.',
        detailedInfo: "Ingests high-frequency (100Hz) raw waveform data from bedside monitors. Handles packet loss and creates a unified time-series stream."
    },
    {
        id: 'norm',
        title: 'Normalization',
        subtitle: 'Kalman Filter',
        icon: Brain,
        color: 'text-violet-400',
        border: 'border-violet-500/50',
        gradient: 'from-violet-500/20',
        desc: 'Learns patient-specific baseline physiology.',
        detailedInfo: "Applies a recursive Kalman Filter to separate true physiological signal from sensor noise (e.g., patient movement artifacts), estimating the true state."
    },
    {
        id: 'temporal',
        title: 'Temporal Analysis',
        subtitle: 'Drift Detection',
        icon: TrendingUp,
        color: 'text-amber-400',
        border: 'border-amber-500/50',
        gradient: 'from-amber-500/20',
        desc: 'Calculates velocity of vital trends.',
        detailedInfo: "Computes the 1st and 2nd derivatives of vital signs over sliding windows (10s, 60s, 5m) to detect subtle physiological drift before thresholds are breached."
    },
    {
        id: 'risk',
        title: 'Risk Engine',
        subtitle: 'Bayesian Inference',
        icon: ShieldCheck,
        color: 'text-emerald-400',
        border: 'border-emerald-500/50',
        gradient: 'from-emerald-500/20',
        desc: 'Computes unified probability score.',
        detailedInfo: "Updates the posterior probability of Sepsis using a Bayesian Network, combining current drift evidence with prior patient history."
    },
    {
        id: 'action',
        title: 'Clinical Action',
        subtitle: 'Sepsis Protocol',
        icon: Bell,
        color: 'text-rose-400',
        border: 'border-rose-500/50',
        gradient: 'from-rose-500/20',
        desc: 'Triggers actionable alerts to EMR.',
        detailedInfo: "Interacts with the EMR to trigger the Sepsis Bundle protocol if the probability score exceeds the 80% confidence threshold."
    },
];

export default function ArchitecturePage() {
    // Simulation State
    const [isPlaying, setIsPlaying] = useState(false);
    const [scenarioType, setScenarioType] = useState<'STABLE' | 'SEPSIS'>('STABLE');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Algorithms (Memoized to persist across renders)
    const algorithms = useMemo(() => ({
        kfHR: new KalmanFilter(1, 1, 1, 0, 1),
        kfMAP: new KalmanFilter(1, 1, 1, 0, 1),
        drift: new DriftDetector(10),
        bayes: new BayesianNetwork(),
    }), []); // Empty dependency array = created once on mount

    // Current Data Slice
    const currentData = scenarioType === 'STABLE' ? SCENARIO_STABLE : SCENARIO_SEPSIS;
    const rawPoint = currentData[currentIndex % currentData.length];

    // Processed State
    const [processedState, setProcessedState] = useState<{
        filteredHR: number;
        filteredMAP: number;
        slope: number;
        risk: number;
    }>({ filteredHR: 0, filteredMAP: 0, slope: 0, risk: 0 });

    const isCritical = processedState.risk > 0.8;
    const isDriftDetected = Math.abs(processedState.slope) > 0.3; // Drift if slope exceeds threshold
    const isWarning = (processedState.risk > 0.4 || isDriftDetected) && !isCritical;
    const isStable = !isCritical && !isWarning;

    // Step Logic
    useEffect(() => {
        if (!isPlaying) return;

        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % currentData.length);
        }, 500); // 500ms per Data Point (2x speed)

        return () => clearInterval(timer);
    }, [isPlaying, currentData.length]);

    // Reactive Processing Pipeline
    useEffect(() => {
        // 1. Ingest (Raw)
        const pt = rawPoint;
        setActiveNode('ingest');

        // 2. Normalization (Kalman)
        const fHR = algorithms.kfHR.filter(pt.hr);
        const fMAP = algorithms.kfMAP.filter(pt.map);
        // Visual delay for "processing time"
        setTimeout(() => setActiveNode('norm'), 200);

        // 3. Temporal (Drift)
        const slope = algorithms.drift.addPoint(fHR);
        setTimeout(() => setActiveNode('temporal'), 400);

        // 4. Risk (Bayes)
        const risk = algorithms.bayes.calculateRisk(fHR, fMAP);
        setTimeout(() => setActiveNode('risk'), 600);

        // 5. Action
        setTimeout(() => setActiveNode('action'), 800);
        setTimeout(() => setActiveNode(null), 1000);

        setProcessedState({ filteredHR: fHR, filteredMAP: fMAP, slope, risk });

        // Logging
        const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
        let riskLog = `[RISK] P=${risk.toFixed(2)} (${risk > 0.5 ? 'HIGH' : 'LOW'})`;
        if (Math.abs(slope) > 0.3) riskLog = `[DRIFT] Slope=${slope.toFixed(3)} | ` + riskLog;
        if (risk > 0.8) riskLog = `[ALERT] SEPSIS PROTOCOL TRIGGERED! Risk=${risk.toFixed(2)}`;

        const newLog = `[${timestamp}] HR:${fHR.toFixed(1)} MAP:${fMAP.toFixed(1)} | ${riskLog}`;
        setLogs(prev => [...prev.slice(-8), newLog]);

    }, [currentIndex, rawPoint, algorithms]); // Re-run when index changes

    // Reset when switching scenarios
    const handleScenarioChange = (type: 'STABLE' | 'SEPSIS') => {
        setIsPlaying(false);
        setScenarioType(type);
        setCurrentIndex(0);
        setLogs([]);
        // Ideally reset algorithms here too, but for demo continuity we might keep learning
    };

    return (
        <div className="min-h-screen bg-[#050911] text-slate-300 p-6 md:p-12 relative overflow-hidden font-sans transition-colors duration-1000">

            {/* Dynamic Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_70%,transparent_100%)] pointer-events-none" />


            {/* Reactive Ambient Light */}
            <motion.div
                className={clsx(
                    "absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-all duration-1000",
                    isCritical ? "bg-red-900/40" : isWarning ? "bg-amber-900/30" : "bg-teal-900/20"
                )}
                animate={{
                    scale: isCritical ? [1, 1.1, 1] : 1,
                    opacity: isCritical ? [0.4, 0.6, 0.4] : 0.3
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col h-full gap-8">

                {/* Header with System Status */}
                <div className="text-center relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/30 border border-teal-800/50 text-teal-400 text-xs font-mono mb-4">
                        <Server className="w-3 h-3" />
                        SYSTEM_ARCH_V2.0
                    </div>

                    {/* Status Banner */}
                    <AnimatePresence mode="wait">
                        {isCritical ? (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="absolute top-0 right-0 md:right-10 flex items-center gap-2 px-4 py-2 bg-red-950/80 border border-red-500/50 rounded-lg text-red-200 animate-pulse"
                            >
                                <AlertOctagon className="w-5 h-5 text-red-500" />
                                <span className="font-bold tracking-widest text-sm">CRITICAL PROTOCOL ACTIVE</span>
                            </motion.div>
                        ) : isWarning ? (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="absolute top-0 right-0 md:right-10 flex items-center gap-2 px-4 py-2 bg-amber-950/80 border border-amber-500/50 rounded-lg text-amber-200"
                            >
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <span className="font-bold tracking-widest text-sm">DRIFT WARNING</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="absolute top-0 right-0 md:right-10 flex items-center gap-2 px-4 py-2 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-emerald-200"
                            >
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="font-bold tracking-widest text-sm">SYSTEM MONITORING</span>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        The Intelligence Pipeline
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        See how Praecor processes live vital signs using Kalman Filters and Bayesian Inference.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 w-fit mx-auto backdrop-blur-sm relative z-0">
                    <button
                        onClick={() => handleScenarioChange('STABLE')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all", scenarioType === 'STABLE' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : "text-slate-500 hover:text-slate-300")}
                    >
                        Scenario A: Stable
                    </button>
                    <button
                        onClick={() => handleScenarioChange('SEPSIS')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all", scenarioType === 'SEPSIS' ? "bg-rose-500/20 text-rose-400 border border-rose-500/50" : "text-slate-500 hover:text-slate-300")}
                    >
                        Scenario B: Sepsis
                    </button>
                    <div className="w-px bg-slate-700 mx-2"></div>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg text-sm font-bold hover:bg-white transition-colors"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isPlaying ? 'PAUSE' : 'RUN SIMULATION'}
                    </button>
                </div>

                {/* Pipeline Visualization */}
                <div className="relative py-8">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-[40%] left-[5%] right-[5%] h-[1px] bg-slate-800 z-0" />

                    {/* Data Packet Animation */}
                    <AnimatePresence>
                        {activeNode && (
                            <motion.div
                                className={clsx(
                                    "hidden md:block absolute top-[40%] h-1 shadow-[0_0_15px_3px_rgba(255,255,255,0.5)] z-0 rounded-full",
                                    isCritical ? "bg-rose-500 shadow-rose-500/50" : isWarning ? "bg-amber-400 shadow-amber-400/50" : "bg-teal-400 shadow-teal-400/50"
                                )}
                                initial={{ left: '5%', width: 0 }}
                                animate={{
                                    left: activeNode === 'ingest' ? '5%' :
                                        activeNode === 'norm' ? '25%' :
                                            activeNode === 'temporal' ? '45%' :
                                                activeNode === 'risk' ? '65%' : '85%',
                                    width: '15%' // approximate distance between nodes
                                }}
                                transition={{ duration: 0.2, ease: "linear" }}
                            />
                        )}
                    </AnimatePresence>


                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative w-full">
                        {NODES.map((node, i) => {
                            const isActive = activeNode === node.id;
                            const isHovered = hoveredNode === node.id;

                            // Special styling for Action node during critical events
                            const isActionCritical = node.id === 'action' && isCritical;

                            return (
                                <div
                                    key={node.id}
                                    className={clsx("relative group", isHovered ? "z-50" : "z-10")}
                                >
                                    {/* Connector Arrow */}
                                    {i < NODES.length - 1 && (
                                        <div className="hidden md:block absolute top-[40%] -right-3 z-0 text-slate-700">
                                            <ChevronRight className="w-6 h-6" />
                                        </div>
                                    )}

                                    {/* Tooltip / Hover Card */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute z-[100] bottom-full mb-4 left-1/2 -translate-x-1/2 w-80 bg-[#0F1623] border border-slate-700 rounded-xl shadow-2xl p-4 backdrop-blur-xl pointer-events-none"
                                            >
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0F1623] border-b border-r border-slate-700 rotate-45"></div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <node.icon className={clsx("w-4 h-4", node.color)} />
                                                    <h4 className="text-white font-bold text-sm">{node.title} Logic</h4>
                                                </div>
                                                <p className="text-xs text-slate-300 leading-relaxed">
                                                    {node.detailedInfo}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Card */}
                                    <div
                                        className={clsx(
                                            "relative h-64 flex flex-col items-center justify-center p-6 rounded-xl border bg-[#0A0F1C]/90 backdrop-blur-md transition-all duration-300 cursor-help",
                                            isActive || isActionCritical ? `border-${node.color.split('-')[1]}-500 shadow-[0_0_30px_-5px_rgba(var(--tw-shadow-color),0.3)] scale-105` : "border-slate-800 hover:border-slate-600",
                                            isActive && node.id === 'risk' && isCritical && "shadow-red-500/50 border-red-500",
                                            isActionCritical && "animate-pulse border-red-500 shadow-red-500/80 bg-red-950/20"
                                        )}
                                        onMouseEnter={() => setHoveredNode(node.id)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                    >
                                        <div className={clsx(
                                            "p-3 rounded-lg border mb-6 transition-all duration-300",
                                            isActive || isActionCritical ? `bg-${node.color.split('-')[1]}-500/20 border-${node.color.split('-')[1]}-500 text-white` : "bg-slate-900 border-slate-700 text-slate-500",
                                            node.color
                                        )}>
                                            <node.icon className={clsx("w-6 h-6", isActionCritical && "animate-bounce")} />
                                        </div>

                                        <h3 className={clsx("font-semibold text-lg transition-colors", isActive ? "text-white" : "text-slate-400")}>{node.title}</h3>
                                        <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mt-1 mb-4 text-center">{node.subtitle}</p>

                                        {/* Real-time Metric Display */}
                                        <div className="h-8 flex items-center justify-center font-mono text-xs">
                                            {node.id === 'ingest' && isPlaying && <span className="text-sky-400">HR: {rawPoint.hr.toFixed(0)} BPM</span>}
                                            {node.id === 'norm' && isPlaying && <span className="text-violet-400">σ: {Math.abs(rawPoint.hr - processedState.filteredHR).toFixed(2)}</span>}
                                            {node.id === 'temporal' && isPlaying && <span className={processedState.slope > 0.1 ? "text-rose-400" : "text-amber-400"}>m: {processedState.slope.toFixed(3)}</span>}
                                            {node.id === 'risk' && isPlaying && <span className={processedState.risk > 0.5 ? "text-rose-400 font-bold" : "text-emerald-400"}>P: {(processedState.risk * 100).toFixed(0)}%</span>}
                                            {node.id === 'action' && isPlaying && processedState.risk > 0.8 && <span className="text-rose-500 animate-pulse font-bold">ALERT SENT</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Deep Dive Panel (Teaching Mode) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Live Payload Inspector */}
                    <div className={clsx(
                        "rounded-xl border p-6 font-mono text-xs transition-all duration-500",
                        isCritical ? "bg-red-950/10 border-red-500/30" : "bg-[#090D14] border-slate-800"
                    )}>
                        <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-800 pb-2">
                            <Microscope className="w-4 h-4" />
                            <span>LIVE_OJBECT_INSPECTOR</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-slate-500 mb-2">RAW_INPUT</h4>
                                <pre className="text-sky-400 bg-sky-950/10 p-2 rounded">
                                    {JSON.stringify({
                                        timestamp: rawPoint.timestamp,
                                        hr: rawPoint.hr.toFixed(2),
                                        map: rawPoint.map.toFixed(2)
                                    }, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <h4 className="text-slate-500 mb-2">PROCESSED_OUTPUT</h4>
                                <pre className={clsx("p-2 rounded transition-colors", isCritical ? "text-red-400 bg-red-950/20" : "text-emerald-400 bg-emerald-950/10")}>
                                    {JSON.stringify({
                                        hr_smooth: processedState.filteredHR.toFixed(2),
                                        drift_slope: processedState.slope.toFixed(4),
                                        sepsis_risk: processedState.risk.toFixed(4)
                                    }, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Terminal */}
                    <div className="bg-[#090D14] rounded-xl border border-slate-800 p-6 font-mono text-xs flex flex-col">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                            <span className="text-slate-400">KERNEL_LOG_STREAM</span>
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-slate-700" />
                                <div className="w-2 h-2 rounded-full bg-slate-700" />
                            </div>
                        </div>
                        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 text-slate-400 max-h-[150px] scroll-smooth">
                            {logs.map((log, i) => (
                                <div key={i} className={clsx("transition-colors cursor-default break-all border-l-2 pl-2",
                                    log.includes("ALERT") ? "border-red-500 text-red-400 bg-red-950/10" :
                                        log.includes("HIGH") ? "border-amber-500 text-amber-400" : "border-transparent hover:text-slate-200"
                                )}>
                                    {log}
                                </div>
                            ))}
                            {logs.length === 0 && <span className="opacity-50 italic">Waiting for simulation start...</span>}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
