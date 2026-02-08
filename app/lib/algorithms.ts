export class KalmanFilter {
    private R: number; // Measurement noise covariance
    private Q: number; // Process noise covariance
    private A: number; // State transition matrix
    private B: number; // Control input matrix
    private C: number; // Measurement matrix
    private cov: number; // Estimate covariance
    private x: number; // Estimated value

    constructor(R: number = 1, Q: number = 1, A: number = 1, B: number = 0, C: number = 1) {
        this.R = R;
        this.Q = Q;
        this.A = A;
        this.B = B;
        this.C = C;
        this.cov = NaN;
        this.x = NaN;
    }

    filter(z: number, u: number = 0): number {
        if (isNaN(this.x)) {
            this.x = (1 / this.C) * z;
            this.cov = (1 / this.C) * this.R * (1 / this.C);
        } else {
            // Predic
            const predX = (this.A * this.x) + (this.B * u);
            const predCov = ((this.A * this.cov) * this.A) + this.Q;

            // Update
            const K = predCov * this.C * (1 / ((this.C * predCov * this.C) + this.R));
            this.x = predX + K * (z - (this.C * predX));
            this.cov = predCov - (K * this.C * predCov);
        }
        return this.x;
    }

    getUncertainty(): number {
        return this.cov;
    }
}

export class BayesianNetwork {
    private priors: { [key: string]: number };

    constructor() {
        // Initial priors for a general hospital population
        this.priors = {
            sepsis: 0.10, // 10% baseline risk (higher for demo purposes)
        };
    }

    // Simplified Bayesian update for Sepsis risk based on HR and MAP
    // P(Sepsis | Data) = P(Data | Sepsis) * P(Sepsis) / P(Data)
    calculateRisk(hr: number, map: number): number {
        let p_sepsis = this.priors.sepsis;

        // Likelihood functions (more sensitive for demo)
        // HR > 90 starts being bad. HR > 110 is very bad.
        const p_hr_given_sepsis = this.sigmoid((hr - 90) / 8);
        const p_hr_given_healthy = 1 - this.sigmoid((hr - 85) / 8);

        // MAP < 75 starts being bad. MAP < 60 is very bad.
        const p_map_given_sepsis = 1 - this.sigmoid((map - 75) / 8);
        const p_map_given_healthy = this.sigmoid((map - 80) / 8);

        // Combine likelihoods (assuming independence for simplicity in this demo)
        const likelihood_sepsis = p_hr_given_sepsis * p_map_given_sepsis;
        const likelihood_healthy = p_hr_given_healthy * p_map_given_healthy;

        // Evidence
        const p_data = (likelihood_sepsis * p_sepsis) + (likelihood_healthy * (1 - p_sepsis));

        // Posterior
        if (p_data === 0) return 0;
        const posterior = (likelihood_sepsis * p_sepsis) / p_data;

        return Math.min(Math.max(posterior, 0), 1); // Clamp 0-1
    }

    private sigmoid(t: number): number {
        return 1 / (1 + Math.exp(-t));
    }
}

export class DriftDetector {
    private window: number[];
    private readonly windowSize: number;

    constructor(windowSize: number = 10) {
        this.window = [];
        this.windowSize = windowSize;
    }

    addPoint(value: number): number {
        this.window.push(value);
        if (this.window.length > this.windowSize) {
            this.window.shift();
        }
        return this.calculateSlope();
    }

    private calculateSlope(): number {
        if (this.window.length < 2) return 0;

        const n = this.window.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;

        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += this.window[i];
            sumXY += i * this.window[i];
            sumXX += i * i;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope;
    }
}
