import { DIFF_BETWEEN_J2000_AND_EPOCH } from "../globals/constants";

class MathUtils {
    static lerp(start: number, end: number, numElements: number): number[] {
        const step = (end - start) / (numElements - 1);
        return Array.from({ length: numElements }, (_, i) => start + step * i);
    }

    static degToRad(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    /**
        * Calculate the mean anomaly at a given time.
        * @param M0 - Mean anomaly at epoch (radians).
        * @param T - Sidereal period (seconds).
        * @param t - Time of interest (seconds from epoch).
        * @returns Mean anomaly at time t (radians).
        */
    static calculateMeanAnomaly(M0: number, T: number, t: number): number {
        return M0 + (2 * Math.PI / T) * t;
    }

    /**
        * Solve Kepler's equation using Newton's method.
        * @param M - Mean anomaly (radians).
        * @param e - Eccentricity.
        * @returns Eccentric anomaly (radians).
        */
    static solveKeplersEquation(M: number, e: number): number {
        let E = M; // Initial guess
        const tolerance = 1e-6; // Convergence tolerance
        let counter = 0;

        while (true) {
            const E_next = E + (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
            if (Math.abs(E_next - E) < tolerance || counter >= 100) break;
            E = E_next;
            counter++;
        }
        if (counter >= 100 && (isNaN(M) || isNaN(e))) {
            console.warn("Failed to converge to Kepler's equation.");
            console.log("M:", M);
            console.log("e:", e);
            console.log("E:", E);
        }
        return E;
    }

    /**
        * Calculate the true anomaly from the eccentric anomaly.
        * @param E - Eccentric anomaly (radians).
        * @param e - Eccentricity.
        * @returns True anomaly (radians).
        */
    static calculateTrueAnomaly(E: number, e: number): number {
        return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
    }

    /**
        * Calculate the true anomaly for a given time from Keplerian elements.
        * @param e - Eccentricity.
        * @param M0 - Mean anomaly at epoch (radians).
        * @param T - Sidereal period (seconds).
        * @param t - Time of interest (seconds from epoch).
        * @returns True anomaly (radians).
        */
    static calculateTrueAnomalyFromKeplerian(
        e: number,
        M0: number,
        T: number,
        t: number
    ): number {
        t -= DIFF_BETWEEN_J2000_AND_EPOCH;
        const M = this.calculateMeanAnomaly(M0, T, t);

        const E = this.solveKeplersEquation(M, e);

        const nu = this.calculateTrueAnomaly(E, e);

        return nu;
    }
}

export default MathUtils;
