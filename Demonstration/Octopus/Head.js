import Sphere from "../../Library/Objects/Sphere.js";
import SceneNode from "../../Library/Objects/SceneNode.js";

export default class Head extends SceneNode{
    constructor(scale = 1){
        super();
        
        this.object = new Sphere();
        this.scaleBy = [scale*3, scale*3.5, scale*3];
    }
}