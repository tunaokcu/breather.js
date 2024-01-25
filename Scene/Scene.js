import {flatten, vec3} from "../Common/MV.js";
import {WebGLUtils} from "../Common/myWebGLUtils.js";
import {initShaders} from "../Common/initShaders.js";
import Camera from "./Camera.js";
import AggregateLight from "./AggregateLight.js";

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
        this.normalBuffer = this.gl.createBuffer();
        this.vPosition = this.gl.getAttribLocation( this.program, "vPosition" );
        this.vNormal = this.gl.getAttribLocation( this.program, "vNormal" );

        this.object = null;
        this.camera = new Camera(this.gl, this.program, -10, 10, 6, 0, 0.0,  -30.0, 30.0, 30.0, -30.0, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0))
        this.camera.setShaderMatrices(this.gl);
        this.lighting = new AggregateLight(this.gl, this.program);

        this.renderState = "solid";
        this.renderStateChanged = true;
    }


    calculateAndBuffer(){
        switch(this.renderState){
            case "mesh":
            case "points": this.calculateMesh(); break; 
            case "solid":   this.lighting.sendLightValues(this.gl, this.object);  this.calculateSolid(); break; //console.log(this.normals); this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.normals), this.gl.STATIC_DRAW); break;
        }

        let stateFloat =  Number(this.renderState ==="solid");
        this.gl.uniform1f( this.gl.getUniformLocation(this.program, "isSolid"), stateFloat);

        //!This is rendering stuff
        if (this.renderState === "solid"){
            this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.normalBuffer );
            this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(this.normals), this.gl.STATIC_DRAW );
            this.gl.vertexAttribPointer( this.vNormal, 4, this.gl.FLOAT, false, 0, 0 );
            this.gl.enableVertexAttribArray( this.vNormal );
        }

        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.vertexBuffer );
        this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(this.vertices), this.gl.STATIC_DRAW );
        this.gl.vertexAttribPointer( this.vPosition, 4, this.gl.FLOAT, false, 0, 0 );
        this.gl.enableVertexAttribArray( this.vPosition );


    }
    calculateMesh(){
        this.vertices =  this.object.getMeshVertices();
    }

    calculateSolid(){
        this.vertices = this.object.getSolidVertices();
        switch(this.normalType){
            case "vertexNormals": this.calculateVertexNormals(); break;
            case "trueNormals": this.calculateTrueNormals(); console.log("calculated true normals"); break;
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

        console.log(this.vertices)
        console.log(this.normals);

        switch(this.renderState){
            case "mesh": this.gl.drawArrays(this.gl.LINES, 0, this.vertices.length); break;
            case "points": this.gl.drawArrays(this.gl.POINTS,0, this.vertices.length); console.log("CALLED"); break;
            case "solid": this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length); break; 
        }   
    }
    
    updatePointLightPosition(newPosition){
        this.lighting.pointLight.setAndSendLightPosition(newPosition);
        this.render();
    }


    //No need to buffer vertex data, just render
    adjustCameraAndRender(){
        //? Is there even any advantage in updating matrices without setting them? If not why seperate these functions
        this.camera.updateMatrices();
        this.camera.setShaderMatrices(this.gl);

        this.render();
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
            this.render();
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
}
