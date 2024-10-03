import { KeplerianElements } from "../types";
import MathUtils from "./MathUtils";

const keplerianDeg2Rad = (objs: {name: string} & KeplerianElements[]): KeplerianElements[] => {
    return objs.map(obj => {
        return {
            ...obj,
            i: MathUtils.deg2rad(obj.i),
            L: MathUtils.deg2rad(obj.L),
            w: MathUtils.deg2rad(obj.w),
            O: MathUtils.deg2rad(obj.O),
            nu: MathUtils.deg2rad(obj.nu)
        };
    });
};

export default keplerianDeg2Rad;
