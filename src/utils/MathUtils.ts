class MathUtils {
    static lerp(start: number, end: number, numElements: number): number[] {
        const step = (end - start) / (numElements - 1);
        return Array.from({ length: numElements }, (_, i) => start + step * i);
    }

    static degToRad(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    /**
      * Computes the mean anomaly from the eccentric anomaly.
      *
      * @param e The eccentric anomaly.
      * @param M The mean anomaly.
      * @returns {number} The mean anomaly.
      */
    static meanToEccentricAnomaly(e: number, M: number): number {
        var tol = 0.0001;  // tolerance
        var eAo = M;       // initialize eccentric anomaly with mean anomaly
        var ratio = 1;     // set ratio higher than the tolerance
        while (Math.abs(ratio) > tol) {
            var f_E = eAo - e * Math.sin(eAo) - M;
            var f_Eprime = 1 - e * Math.cos(eAo);
            ratio = f_E / f_Eprime;
            if (Math.abs(ratio) > tol) {
                eAo = eAo - ratio;
            }
        }
        return eAo;
    }

    /** Computes the eccentric anomaly from the mean anomaly.
      *
      * @param e The eccentric anomaly.
      * @param M The mean anomaly.
      * @returns {number} The eccentric anomaly.
      */
    static eccentricToTrueAnomaly(e: number, E: number): number {
        return 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2));
    }

    /**
     * Computes true anomaly at a given time in milliseconds.
     *
     * @param time The time.
     * @param period The period.
     * @param M The mean anomaly.
     * @returns {number} The true anomaly.
     */
    static timeToTrueAnomaly(time: number, period: number, M: number): number {
        return M + 2 * Math.PI * time / period;
    }
}

export default MathUtils;
