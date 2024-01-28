import SceneNode from "../../Library/Objects/SceneNode.js";
import Head from "./Head.js";
import Leg from "./Leg.js";

export default class Octopus extends SceneNode{
    constructor(){
        super();

        this.nodes = [new Head()];

        this.nodes[0].nodes = [new Leg()];
        //this.nodes[0].nodes[0].scaleBy = [2, 10, 1];
    }
}