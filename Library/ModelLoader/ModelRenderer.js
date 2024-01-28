import { vec3 } from "../Common/MV.js";
import {WebGLUtils} from "../Common/myWebGLUtils.js";
import {initShaders} from "../Common/initShaders.js";
import Camera from "../Scene/Camera.js";
import AggregateLight from "../Scene/AggregateLight.js";
import Material from "../Objects/Material.js";

export default class ModelRenderer{
    constructor(canvasName="canvas"){
        let canvas = document.getElementById(canvasName);
        let gl = WebGLUtils.setupWebGL( canvas );    
        if ( !gl ) { alert( "WebGL isn't available" ); }     
        
        let backgroundColor=[1.0, 1.0, 1.0, 1.0];
        gl.clearColor( ...backgroundColor );  
        gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );

  
        let program = initShaders( gl, "vertex-shader", "fragment-shader" );
        gl.useProgram( program );  
        gl.enable(gl.DEPTH_TEST);

        //Init buffers
            // Texture
            // here we create buffer and attribute pointer for texture coordinates
            this.uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
                    
            // a_texcoord is the name of the attribute inside vertex shader
            this.uvPosition = gl.getAttribLocation(program, "a_texcoord");

            // each attribute is made of 2 floats
            gl.vertexAttribPointer(this.uvPosition, 2, gl.FLOAT, false, 0, 0) ;
            gl.enableVertexAttribArray(this.uvPosition); 


            // Vertex 
            this.vBuffer = gl.createBuffer();    
            gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
            
            this.vPosition = gl.getAttribLocation( program, "vPosition" );
            gl.vertexAttribPointer( this.vPosition, 3, gl.FLOAT, false, 0, 0 );
            gl.enableVertexAttribArray( this.vPosition );

            // Normals
            this.nBuffer = gl.createBuffer();    
            gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
            
            this.nPosition = gl.getAttribLocation( program, "vNormal" );
            gl.vertexAttribPointer( this.nPosition, 3, gl.FLOAT, false, 0, 0 );
            gl.enableVertexAttribArray( this.nPosition );

        //Camera
        this.camera = new Camera(gl, program, -10, 10, 6, 0, 0.0,  -30.0, 30.0, 30.0, -30.0, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0))
        this.camera.theta += Math.PI / 2
        //this.camera.phi += 1;
        for (let i = 0; i < 4; i++){
            this.camera.zoomIn();
        }
        this.camera.updateMatrices();
        this.camera.setShaderMatrices(gl);
    
        //Light
        this.lighting = new AggregateLight(gl, program);

        //Save
        this.gl = gl;
    }

    drawTexture(model){
            let gl = this.gl;
            
            // create and bind texture
            let texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);



            // Draw texture
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, model.texture);

            if (imageIsPowerOfTwo(model.texture)){
                gl.generateMipmap(gl.TEXTURE_2D);
            } else{
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }

            console.log(flatten(model.trianglesTexture));

            gl.bindBuffer( gl.ARRAY_BUFFER, this.uvBuffer );
            gl.bufferData(gl.ARRAY_BUFFER, flatten(model.trianglesTexture), gl.STATIC_DRAW);
            gl.vertexAttribPointer( this.uvPosition, 2, gl.FLOAT, false, 0, 0 );
            gl.enableVertexAttribArray( this.uvPosition );
    }

    render(model){
        let gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.lighting.environmentLight.calculateAndSendProducts(gl, new Material());

        if (model.hasTexture()){
            this.drawTexture(model);
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(model.trianglesNormal), gl.STATIC_DRAW );
        gl.vertexAttribPointer( this.nPosition, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.nPosition );
 
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(model.trianglesVertex), gl.STATIC_DRAW );
        gl.vertexAttribPointer( this.vPosition, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.vPosition );

        console.log("rendered");
        this.rerender(model);
    }

    //Already buffered, just render
    rerender(model){
        let gl = this.gl; 

        gl.drawArrays( gl.TRIANGLES, 0, model.trianglesNormal.length * 3);
        
        //Additional: animation
        this.camera.theta += Math.PI / 180;
        this.camera.updateMatrices();
        this.camera.setShaderMatrices(gl);
        setTimeout(() => requestAnimationFrame(() => this.rerender(model)), 3);
        
    }

}

function imageIsPowerOfTwo(image){
 return isPowerOf2(image.width) && isPowerOf2(image.height)
}

//Source: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }

//Local flatten since the MV one isn't working for some reason
function flatten(arr){
    let res = [];
    for (const a of arr){
        res = res.concat(...a);
    }
    return new Float32Array(res);
}