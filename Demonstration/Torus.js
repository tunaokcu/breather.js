import ParametricSurface from "../Library/Objects/ParametricSurface.js";
import { vec4 } from "../Library/Common/MV.js";

export default class Torus extends ParametricSurface{
    //! r1 should not equal r2
    //! BUG: r1 can equal r2, however, for some reason this causes a bug in our program
    constructor(uStart=0, uEnd=2*Math.PI, uDelta=30*Math.PI/360, vStart=0, vEnd=2*Math.PI, vDelta=30*Math.PI/360, r1 = 0.6, r2 = 0.3){
        super(uStart, uEnd, uDelta, vStart, vEnd, vDelta);
        this.r1 = r1;
        this.r2 = r2;

        this.material.setLimeGreen()
    }

    parametricFunction(u, v){
        let x = (this.r1 + this.r2*Math.cos(v)) * Math.cos(u);
        let y = (this.r1 + this.r2*Math.cos(v)) * Math.sin(u);
        let z = this.r2 * Math.sin(v);

        return vec4(x, y, z, 1);
    }

}