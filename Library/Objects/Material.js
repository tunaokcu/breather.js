import {flatten, vec4} from "../Common/MV.js";


export default class Material{
    constructor(materialAmbient= vec4( 1.0, 0.0, 1.0, 1.0 ), materialDiffuse= vec4( 1.0, 0.8, 0.0, 1.0 ), materialSpecular=vec4( 1.0, 1.0, 1.0, 1.0 ), materialShininess = 20.0){
        this.materialAmbient = materialAmbient;
        this.materialDiffuse = materialDiffuse;
        this.materialSpecular = materialSpecular;
        this.materialShininess = materialShininess;

        this.setLimeGreen();
    }

    //!DOESNT WORK
    setIdentity(){
        this.materialAmbient = vec4(1.0, 1.0, 1.0, 0);
        this.materialDiffuse = vec4(1.0, 1.0, 1.0, 0);
        this.materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
        this.materialShininess = vec4(1.0, 1.0, 1.0, 1.0);
    }

    setTestValues(){
        var octopusColor = vec4(86.0/255, 90.0/255, 100.0/255, 0);
        this.materialAmbient = octopusColor;
        this.materialDiffuse =  vec4(30.0/255, 20.0/255, 20.0/255, 0);;
        this.materialSpecular = octopusColor;
        this.materialShininess = 50.0;
    }
    setTestValues2(){
        var color = vec4(193.0/255, 74.0/255, 65.0/255, 0);

        this.materialAmbient = color;
        this.materialDiffuse = color;
        this.materialSpecular = color;
        this.materialShininess = 30.0;
    }
    setLimeGreen(){
        var color = vec4(50/255, 205/255, 50/255, 0);
        this.materialAmbient = color;
        this.materialDiffuse = color;
        this.materialSpecular = color;
    }
}