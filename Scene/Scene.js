import {flatten, vec3, translate, mult, mat4} from "../Common/MV.js";
import {WebGLUtils} from "../Common/myWebGLUtils.js";
import {initShaders} from "../Common/initShaders.js";
import Camera from "./Camera.js";
import AggregateLight from "./AggregateLight.js";
import Sphere from "../Objects/Sphere.js";
import SceneNode from "../Objects/Object Components/SceneNode.js";

const MAX_VERTICES = 10000000;

export default class Scene{
    canvas;
    gl;
    program;

    vertexBuffer; //pointer to the buffer 
    vPosition; //name of the variable in glsl
    normalBuffer; //same thing
    vNormal;

    camera;
    lighting;
    object;

    constructor(canvasId="gl-canvas", backgroundColor=[1.0, 1.0, 1.0, 1.0]){ this.init(canvasId, backgroundColor);}

    init(canvasId, backgroundColor){
        this.normalType = "vertexNormals";

        this.canvas = document.getElementById(canvasId);
        this.gl = WebGLUtils.setupWebGL( this.canvas );    
        if ( !this.gl ) { alert( "WebGL isn't available" ); }           

        this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );
        this.gl.clearColor( ...backgroundColor );   
    
        this.program = initShaders( this.gl, "vertex-shader", "fragment-shader" );
        this.gl.useProgram( this.program );   
    
        this.gl.enable(this.gl.DEPTH_TEST);

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.vertexBuffer );
        this.gl.bufferData(this.gl.ARRAY_BUFFER,MAX_VERTICES*4, this.gl.STATIC_DRAW );

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.normalBuffer );
        this.gl.bufferData(this.gl.ARRAY_BUFFER,MAX_VERTICES*3, this.gl.STATIC_DRAW );

        this.vPosition = this.gl.getAttribLocation( this.program, "vPosition" );
        this.vNormal = this.gl.getAttribLocation( this.program, "vNormal" );

        this.object = null;
        this.camera = new Camera(this.gl, this.program, -10, 10, 6, 0, 0.0,  -30.0, 30.0, 30.0, -30.0, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0))
        this.camera.setShaderMatrices(this.gl);
        this.lighting = new AggregateLight(this.gl, this.program);

        this.renderState = "solid";
        this.renderStateChanged = true;

        this.root = new SceneNode(); //Placeholder
        //TODO implement this and light nodes
        this.currentCamera = this.camera;//new CameraNode(new Camera(this.gl, this.program, -10, 10, 6, 0, 0.0,  -30.0, 30.0, 30.0, -30.0, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0)))
    }

    treeRenderMultiLevel(){
        //Clear
        this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);    

        //Enable 
        this.gl.vertexAttribPointer( this.vPosition, 4, this.gl.FLOAT, false, 0, 0 );
        this.gl.enableVertexAttribArray( this.vPosition );

        //Send camera
        this.currentCamera.setProjectionMatrix(this.gl);

        //Initialize global vertex offset to 0
        this.offset = 0;

        //Traverse tree
        for (const childNode of this.root.nodes){
            this.treeTraversal(childNode, this.currentCamera.modelViewMatrix)
        }
    }

    treeTraversal(node, MV){
        if (node != null || node != undefined){
            //Draw only if the node has an object. Nodes can also just be containers for other nodes.
            if (node.object != null || node.object != undefined){ 
                console.log("rendering", node)
                this.renderNode(node, node.getInstanceMatrix(MV));}
            
            for (const childNode of node.nodes){                
                this.treeTraversal(childNode, node.getModelViewMatrix(MV))
            }
        }
    }

    renderNode(node, MV){
        //Send light values to GPU  
        this.lighting.sendLightValues(this.gl, node.object);

        //Send MV
        this.gl.uniformMatrix4fv( this.gl.getUniformLocation( this.program, "modelViewMatrix" ), false, flatten(MV) );

        //Calculate the vertices and store them in the node
        if (node.object.vertices == null || node.object.vertices == undefined){
            node.object.vertices = flatten(node.object.getSolidVertices());
        }

        //Calculate the normals and store them in the node
        if (node.object.normals == null || node.object.normals == undefined){
            //TODO implement vertex/true normal toggling 
            if (this.normalType == "vertexNormals"){
                node.object.normals = node.object.getVertexNormals(); 
            } 
            else if (this.normalType == "trueNormals"){
                node.object.normals = node.object.getTrueNormals();
            }
        }


        //Buffer ONLY if they are not buffered already
        if (node.offset == null || node.offset == undefined){
            console.log(node.object.vertices)
            node.offset = node.object.vertices.length / 4; //Assuming flattened vertices

            //!THE ORDER MATTERS... WHY? (if we buffer the vertices first then the normals it doesn't work)
            //Buffer the normals
            this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.normalBuffer );
            this.gl.bufferSubData( this.gl.ARRAY_BUFFER, 3*this.offset, flatten(node.object.normals));
            this.gl.vertexAttribPointer( this.vNormal, 3, this.gl.FLOAT, false, 0, 0 );
            this.gl.enableVertexAttribArray( this.vNormal );


            //Buffer the vertices
            this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.vertexBuffer );
            this.gl.bufferSubData( this.gl.ARRAY_BUFFER, 4*this.offset, flatten(node.object.vertices));
            this.gl.vertexAttribPointer( this.vPosition, 4, this.gl.FLOAT, false, 0, 0 );
            this.gl.enableVertexAttribArray( this.vPosition );
        }
    


        //Draw
        console.log(node, "\n", node.offset);
        this.gl.drawArrays(this.gl.TRIANGLES, this.offset, node.offset);
        
        //Update offset
        this.offset += node.object.vertices.length;
    }


    calculateAndBuffer(){
        switch(this.renderState){
            case "mesh":
            case "points": this.calculateMesh(); break; 
            case "solid":   this.lighting.sendLightValues(this.gl, this.object);  this.calculateSolid(); break; // this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.normals), this.gl.STATIC_DRAW); break;
        }

        let stateFloat =  Number(this.renderState ==="solid");
        this.gl.uniform1f( this.gl.getUniformLocation(this.program, "isSolid"), stateFloat); 

        //!This is rendering stuff
        if (this.renderState === "solid"){
            this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.normalBuffer );
            this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(this.normals), this.gl.STATIC_DRAW );
            this.gl.vertexAttribPointer( this.vNormal, 3, this.gl.FLOAT, false, 0, 0 ); //!IMPORTANT BUG! normals were kept in vec3 format but sent 4 by 4 
            this.gl.enableVertexAttribArray( this.vNormal );
        }
        let allVertices = [...flatten(this.vertices)].concat(...flatten(this.lightSphereVertices));

        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.vertexBuffer );
        this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(allVertices), this.gl.STATIC_DRAW );
        this.gl.vertexAttribPointer( this.vPosition, 4, this.gl.FLOAT, false, 0, 0 );
        this.gl.enableVertexAttribArray( this.vPosition );


    }


    calculateSolid(){
        this.vertices = this.object.getSolidVertices();
        switch(this.normalType){
            case "vertexNormals": this.calculateVertexNormals(); break;
            case "trueNormals": this.calculateTrueNormals(); break;
        }
    }

    calculateTrueNormals(){
        //? Why
        this.normals = this.object.getTrueNormals();
        return;
            
        this.solidColumns = this.normals.length;
        
        let temp = this.normals;
        this.normals = [];

        for (let i = 0; i < temp.length; i++) {
            for (let j = 0; j < temp[0].length; j++) {
                this.normals.push(temp[i][j]);
            }
        }
    }
    calculateVertexNormals(){
        this.normals =  this.object.getVertexNormals(); 
    }

    render(){
        this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);    

        switch(this.renderState){
            case "mesh": this.gl.drawArrays(this.gl.LINES, 0, this.vertices.length); break;
            case "points": this.gl.drawArrays(this.gl.POINTS,0, this.vertices.length); break;
            case "solid": this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length); break; 
        }   

        //Experimental
        this.showLight();
    }
    
    lightSphere = new Sphere(0, 2*Math.PI, 30*Math.PI/360, 0, 2*Math.PI, 30*Math.PI/360, 0.1);
    lightSphereVertices = this.lightSphere.getSolidVertices();

    showLight(){
        /*
        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.normalBuffer );
        this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(), this.gl.STATIC_DRAW );
        this.gl.vertexAttribPointer( this.vNormal, 3, this.gl.FLOAT, false, 0, 0 ); //!IMPORTANT BUG! normals were kept in vec3 format but sent 4 by 4 
        this.gl.enableVertexAttribArray( this.vNormal );*/

        //Buffer light sphere vertices
        /*
        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.lightSphereBuffer );
        this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(this.lightSphereVertices), this.gl.STATIC_DRAW );
        this.gl.vertexAttribPointer( this.vPosition, 4, this.gl.FLOAT, false, 0, 0 );
        this.gl.enableVertexAttribArray( this.vPosition );
        */
        //Translate sphere by light location
        let lightPosition = this.lighting.pointLight.lightPosition;
        let mv = this.camera.modelViewMatrix; 
        let translation = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
        let mvFinal = mult(mv, translation);


        //Send to gpu
        this.gl.uniformMatrix4fv( this.gl.getUniformLocation( this.program, "modelViewMatrix" ), false, flatten(mvFinal) );


        //Draw everything
        this.gl.drawArrays(this.gl.TRIANGLES, this.vertices.length, this.lightSphereVertices.length);

        //Fix mv 
    }
    

    updatePointLightPosition(newPosition){
        this.lighting.pointLight.setAndSendLightPosition(newPosition);
        this.treeRenderMultiLevel();
    }


    //No need to buffer vertex data, just render
    adjustCameraAndRender(){
        //? Is there even any advantage in updating matrices without setting them? If not why seperate these functions
        this.camera.updateMatrices();
        this.camera.setShaderMatrices(this.gl);

        this.treeRenderMultiLevel();
    }

    zoomIn(){
        this.camera.zoomIn();
        this.adjustCameraAndRender();
    }
    zoomOut(){
        this.camera.zoomOut();
        this.adjustCameraAndRender();
    }

    updateTheta(newAngle){
        this.camera.theta = newAngle;
        this.adjustCameraAndRender();
    }
    updatePhi(newAngle){
        this.camera.phi = newAngle;
        this.adjustCameraAndRender();
    }
    
    updateRenderState(renderState){
        if (this.renderState != renderState){
            this.renderState = renderState;
            this.calculateAndBuffer();
            this.render();            
        }
    }

    renderUnconditional(){
        this.calculateAndBuffer();
        this.render();
    }

    //toggles correctly
    toggleBumpMapping(){
        this.object.bumpMappingOn = !this.object.bumpMappingOn;
        if (this.renderState === "solid"){
            this.renderUnconditional();
        }   
     }
    
    incrementLightLocation(x, y, z){
        this.lighting.pointLight.incrementLightLocation(this.gl, x, y, z);
        if (this.renderState === "solid"){
            this.treeRenderMultiLevel();
        }
    }

    toggleTrueNormals(){
        if(this.normalType = "vertexNormals"){
            this.normalType = "trueNormals";
        }else{
            this.normalType = "vertexNormals";
        }

        if (this.renderState === "solid"){
            this.renderUnconditional();
        }   
    }

    /*
    calculateMesh(){
        this.vertices =  this.object.getMeshVertices();
    }
    */

}
