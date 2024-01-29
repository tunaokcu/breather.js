import BreatherScene from "./Demonstration/BreatherScene.js";
import Cube from "./Library/Objects/Cube.js";
import Torus from "./Demonstration/Torus.js";

import Scene from "./Library/Scene/Scene.js";
import Breather from "./Demonstration/Breather.js";
import Sphere from "./Library/Objects/Sphere.js";
import Plane from "./Library/Objects/Plane.js";
import SceneNode from "./Library/Objects/SceneNode.js"

import Octopus from "./Demonstration/Octopus/Octopus.js";
import TexturedCube from "./Library/Objects/TexturedCube/TexturedCube.js";
import Hemisphere from "./Library/Objects/Hemisphere.js";

window.onload = () => {
    test();
}

function cubeTest(){
    let scene = new Scene();
    scene.root.nodes.push(new SceneNode(new Cube()));

    scene.safeRender();
    instantiateUI(scene);  
}
function test(){
    let breatherScene = new Scene();
    breatherScene.normalType = "trueNormals";

    let planeNode = new SceneNode(new Plane());
    planeNode.scaleBy = [10, 10, 10];
    planeNode.translateBy = [0 , 0, 3];

    let steve = new SceneNode(new TexturedCube("/Library/Objects/TexturedCube/steve-head.png"))
    breatherScene.root.nodes.push(steve);

    let sphereNode = new SceneNode(new Sphere());
    sphereNode.scaleBy = [2,2,2];//[0.3, 0.3, 0.3];
    sphereNode.translateBy = [5, 0, 0]
    sphereNode.rotateBy = [90, 1, 1]

    breatherScene.root.nodes.push(planeNode);
    breatherScene.root.nodes.push(sphereNode);
   // breatherScene.root.nodes.push(new Octopus());

    instantiateCharacterControls(breatherScene, steve);

    breatherScene.safeRender();
    instantiateUI(breatherScene);
}

//Test functions
function sphereTest(){
    let scene = new Scene();
    scene.root.nodes.push(new SceneNode(new Sphere()));

    scene.normalType = "trueNormals"

    scene.treeRenderMultiLevel();
    instantiateUI(scene);  
}
function breatherTest(){
    let scene = new Scene();
    scene.root.nodes.push(new SceneNode(new Breather()));

    for(let i = 0; i < 2; i++){
        scene.zoomIn();
    }
    scene.normalType = "trueNormals"

    scene.treeRenderMultiLevel();
    instantiateUI(scene);
}
function textureTest(){
    let scene = new Scene();
    scene.root.nodes.push(new SceneNode(new TexturedCube("/Library/Objects/TexturedCube/steve-head.png")));
    scene.treeRenderMultiLevel();
    instantiateUI(scene);  
}
function trueNormalTest(){
    let scene = new Scene();
    scene.root.nodes.push(new SceneNode(new Breather()));
    scene.normalType = "trueNormals";
    scene.treeRenderMultiLevel();
    instantiateUI(scene);  
}
function lightingTest(){
    let scene = new Scene();
    scene.root.nodes.push(new SceneNode(new Cube()));
    scene.treeRenderMultiLevel();
    instantiateUI(scene);
}
function hemisphereTest(){
    let scene = new Scene();
    scene.root.nodes.push(new SceneNode(new Hemisphere()));
    scene.treeRenderMultiLevel();
    instantiateUI(scene);
}



//Below are UI functions
//TODO should probably either set the values within the sliders to the values in the breather object or vice versa
//TODO specify that this is a sidebar for a breather scene
function instantiateSidebar(scene){
    document.getElementById("aa").addEventListener("input", (event) => scene.updateaa(parseFloat(event.target.value)));
    document.getElementById("u delta").addEventListener("input", (event) => scene.updateuDelta(parseFloat(event.target.value)));
    document.getElementById("v delta").addEventListener("input", (event) => scene.updatevDelta(parseFloat(event.target.value)));
    document.getElementById("u range").addEventListener("input", (event) => scene.updateuRange(parseFloat(event.target.value)));
    document.getElementById("v range").addEventListener("input", (event) => scene.updatevRange(parseFloat(event.target.value)));
}





function instantiateRenderButtons(scene){
    document.getElementById("mesh").addEventListener("click", () => scene.updateRenderState("mesh"));
    document.getElementById("solid").addEventListener("click", () => scene.updateRenderState("solid"));
    document.getElementById("points").addEventListener("click", () => scene.updateRenderState("points"));
}

//!This is a helper function
function degreesToRadians(degrees){
    return degrees * (Math.PI / 180.0);
}

let lastX, lastY, lastZ;
function instantiateCameraSliders(scene){
    let xElem = document.getElementById("x");
    let yElem = document.getElementById("y");
    let zElem = document.getElementById("z");

    lastX = parseInt(xElem.value);
    lastY = parseInt(yElem.value);
    lastZ = parseInt(zElem.value);

    xElem.addEventListener("input", (event) => xAxisSliderHandler(scene, parseInt(event.target.value)))
    yElem.addEventListener("input", (event) => yAxisSliderHandler(scene, parseInt(event.target.value)))    
    zElem.addEventListener("input", (event) => zAxisSliderHandler(scene, parseInt(event.target.value)))    
}

function xAxisSliderHandler(scene, newAngleInDegrees){
    let rot = newAngleInDegrees - lastX;
    lastX = newAngleInDegrees;

    scene.rotateCamera([rot, 0, 0]);
}
function yAxisSliderHandler(scene, newAngleInDegrees){
    let rot = newAngleInDegrees - lastY;
    lastY = newAngleInDegrees;

    scene.rotateCamera([0, rot, 0]);
}
function zAxisSliderHandler(scene, newAngleInDegrees){
    let rot = newAngleInDegrees - lastZ;
    lastZ = newAngleInDegrees;

    scene.rotateCamera([0, 0, rot]);
}

function instantiateZoomHandler(scene){
    document.addEventListener("wheel", (event) => zoomHandler(event, scene), {passive: false}); //the {passive: false} part is necessary for the zoomHandler to prevent default action
}

function instantiateBumpMappingButton(scene){
    document.getElementById("bumpMapping").addEventListener("click", () => scene.toggleBumpMapping());
}

function instantiateNormalToggle(scene){
    document.getElementById("toggleNormals").addEventListener("click", () => scene.toggleTrueNormals());
}

function instantiateUI(scene){
    instantiateCameraSliders(scene);
    instantiateZoomHandler(scene);
    instantiateSidebar(scene);
    instantiateRenderButtons(scene);
    // instantiateBumpMappingButton(scene);
    instantiateLightUI(scene);
    //instantiateNormalToggle(scene);
}

function instantiateCharacterControls(scene, charNode){
    document.addEventListener("keydown", (event) => keydownHandler(event, scene, charNode), false);
    document.addEventListener("keyup", (event) => keyupHandler(event, scene, charNode), false) //TODO
}

let speed = 0.3;
function keydownHandler(event, scene, charNode){
    var keyCode = event.keyCode;
    
    let dir;
    
    //Translation is very weird
    switch (keyCode) {
        case 68: //d
            dir = [-1, 0, 0]
            break;        
        case 83: //s
            dir = [0, 0, -1]
            break;
        case 65: //a
            dir = [1, 0, 0]
            break;
        case 87: //w
            dir = [0, 0, 1]
            break;
        default:
            return;
    }
    let offset = dir.map((coord) => coord*speed)

    charNode.translateBy = charNode.translateBy.map((e, i) => e + offset[i])
    scene.treeRenderMultiLevel();
}


//let intialMeasurement = 0;
function zoomHandler(event, scene){
    if (event.ctrlKey && event.deltaY != 0){
        event.preventDefault();

        let direction = event.deltaY < 0 ? "up" : "down";

        if (direction === "up"){
            scene.zoomIn();
        }
        else{
            scene.zoomOut();
        }
    }
}


function instantiateLightUI(scene){
    document.getElementById("x+").addEventListener("click", () => (scene.incrementLightLocation(1, 0, 0)));
    document.getElementById("x-").addEventListener("click", () => (scene.incrementLightLocation(-1, 0, 0)));

    document.getElementById("y+").addEventListener("click", () => (scene.incrementLightLocation(0, 1, 0)));
    document.getElementById("y-").addEventListener("click", () => (scene.incrementLightLocation(0, -1, 0)));

    document.getElementById("z+").addEventListener("click", () => (scene.incrementLightLocation(0, 0, 1)));
    document.getElementById("z-").addEventListener("click", () => (scene.incrementLightLocation(0, 0, -1)));
}