import ParametricSurface from "./ParametricSurface.js";
import {vec3} from "../Common/MV.js";

export default class Sphere extends ParametricSurface{
    constructor(uStart=0, uEnd=2*Math.PI, uDelta=30*Math.PI/360, vStart=0, vEnd=2*Math.PI, vDelta=30*Math.PI/360, r = 1){
        super(uStart, uEnd, uDelta, vStart, vEnd, vDelta);
        this.r = r;
    }

    //(u, v) => (x, y, z)
    parametricFunction(u, v){
        let r = this.r;
        return vec3(r*Math.sin(u)*Math.cos(v), r*Math.sin(u)*Math.sin(v), r*Math.cos(u)); //!!!!!!!!! SPHERE DID NOT HAVE 1 BEFORE.. WAS THIS THE CAUSE OF THE BUG?
    }

    trueNormals(u, v){
        return this.parametricFunction(u,v);  
    }

}