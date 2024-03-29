
import GeometricObject from "./GeometricObject.js";
import {flatten, subtract, cross, vec3} from "../Common/MV.js";

export default class Cube extends GeometricObject{
    points;
    constructor(){
        super();

        this.initCube();
    }

    initCube()
    {
        this.points = [];
        this.normals = [];
        this.quad( 1, 0, 3, 2 );
        this.quad( 2, 3, 7, 6 );
        this.quad( 3, 0, 4, 7 );
        this.quad( 6, 5, 1, 2 );
        this.quad( 4, 5, 6, 7 );
        this.quad( 5, 4, 0, 1 );
    }
    quad(a, b, c, d)
    {
        var vertices = [
            vec3( -0.5, -0.5,  0.5),
            vec3( -0.5,  0.5,  0.5),
            vec3(  0.5,  0.5,  0.5),
            vec3(  0.5, -0.5,  0.5),
            vec3( -0.5, -0.5, -0.5),
            vec3( -0.5,  0.5, -0.5),
            vec3(  0.5,  0.5, -0.5),
            vec3(  0.5, -0.5, -0.5)
        ];

        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[b]);
        var normal = vec3(cross(t1, t2));
     
     
        this.points.push(vertices[a]); 
        this.normals.push(normal); 
        this.points.push(vertices[b]); 
        this.normals.push(normal); 
        this.points.push(vertices[c]); 
        this.normals.push(normal);   
        this.points.push(vertices[a]);  
        this.normals.push(normal); 
        this.points.push(vertices[c]); 
        this.normals.push(normal); 
        this.points.push(vertices[d]); 
        this.normals.push(normal);   
    }

    getSolidVertices(){
        return flatten(this.getVertices());
    }
    //TODO should be lines not points
    getVertices(){
        return flatten(this.points);
    }

    getTrueNormals(){
        return flatten(this.normals);
    }
    getVertexNormals(){
        return flatten(this.normals);
    }

    normalFunction(){
        return flatten(this.normals);
    }

    calculateMesh(){
        this.vertices = flatten(this.points);
        this.normals = flatten(this.normals);

        this.numberOfVertices = this.normals.length / 3;

        //So that it isn't recalculated and buffered needlessly
        this.hasBeenUpdated = false;
    }
}