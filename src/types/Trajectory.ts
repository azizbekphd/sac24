import { MathUtils } from "../utils";
import Coords from "./Coords";
import { MILLISECONDS_IN_SIDEREAL_YEAR, SUN_DIAMETER } from "../globals/constants";
import config from "../globals/config.json";


enum TrajectoryType {
    Planet,
    NEO,
    PHA,
    Other
}

class Trajectory {
    id: string;
    name: string;
    smA: number;
    oI: number;
    aP: number;
    oE: number;
    aN: number;
    period: number;
    epochMeanAnomaly: number;
    position: Coords;
    diameter: number;
    color: string;
    type: TrajectoryType;
    cache: {
        points?: Coords[],
        sLR?: number,
        scaleFactor?: number,
    }
    kind: string;
    sourceJSON: string;
    description: string;
    model: string;

    constructor(
        id: string,
        name: string,
        smA: number,
        oI: number,
        aP: number,
        oE: number,
        aN: number,
        mAe: number,
        Sidereal: number,
        diameter: number,
        type: TrajectoryType,
        color?: string,
        calculateOrbit: boolean = false,
        kind: string = '',
        sourceJSON: string = '{}',
        description: string = '',
        model: string = ''
    ){
        this.id = id
        this.name = name                                        // name the object
        this.smA = smA                                          // semi major axis
        this.oI = MathUtils.degToRad(oI)                        // orbital inclination --> convert degrees to radians
        this.aP = MathUtils.degToRad(aP)                        // argument of Perigee --> convert degrees to radians
        this.oE = oE                                            // orbital eccentricity
        this.aN = MathUtils.degToRad(aN)                        // ascending node --> convert degrees to radians
        this.period = Sidereal * MILLISECONDS_IN_SIDEREAL_YEAR  // siderial period as a multiple of Earth's orbital period
        this.epochMeanAnomaly = MathUtils.degToRad(mAe)         // mean anomaly at epoch
        this.diameter = isNaN(diameter) ? 0 : diameter
        this.type = type
        this.position = [0,0,0]
        this.color = color ?? (type === TrajectoryType.PHA ? "red" : (type === TrajectoryType.NEO ? "blue" : "grey"))
        this.cache = {}
        this.cache.sLR = this.smA * (1 - this.oE^2)
        if (calculateOrbit) {
            this.cache.points = this.points
        }
        this.kind = kind
        this.sourceJSON = sourceJSON
        this.description = description
        this.model = model
    }

    /**
     * Returns the position on the orbit at the given true anomaly.
     *
     * @param uA The true anomaly.
     */
    propagate(uA: number): Coords {
        const pos: Coords = [0, 0, 0];
        const theta = uA;
        const oI =  this.oI ;                      // Orbital Inclination
        const aP = this.aP ;                       // Get the object's orbital elements.
        const oE = this.oE;                        // Orbital eccentricity
        const aN = this.aN ;                       // ascending Node
        const sLR = this.cache.sLR!;               // Compute Semi-Latus Rectum.
        const r = sLR/(1 + oE * Math.cos(theta));  // Compute radial distance.

        // Compute position coordinates pos[0] is x, pos[1] is y, pos[2] is z
        pos[0] = -r * (Math.cos(aP + theta) * Math.cos(aN) - Math.cos(oI) * Math.sin(aP + theta) * Math.sin(aN));
        pos[1] = r * (Math.sin(aP + theta) * Math.sin(oI));
        pos[2] = r * (Math.cos(aP + theta) * Math.sin(aN) + Math.cos(oI) * Math.sin(aP + theta) * Math.cos(aN));

        return pos;
    }

    /**
     * Returns the position on the orbit at the given time.
     *
     * @param time The time in milliseconds.
     */
    propagateFromTime(time: number): Coords {
        const theta = MathUtils.calculateTrueAnomalyFromKeplerian(this.oE, this.epochMeanAnomaly, this.period, time);
        return this.propagate(theta);
    }

    /**
     * Getter for the trajectory's points.
     *
     * @returns {Coords[]} The trajectory's points.
     */
    get points(): Coords[] {
        if (this.cache && this.cache.points) {
            return this.cache.points
        }
        const _points = new Array(36000).fill(0).map((_, i) => {
            return this.propagate(MathUtils.degToRad(i / 100));
        });
        _points.push(_points[0]);
        return _points;
    }

    /**
     * Getter for the trajectory's scale factor.
     *
     * @returns {number} The trajectory's scale factor.
     */
    get scaleFactor(): number {
        if (this.cache && this.cache.scaleFactor) {
            return this.cache.scaleFactor
        }
        const ratio = (this.diameter ?? 0) / SUN_DIAMETER;
        const limitedRatio = Math.max(ratio, config.camera.minDistance);
        this.cache.scaleFactor = limitedRatio;
        return limitedRatio;
    }
}

export default Trajectory;


type TrajectoryData = {
    id: string,
    name: string,
    smA: number,
    oI: number,
    aP: number,
    oE: number,
    aN: number,
    mAe: number,
    sidereal: number,
    d: number,
    color: string,
    description: string,
    model: string
}


class TrajectoryUtils {
    /**
     * Loads trajectories from a JSON file.
     *
     * @param file The file to load.
     * @returns {Trajectory[]} The loaded trajectories.
     */
    static async load(file: string, calculateOrbit: boolean = true, type: TrajectoryType = TrajectoryType.Planet): Promise<Trajectory[]> {
        const response = await fetch(file);
        const data = await response.json();
        const trajectories: Trajectory[] = data.objects.map(
            (object: TrajectoryData) => {
                return new Trajectory(
                    object.id,
                    object.name,
                    object.smA,
                    object.oI,
                    object.aP,
                    object.oE,
                    object.aN,
                    object.mAe,
                    object.sidereal,
                    object.d,
                    type,
                    object.color,
                    calculateOrbit,
                    '',
                    JSON.stringify(object),
                    object.description,
                    object.model
                );
            });

        return trajectories;
    }
}

export { TrajectoryUtils, TrajectoryType, type TrajectoryData };
