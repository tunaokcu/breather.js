import SceneNode from "../../Library/Objects/SceneNode.js";
import LowerLeg from "./Leg/LowerLeg.js";
import MiddleLeg from "./Leg/MiddleLeg.js";
import UpperLeg from "./Leg/UpperLeg.js";

export default class Leg extends SceneNode{
    constructor(){
        super();
        
        this.nodes = [new UpperLeg()];
        //this.nodes[0].translateBy = [0, -4, 0]

        this.nodes[0].nodes = [new MiddleLeg()];
        this.nodes[0].nodes[0].translateBy = [0, -3, 0];


        this.nodes[0].nodes[0].nodes = [new LowerLeg()];
        this.nodes[0].nodes[0].nodes[0].translateBy = [0, -2, 0];
    }
}