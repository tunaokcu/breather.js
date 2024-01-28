import Material from "./Material.js";

/*  The code below examplifies a makeshift abstract class. 
  
    The first portion is for ensuring a pure GeometricObject is never created. This is accomplished by checking whether the constructor for this class is ever called directly(superconstructor calls from children notwhitstanding).
    
    The second portion is for ensuring the class implementing this abstract class implements the necessary methods.
    
    The third portion is for ensuring the class has its necessary properties. One example is the material property. We initialize it directly since we will get the default material settings 
    when we do, and we can allow the implementing class to set the material as required.
*/
export default class GeometricObject{
    constructor(){
        //1st
        if(this.constructor == GeometricObject) {
            throw new Error("Class is of abstract type and can't be instantiated");
        }
        
        //2nd
        /*
        if(this.getMeshVertices == undefined) {
            throw new Error("getMeshVertices method must be implemented");
        }
        if(this.getSolidVertices == undefined) {
            throw new Error("getSolidVertices method must be implemented");
        }
        
        
        if(this.getVertexNormals == undefined) {
            throw new Error("getVertexNormals method must be implemented");
        }*/
        
        //3rd
        this.material = new Material();
        //TODO a potential are of improvement is to also add a Texture object. This is probably pretty much required for our assignment anyways.
        //TODO, setColor, etc
        //this.texture = new Texture();
        self.bumpMappingOn = false;
    }

    //No texture by default
    hasTexture(){
        return false;    
    }
}