interface KeplerianElements {
    a: number;  // semi-major axis
    e: number;  // eccentricity
    i: number;  // inclination (in radians)
    L: number;  // mean longitude (in radians)
    b: number;  // argument of perihelion (in radians)
    w: number;  // argument of periapsis (in radians)
    O: number;  // longitude of ascending node (in radians)
    nu: number;  // true anomaly (in radians)
}

export default KeplerianElements;
