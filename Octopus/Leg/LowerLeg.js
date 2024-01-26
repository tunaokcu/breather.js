import SceneNode from "../../Objects/SceneNode.js";
import Cube from "../../Objects/Cube.js";

export default class LowerLeg extends SceneNode{
    constructor(scale = 1){
        super();
        
        this.object = new Cube();
        this.scaleBy = [scale*0.1, scale*2, scale*0.1];
    }
}