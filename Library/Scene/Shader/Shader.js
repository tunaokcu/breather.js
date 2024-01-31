

export default class Shader{
    vertexShader = `
    precision mediump float;

    //   TODO FIX LATER//https://perso.univ-lyon1.fr/jean-claude.iehl/Public/educ/GAMA/2007/normal_transforms.html
    //uniform mat4 normalMV;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    attribute vec3 vPosition;

    attribute vec3 vNormal;
    //varying vec3 varyingNormal;
    /*
    uniform mat3 vNormals -> vNormal1, vNormal2, vNormal3
    */


    // texture coordinates per vertex
    attribute vec2 a_texcoord;
    varying vec2 v_texcoord;

    //Added
    uniform float isSolid;

    uniform vec4 ambientProduct, diffuseProduct, specularProduct;
    uniform vec4 lightPosition;
    uniform float shininess;  
    varying vec4 fColor;

    void main(){
        vec4 wPosition = vec4(vPosition.x, vPosition.y, vPosition.z, 1.0);
        gl_Position = projectionMatrix*modelViewMatrix*wPosition;

        //mat4 invertedMV = invert(modelViewMatrix);
        //mat4 normalMV = transpose(invertedMV);


        //gl_PointSize = 5.0;
        //varyingNormal = vNormal;

        //ADDED lighting code
        vec3 pos = -(modelViewMatrix * wPosition).xyz;  
        vec3 light = lightPosition.xyz;
        vec3 L = normalize( light - pos );  
        vec3 E = normalize( -pos );
        vec3 H = normalize( L + E );
        vec4 NN = vec4(normalize(vNormal),0);
        // Transform vertex normal into eye coordinates
        vec3 N = normalize( (modelViewMatrix*NN).xyz);
        // Compute terms in the illumination equation
        vec4 ambient = ambientProduct;

        float Kd = max( dot(L, N), 0.0 );
        vec4  diffuse = Kd*diffuseProduct;

        float Ks = pow( max(dot(N, H), 0.0), shininess );
        vec4  specular = Ks * specularProduct;
        
        if( dot(L, N) < 0.0 ) {
        specular = vec4(0.0, 0.0, 0.0, 1.0);
        } 

        fColor = ambient + diffuse +specular;
        fColor.a = 1.0;
    
        // per vertex texture coordinates are passed to the fragment shader
        v_texcoord = a_texcoord;
    // per vertex texture coordinates are passed to the fragment shader
    //v_texcoord = a_texcoord;
    //vHasTexture = aHasTexture;

    }
    `
    fragmentShader = `
    precision mediump float;

    varying vec4 fColor;
    //varying vec3 varyingNormal;

    // per fragment texture coordinates that come from the vertex shader
    varying vec2 v_texcoord;

    // uniform texture that contains the image
    uniform sampler2D u_texture;

    void main(){
        gl_FragColor = texture2D(u_texture, v_texcoord);

        //Color ONLY if this is white, i.e untextured.
        //This iteration of the shader will only have flat shaded textured objects.
        if (texture2D(u_texture, v_texcoord) == vec4(1.0, 1.0, 1.0, 1.0)){
        gl_FragColor *= fColor;
        }
    }
    `
    constructor(vertexShaderId, fragmentShaderId){
        this.vertexElem = document.scripts.namedItem(vertexShaderId);
        this.fragmentElem = document.scripts.namedItem(fragmentShaderId);
    }

    //We should probably trigger a rerender after a shader load
    loadShaders(){
        this.loadVertexShader();
        this.loadFragmentShader();
    }

    loadVertexShader(){
        this.vertexElem.text = this.vertexShader;
    }
    loadFragmentShader(){
        this.fragmentElem.text = this.fragmentShader;

    }
}