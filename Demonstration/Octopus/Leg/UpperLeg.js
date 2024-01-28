import SceneNode from "../../../Library/Objects/SceneNode.js";
import Cube from "../../../Library/Objects/Cube.js";

export default class UpperLeg extends SceneNode{
    constructor(scale = 1){
        super();
        
        this.object = new Cube();
        this.scaleBy = [scale*0.3, scale*3, scale*0.3];
    }
}