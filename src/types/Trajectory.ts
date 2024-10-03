import { MathUtils } from "three";
import Coords from "./Coords";


class Trajectory {
    name: string;
    smA: number;
    oI: number;
    aP: number;
    oE: number;
    aN: number;
    period: number;
    epochMeanAnomaly: number;
    position: Coords;
    time: number;
    color: string;

    constructor(
        name: string,
        smA: number,
        oI: number,
        aP: number,
        oE: number,
        aN: number,
        mAe: number,
        Sidereal: number,
        color: string = "hotpink"
    ){
        this.name = name                                 // name the object
        this.smA = smA                                   // semi major axis
        this.oI = MathUtils.degToRad(oI)                 // orbital inclination --> convert degrees to radians
        this.aP = MathUtils.degToRad(aP)                 // argument of Perigee --> convert degrees to radians
        this.oE = oE                                     // orbital eccentricity
        this.aN = MathUtils.degToRad(aN)                 // ascending node --> convert degrees to radians
        this.period = Sidereal                           // siderial period as a multiple of Earth's orbital period
        this.epochMeanAnomaly = MathUtils.degToRad(mAe)  // mean anomaly at epoch
        this.position = [0,0,0]
        this.time = 0
        this.color = color
    }

    /**
     * Returns the position on the orbit at the given true anomaly.
     *
     * @param uA The true anomaly.
     */
    propagate(uA: number): Coords {
        let pos: Coords = [0, 0, 0];
        let xdot; let ydot; let zdot;            // velocity coordinates
        let theta = uA;                          // Update true anomaly.
        let smA = this.smA;                      // Semi-major Axis
        let oI =  this.oI ;                      // Orbital Inclination
        let aP = this.aP ;                       // Get the object's orbital elements.
        let oE = this.oE;                        // Orbital eccentricity
        let aN = this.aN ;                       // ascending Node
        let sLR = smA * (1 - oE^2) ;             // Compute Semi-Latus Rectum.
        let r = sLR/(1 + oE * Math.cos(theta));  // Compute radial distance.

        // Compute position coordinates pos[0] is x, pos[1] is y, pos[2] is z
        pos[0] = r * (Math.cos(aP + theta) * Math.cos(aN) - Math.cos(oI) * Math.sin(aP + theta) * Math.sin(aN));
        pos[1] = r * (Math.sin(aP + theta) * Math.sin(oI));
        pos[2] = r * (Math.cos(aP + theta) * Math.sin(aN) + Math.cos(oI) * Math.sin(aP + theta) * Math.cos(aN));

        return pos;
    }

    /**
     * Getter for the trajectory's points.
     *
     * @returns {Coords[]} The trajectory's points.
     */
    get points(): Coords[] {
        const _points = new Array(360).fill(0).map((_, i) => {
            return this.propagate(MathUtils.degToRad(i));
        });
        _points.push(_points[0]);
        return _points;
    }

    /**
     * Computes true anomaly at a given time.
     *
     * @param time The time.
     * @returns {number} The true anomaly.
     */
    getTrueAnomaly(time: number): number {
        const _time = time - this.time;
        const _period = this.period;
        return MathUtils.radToDeg(
            2 * Math.atan(
                Math.sqrt((1 + this.oE) / (1 - this.oE)) *
                    Math.tan(this.epochMeanAnomaly / 2)) +
                    this.oE * Math.sin(this.epochMeanAnomaly) *
                    _time / _period);
    }
}

export default Trajectory;


type TrajectoryData = {
    name: string,
    smA: number,
    oI: number,
    aP: number,
    oE: number,
    aN: number,
    mAe: number,
    sidereal: number,
    color: string
}


class TrajectoryUtils {
    /**
     * Loads trajectories from a JSON file.
     *
     * @param file The file to load.
     * @returns {Trajectory[]} The loaded trajectories.
     */
    static async load(file: string): Promise<Trajectory[]> {
        const response = await fetch(file);
        const data = await response.json();
        const trajectories: Trajectory[] = data.objects.map(
            (object: TrajectoryData) => {
                return new Trajectory(
                    object.name,
                    object.smA,
                    object.oI,
                    object.aP,
                    object.oE,
                    object.aN,
                    object.mAe,
                    object.sidereal,
                    object.color
                );
            });

        return trajectories;
    }
}

export { TrajectoryUtils, type TrajectoryData };
