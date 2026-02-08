export interface VitalSignData {
    timestamp: number;
    hr: number; // Heart Rate
    map: number; // Mean Arterial Pressure
    o2: number; // O2 Saturation
}

// Deterministic pseudo-random noise (seeded)
const seededNoise = (seed: number): number => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return (x - Math.floor(x)) * 4 - 2; // Returns -2 to +2
};

// Scenario A: Stable Patient
// Slight noise, but generally fluctuating around baseline
export const SCENARIO_STABLE: VitalSignData[] = Array.from({ length: 60 }, (_, i) => ({
    timestamp: i,
    hr: 75 + seededNoise(i * 1.1),
    map: 85 + seededNoise(i * 2.2),
    o2: 98 + seededNoise(i * 3.3) * 0.25
}));

// Scenario B: Sepsis Onset (Rapid Decompensation)
// HR rises quickly. MAP drops quickly.
export const SCENARIO_SEPSIS: VitalSignData[] = Array.from({ length: 40 }, (_, i) => {
    // 0-10s: Stable
    if (i < 10) {
        return {
            timestamp: i,
            hr: 80 + seededNoise(i * 4.4),
            map: 80 + seededNoise(i * 5.5),
            o2: 98
        };
    }
    // 10-40s: Aggressive Decompensation
    const progress = (i - 10) / 30;
    const driftFactor = Math.pow(progress, 1.2);

    return {
        timestamp: i,
        hr: 80 + (driftFactor * 60) + seededNoise(i * 6.6),
        map: 80 - (driftFactor * 35) + seededNoise(i * 7.7),
        o2: 98 - (driftFactor * 6)
    };
});
