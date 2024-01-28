import {flatten, vec4} from "../Common/MV.js";

export default class PointLightSource{
    constructor(gl, program, lightPosition= vec4(1.0, 1.0, 1.0, 0.0 )){
        this.lightPositionLoc =  gl.getUniformLocation(program, "lightPosition");

        this.setAndSendLightPosition(gl, lightPosition)
    }

    setAndSendLightPosition(gl, newLightPosition){
        this.lightPosition = newLightPosition;
        gl.uniform4fv(this.lightPositionLoc, flatten(this.lightPosition));
        
    }

    incrementLightLocation(gl, x,y,z){
        this.lightPosition[0] += x;
        this.lightPosition[1] += y;
        this.lightPosition[2] += z;
        gl.uniform4fv(this.lightPositionLoc, flatten(this.lightPosition));
    }

}