class MathUtils {
    static lerp(start: number, end: number, numElements: number): number[] {
        const step = (end - start) / (numElements - 1);
        return Array.from({ length: numElements }, (_, i) => start + step * i);
    }

    static deg2rad(degrees: number): number {
        return degrees * Math.PI / 180;
    }
}

export default MathUtils;
