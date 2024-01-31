import {flatten, vec3, translate, mult} from "../Common/MV.js";
import {WebGLUtils} from "../Common/myWebGLUtils.js";
import {initShaders} from "../Common/initShaders.js";
import Camera from "./Camera.js";
import AggregateLight from "./AggregateLight.js";
import Sphere from "../Objects/Sphere.js";
import SceneNode from "../Objects/SceneNode.js";
import Shader from "./Shader/Shader.js";

const MAX_TRIANGLES = 61204;//61204 for a single breather surface
const MAX_VERTICES =  MAX_TRIANGLES*3;
const ELEMENT_SIZE = 4;
const NORMAL_SIZE = 3*ELEMENT_SIZE;
const VERTEX_SIZE = 3*ELEMENT_SIZE;


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

    constructor(canvasId="gl-canvas", backgroundColor=[1.0, 1.0, 1.0, 1.0]){ this.init(canvasId, backgroundColor);}

    init(canvasId, backgroundColor){
        //Setup
        this.canvas = document.getElementById(canvasId);
        this.gl = WebGLUtils.setupWebGL( this.canvas );    
        if ( !this.gl ) { alert( "WebGL isn't available" ); }           

        this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );
        this.gl.clearColor( ...backgroundColor );   
        
        
        this.shader = new Shader("vertex-shader", "fragment-shader");
        this.shader.loadShaders();
        //TODO can probably do this in Shader
        this.program = initShaders( this.gl, "vertex-shader", "fragment-shader" );
        this.gl.useProgram( this.program );   
    
        //Create and initialize vertex and normal bufferS
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, MAX_VERTICES*VERTEX_SIZE, this.gl.DYNAMIC_DRAW);

        this.vPosition = this.gl.getAttribLocation( this.program, "vPosition" );
        this.gl.vertexAttribPointer( this.vPosition, 3, this.gl.FLOAT, false, 0, 0 );
        this.gl.enableVertexAttribArray( this.vPosition );

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, MAX_VERTICES*NORMAL_SIZE, this.gl.DYNAMIC_DRAW);

        this.vNormal = this.gl.getAttribLocation( this.program, "vNormal" );
        this.gl.vertexAttribPointer( this.vNormal, 3, this.gl.FLOAT, false, 0, 0 ); 
        this.gl.enableVertexAttribArray( this.vNormal );

        //Create and send projection matrix
        /*The model view matrix of the camera will be multiplied with that of each object before being sent, so only the projection matrix is
        sent in setup*/
        this.camera = new Camera(this.gl, this.program, -10, 10, 6, 0, 0.0,  -30.0, 30.0, 30.0, -30.0, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0))
        this.camera.setProjectionMatrix(this.gl);

        //Set current camera
        //!NOTE: as of now there is no support for multiple cameras to switch to and from. But this feature is planned.
        this.currentCamera = this.camera;

        //Create lighting. Do not send anything yet, since lighting will be applied per object according to the object's material
        this.lighting = new AggregateLight(this.gl, this.program);

        //Enable depth test
        this.gl.enable(this.gl.DEPTH_TEST);
        
        //Set renderState and normalType.
        //!NOTE: changing render state and normal type is not supported as of yet. Only true normals are avaialble. Vertex normals are problematic right now. 
        this.renderState = "solid";
        this.normalType = "trueNormals";

        //Create scene root
        this.root = new SceneNode(); 

        //Create placeholder texture 
        this.placeholderTexture = this.gl.createTexture();

        //Disable texture
        this.disableTexture(); 

        //Texture buffers
        this.uvBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);

        this.uvPosition = this.gl.getAttribLocation(this.program, "a_texcoord");
        this.gl.vertexAttribPointer(this.uvPosition, 2, this.gl.FLOAT, false, 0, 0) ;
        this.gl.enableVertexAttribArray(this.uvPosition); 

        //Texture settings(this makes it so that the texture is not flipped upside down)
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    }

    WHITE = new Uint8Array([255, 255, 255, 255]);
    //Disable by sending WHITE
    disableTexture(){
        let gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, this.placeholderTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.WHITE);
    }

    renderScene(){
        //Clear
        this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);    

        //Set offset to zero before traversing
        this.globalOffset = 0;

        //Traverse tree
        for (const childNode of this.root.nodes){
            this.traverseTreeAndRender(childNode, this.currentCamera.modelViewMatrix)
        }
    }

    traverseTreeAndRender(node, MV){
        if (node != null || node != undefined){
            //Draw only if the node has an object. Nodes can also just be containers for other nodes.
            if (node.object != null || node.object != undefined){ this.renderNode(node, node.getInstanceMatrix(MV));}
            
            for (const childNode of node.nodes){                
                this.traverseTreeAndRender(childNode, node.getModelViewMatrix(MV))
            }
        }
    }

    drawTexture(model){
        let gl = this.gl;
        
        // Bind texture
        gl.bindTexture(gl.TEXTURE_2D, this.placeholderTexture);

        // Draw texture
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, model.texture);

        if (imageIsPowerOfTwo(model.texture)){
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        } else{
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, this.uvBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, model.getUvs(), gl.DYNAMIC_DRAW);
    }

    //TODO fix
    async renderNode(node, MV){
        if (node.object.hasTexture()){
            if (!node.object.textureIsLoaded()){
                node.object.loadTexture().then(() => this.drawTexture(node.object)) //TODO somehow make this wait without cascading awaits 
            }
            else{
                this.drawTexture(node.object);
            }
        }

        
        //Send light values to GPU  
        this.lighting.sendLightValues(this.gl, node.object);

        //Send MV
        this.gl.uniformMatrix4fv( this.gl.getUniformLocation( this.program, "modelViewMatrix" ), false, flatten(MV) );


        //When to rebuffer? When mesh is either 1) Not calculated yet 2) Calculated but not buffered(maybe we ran out of space) 3) Mesh parameters have been changed
        if (node.object.meshUpdated || node.object.meshNotCalculated){
            node.object.calculateMesh();
        }
        if (node.object.meshNotBuffered){
            let normals, vertices;

            
            //Only one case for now
            switch(this.normalType){
                case "trueNormals": 
                    normals = node.object.getTrueNormals();
                    break;
            }

            vertices = node.object.getVertices();

            //Buffer the normals
            this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.normalBuffer );
            this.gl.bufferSubData( this.gl.ARRAY_BUFFER, this.globalOffset*NORMAL_SIZE, normals);

            //Buffer the vertices
            this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.vertexBuffer );
            this.gl.bufferSubData( this.gl.ARRAY_BUFFER, this.globalOffset*VERTEX_SIZE, vertices);

    
        }

        
        //TODO ascertain
        //This MIGHT actually be the number of triangles, not the number of vertices
        let n = node.object.numberOfVertices;
              
        //Draw
        //Request frame here
        //Not here.. if you do it here only one object will be drawn for some reason
        //TODO figure out where.. we have to do it somewhere right?
        this.gl.drawArrays(this.gl.TRIANGLES, this.globalOffset, n);
        
        //Add to global offset
        this.globalOffset += n;

        //Disable texture for the next object
        if (node.object.hasTexture()){
            this.disableTexture();
        }
    }


    updatePointLightPosition(newPosition){
        this.lighting.pointLight.setAndSendLightPosition(newPosition);
        this.safeRender()
    }


    //This function is like this for now.
    safeRender(){
        this.renderScene();
    }

    //Camera controls
    zoomIn(){
        this.currentCamera.zoomIn(this.gl); 
        this.safeRender()
    }
    zoomOut(){
        this.currentCamera.zoomOut(this.gl);
        this.safeRender();
    }

    rotateCamera(angle){
        this.currentCamera.rotate(this.gl, angle);
        this.safeRender();    
    }


    //Light position change
    incrementLightLocation(x, y, z){
        this.lighting.pointLight.incrementLightLocation(this.gl, x, y, z);
        if (this.renderState === "solid"){
            this.safeRender();
        }
    }

    /*//! Planning:
        Imagine if we switched to vertex/index arrays and gl.drawElements

        To draw points we just need to buffer vertices(already buffered) and use gl.POINTS -> issue: each point will be drawn 4 times... this might be an issue(probably only in terms of performance)
        To draw a wireframe(rename mesh with wireframe, it's confusing) we need to change what we are buffering though

    */
    //Old code

    calculateAndBuffer(){
        switch(this.renderState){
            case "mesh":
            case "points": this.calculateMesh(); break; 
            case "solid":   this.lighting.sendLightValues(this.gl, this.object);  this.calculateSolid(); break; // this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.normals), this.gl.STATIC_DRAW); break;
        }

        let stateFloat =  Number(this.renderState ==="solid");
        this.gl.uniform1f( this.gl.getUniformLocation(this.program, "isSolid"), stateFloat); 

        if (this.renderState === "solid"){
            this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.normalBuffer );
            this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(this.normals), this.gl.STATIC_DRAW );

        }
        let allVertices = [...flatten(this.vertices)].concat(...flatten(this.lightSphereVertices));

        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.vertexBuffer );
        this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(allVertices), this.gl.STATIC_DRAW );



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

    //lightSphere = new Sphere(0, 2*Math.PI, 30*Math.PI/360, 0, 2*Math.PI, 30*Math.PI/360, 0.1);
    //lightSphereVertices = this.lightSphere.getSolidVertices();
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
        let mv = this.currentCamera.modelViewMatrix; 
        let translation = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
        let mvFinal = mult(mv, translation);


        //Send to gpu
        this.gl.uniformMatrix4fv( this.gl.getUniformLocation( this.program, "modelViewMatrix" ), false, flatten(mvFinal) );


        //Draw everything
        this.gl.drawArrays(this.gl.TRIANGLES, this.vertices.length, this.lightSphereVertices.length);

        //Fix mv 
    }
    /*

        
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
    */
    /*
    calculateMesh(){
        this.vertices =  this.object.getMeshVertices();
    }
    */

}

function imageIsPowerOfTwo(image){
    return isPowerOf2(image.width) && isPowerOf2(image.height)
}
   
//Source: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
    }