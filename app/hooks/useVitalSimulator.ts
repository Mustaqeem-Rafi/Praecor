import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export type VitalData = {
  timestamp: string;
  heartRate: number;
  trend: number;
};

export type Scenario = 'A' | 'B';

export type SimulationStatus = 'NORMAL' | 'DRIFT_WARNING' | 'CRITICAL_FAILURE';

const INITIAL_HR = 75;

export const useVitalSimulator = () => {
  const [data, setData] = useState<VitalData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [scenario, setScenario] = useState<Scenario>('A');
  const [elapsed, setElapsed] = useState(0);

  const elapsedRef = useRef(0);
  const dataRef = useRef<VitalData[]>([]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    elapsedRef.current = 0;
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString(),
      heartRate: INITIAL_HR + (Math.random() * 2 - 1),
      trend: 0
    }));
    setData(initialData);
    dataRef.current = initialData;
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        elapsedRef.current += 1;
        const currentTime = elapsedRef.current;

        if (currentTime >= 30) {
          setIsRunning(false);
          setElapsed(30);
          return;
        }

        let baseHR = INITIAL_HR;
        let noise = 0;

        if (scenario === 'A') {
          noise = Math.random() * 6 - 3;
        } else {
          baseHR = INITIAL_HR + (1.0 * currentTime);
          noise = Math.random() * 4 - 2;
        }

        const newHR = Math.round((baseHR + noise) * 10) / 10;

        const newDataPoint: VitalData = {
          timestamp: new Date().toLocaleTimeString(),
          heartRate: newHR,
          trend: 0
        };

        setData(prev => {
          const updated = [...prev, newDataPoint].slice(-30);
          dataRef.current = updated;
          return updated;
        });

        setElapsed(currentTime);

      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, scenario]);

  const currentHR = data.length > 0 ? data[data.length - 1].heartRate : INITIAL_HR;

  // --- Centralized Analysis Logic ---
  const analysis = useMemo(() => {
    if (data.length < 10) return { slope: 0, isDrifting: false, status: 'NORMAL' as SimulationStatus };

    const recent = data.slice(-10);
    const first3 = recent.slice(0, 3).reduce((acc, cur) => acc + cur.heartRate, 0) / 3;
    const last3 = recent.slice(-3).reduce((acc, cur) => acc + cur.heartRate, 0) / 3;

    const slope = last3 - first3;
    const isDrifting = slope > 4;
    const isCritical = currentHR >= 100;

    let status: SimulationStatus = 'NORMAL';
    if (isCritical) status = 'CRITICAL_FAILURE';
    else if (isDrifting) status = 'DRIFT_WARNING';

    return { slope, isDrifting, status };
  }, [data, currentHR]);

  return {
    currentHR,
    history: data,
    isRunning,
    setIsRunning,
    scenario,
    setScenario,
    reset,
    elapsed,
    analysis // Now exporting the analysis directly
  };
};
