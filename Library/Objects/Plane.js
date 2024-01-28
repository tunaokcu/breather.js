
import GeometricObject from "./GeometricObject.js";
import {flatten, subtract, cross, vec3, vec4} from "../Common/MV.js";

//Should extend GeometricObject or something of the sort(not high priority, not even relevant to the assignment)
export default class Cube extends GeometricObject{
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
            vec4( -0.5, -0.5,  z, 1.0 ), //0 leftdown
            vec4( -0.5,  0.5,  z, 1.0 ), //1 leftup
            vec4(  0.5,  0.5,  z, 1.0 ), //2 rightup
            vec4(  0.5, -0.5,  z, 1.0 ) //3 rightdown
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

    getSolidVertices(){
        return this.getVertices();
    }
    //TODO should be lines not points
    getVertices(){
        return this.points;
    }

    getVertexNormals(){
        return this.normals;
    }
}