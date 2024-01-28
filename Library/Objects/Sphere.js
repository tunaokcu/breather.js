import ParametricSurface from "./ParametricSurface.js";
import {vec3, vec4} from "../Common/MV.js";

export default class Sphere extends ParametricSurface{
    constructor(uStart=0, uEnd=2*Math.PI, uDelta=30*Math.PI/360, vStart=0, vEnd=2*Math.PI, vDelta=30*Math.PI/360, r = 1){
        super(uStart, uEnd, uDelta, vStart, vEnd, vDelta);
        this.r = r;
    }

    //(u, v) => (x, y, z)
    parametricFunction(u, v){
        //Old equation
        //return vec4(this.r*Math.cos(u)*Math.cos(v), this.r*Math.sin(u)*Math.cos(v), this.r*Math.sin(v), 1);
        let r = this.r;
        return vec4(r*Math.sin(u)*Math.cos(v), r*Math.sin(u)*Math.sin(v), r*Math.cos(u));
    }

    trueNormals(u, v){
        //return vec3(Math.cos(u), Math.cos(v), Math.sin(u));
        let res = this.parametricFunction(u,v);
        return vec3(res[0], res[1], res[2]);
    }

}