import EnvironmentLight from "./EnvironmentLight.js";
import PointLightSource from "./PointLightSource.js";

//!Assumes single point light source
export default class AggregateLight{
    constructor(gl, program){
        this.environmentLight =  new EnvironmentLight(gl, program);
        this.pointLight = new PointLightSource(gl, program);
    }

    sendLightValues(gl, object){
        this.environmentLight.calculateAndSendProducts(gl, object.material);
    }
    calculateLighting(gl, program, object){

    }
}