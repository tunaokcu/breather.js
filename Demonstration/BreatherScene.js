import Scene from "../Library/Scene/Scene.js";
import Breather from "./Breather.js";

export default class BreatherScene extends Scene{
    constructor(canvasId="gl-canvas", backgroundColor=[1.0, 1.0, 1.0, 1.0]){
        super(canvasId, backgroundColor);
        
        this.object = new Breather();
        
        this.setTestParams();
    }

    updateaa(aa){
        this.object.aa = aa;
        this.renderUnconditional();
    }

    updateuRange(range){
        this.object.uStart = -range;
        this.object.uEnd = range;
        this.renderUnconditional();
    }

    updatevRange(range){
        this.object.vStart = -range;
        this.object.vEnd = range;
        this.renderUnconditional();
    }

    updateuDelta(delta){
        this.object.uDelta = delta;
        this.renderUnconditional();
    }

    updatevDelta(delta){
        this.object.vDelta = delta;
        this.renderUnconditional();    
    }

    setTestParams(){
        this.object.aa = 0.4;
        this.object.uStart = -14;
        this.object.uEnd = 14;
        this.object.vStart = -37.4;
        this.object.vEnd = 37.4;
    }

}
