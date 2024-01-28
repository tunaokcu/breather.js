import Cube from "../Cube.js";
import { vec2, flatten, rotate} from "../../Common/MV.js";

//TODO fix
//LOTS. of jumbled calculations.
let textH = 2.0
let textW = 4.0

let xOffset = 1/textW
let yOffset = 1/textH

let down = rotateClockwise([
    vec2(2*xOffset, yOffset*2),
    vec2(2*xOffset, yOffset),
    vec2(3*xOffset, yOffset),

    vec2(2*xOffset, yOffset*2),
    vec2(3*xOffset, yOffset),
    vec2(3*xOffset, yOffset*2)
]);


let face = [vec2(xOffset, yOffset),
    vec2(xOffset, 0),
    vec2(2*xOffset, 0),

    vec2(xOffset, yOffset),
    vec2(2*xOffset, 0),
    vec2(2*xOffset, yOffset)]

let right = [
    vec2(2*xOffset, yOffset),
    vec2(2*xOffset, 0),
    vec2(3*xOffset, 0),

    vec2(2*xOffset, yOffset),
    vec2(3*xOffset, 0),
    vec2(3*xOffset, yOffset)
]

let left = [    vec2(0, yOffset),
    vec2(0, 0),
    vec2(xOffset, 0),

    vec2(0, yOffset),
    vec2(xOffset, 0),
    vec2(xOffset, yOffset)]

//left_up -> left_down
//left_down -> right_down
//right_down -> right_up
//right_up -> left_up

let left_up = vec2(xOffset, yOffset*2)
let right_down = vec2(2*xOffset, yOffset)

let left_down = vec2(xOffset, yOffset)
let right_up = vec2(2*xOffset, yOffset*2)




function rotateClockwise(left_up, left_down, right_down, right_up){
    let [lu, ld, rd, ru] = [left_up, left_down, right_down, right_up]
    if (arguments.length == 1){ //array of 6 points
        let arr = arguments[0];

        lu = arr[0];
        ld = arr[1];
        rd = arr[2];
        ru = arr[5];

        [lu, ld, rd, ru] = [ld, rd, ru, lu];

        return [lu, ld, rd, lu, rd, ru]
    }
    return [ld, rd, ru, lu]
}
function rotateCounterClockwise(left_up, left_down, right_down, right_up){
    let [lu, ld, rd, ru] = [left_up, left_down, right_down, right_up]
    if (arguments.length == 1){ //array of 6 points
        let arr = arguments[0];

        lu = arr[0];
        ld = arr[1];
        rd = arr[2];
        ru = arr[5];
    }

    [lu, ld, rd, ru] =  rotateClockwise(...rotateClockwise(...rotateClockwise(lu, ld, rd, ru)))

    if (arguments.length == 1){ //array of 6 points
        return [lu, ld, rd, lu, rd, ru]
    }

    return [lu, ld, rd, ru]

}

[left_up, left_down, right_down, right_up] = rotateCounterClockwise(left_up, left_down, right_down, right_up);

let up = [
    left_up,
    left_down, 
    right_down,

    left_up,
    right_down,
    right_up
]


let back =  rotateClockwise(rotateClockwise([
    vec2(3*xOffset, yOffset),
    vec2(3*xOffset, 0),
    vec2(4*xOffset, 0),

    vec2(3*xOffset, yOffset),
    vec2(4*xOffset, 0),
    vec2(4*xOffset, yOffset)
]))


var uvs = [
    //face
    ...face,

    //right
    ...right,

    //down
    ...down,

    //up
    ...up,

    //back 
    ...back,

    //left
    ...left

]


export default class TexturedCube extends Cube{
    //TODO will this cause problems due to relative url loading?
    constructor(link){
        super();
        this.loaded = false;
        this.link = link
    }
    hasTexture(){ return true; }
    textureIsLoaded(){ return this.loaded; }
    getUvs(){ 
        return flatten(uvs); 
    }
    async loadTexture(){
        var image = new Image();
        image.src =  this.link;

        this.texture = image

        this.texture.onload = () => this.loaded = true; //! Possible scope issue?

        return new Promise((resolve, reject) => {
            this.texture.onload  =  () => (resolve("loaded"));
        })

    }
}