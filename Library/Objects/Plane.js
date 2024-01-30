
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
        /*
        this.quad( 2, 3, 7, 6 );
        this.quad( 3, 0, 4, 7 );
        this.quad( 6, 5, 1, 2 );
        this.quad( 4, 5, 6, 7 );
        this.quad( 5, 4, 0, 1 );*/
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

        this.meshNotCalculated = false;
    }

    getSolidVertices(){
        return flatten(this.getVertices());
    }
    //TODO should be lines not points
    getVertices(){
        return this.points;
    }

    getVertexNormals(){
        return flatten(this.normals);
    }

    normalFunction(){
        return flatten(this.normals);
    }
    
    calculateEverythingAndStoreInMeshStructure(){
        this.vertices = flatten(this.points);
        this.normals = flatten(this.normals);

        //So that it isn't recalculated and buffered needlessly
        this.hasBeenUpdated = false;
    }
}