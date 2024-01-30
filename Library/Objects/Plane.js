
import GeometricObject from "./GeometricObject.js";
import {flatten, subtract, cross, vec3} from "../Common/MV.js";

export default class Plane extends GeometricObject{
    points;
    constructor(){
        super();

        this.initPlane();
    }

    initPlane()
    {
        this.points = [];
        this.normals = [];
        this.quad( 1, 0, 3, 2 );
    }
    quad(a, b, c, d)
    {
        let z = 0
        var vertices = [
            vec3( -0.5, -0.5,  z ), //0 leftdown
            vec3( -0.5,  0.5,  z ), //1 leftup
            vec3(  0.5,  0.5,  z ), //2 rightup
            vec3(  0.5, -0.5,  z ) //3 rightdown
        ];

        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[b]);
        var normal = vec3(cross(t1, t2));
     
        this.points.push(vertices[a]); //leftup
        this.normals.push(normal); 
        this.points.push(vertices[b]); //leftdown
        this.normals.push(normal); 
        this.points.push(vertices[c]); //rightdown
        this.normals.push(normal);   
        this.points.push(vertices[a]);  //leftup
        this.normals.push(normal); 
        this.points.push(vertices[c]); //rightdown
        this.normals.push(normal); 
        this.points.push(vertices[d]); //rightup
        this.normals.push(normal);   
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