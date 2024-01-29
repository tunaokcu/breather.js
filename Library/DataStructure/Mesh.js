import { flatten } from "../Common/MV.js";

//We need a way to keep track of neighboring polygons, etc for normal stuff
export default class Mesh{
    constructor(){
        this.polygons = [];//each polygon is a size 4 array containing 
                                //3 indices to the vertices list(i.e. 3 pointers to vertices)
                                //1 surface normal calculated from the 3 vertices
                            /*example assignment:
                                this.polygons[0] = [0, 1, 2, vec3(0,0,0)] //assign first 3 vertices to the first polygon
                                this.polygons[0][3] = calculateNormal(this.vertices[this.polygons[0][0]],this.vertices[this.polygons[0][1]],this.vertices[this.polygons[0][2]]) 
                            */
        this.vertices = []; //each element in the vertex array is a size 2 array containing 
                                //1 vec3, the position of the vertex
                                //1 vec3, the vertex normal calculated from every polygon this vertex is adjacent to
                            /*example assignment:
                                this.vertices[0] = [object.parametricEquation(u,v), vec3(0,0,0)];
                                
                                //after polygons are calculated... or while we are calculating them?
                                for (const polygon of this.polygons){
                                    let [i1, i2, i3, surfaceNormal] = polygon;
                                    
                                    this.vertices[i1][1] = add(this.vertices[i1][1], surfaceNormal)
                                    this.vertices[i2][1] = add(this.vertices[i2][1], surfaceNormal)
                                    this.vertices[i3][1] = add(this.vertices[i3][1], surfaceNormal)

                                }
                            
                            */


        this.verticesToBuffer = [];
        this.normalsToBuffer = [];
    }

    //Vertex normals
    getNormals(){
        return flatten(this.vertices.map((arr) => arr[1]))
    }

    getVertices(){
        return flatten(this.vertices.map((arr) => arr[0]))
    }
    getIndices(){
        return flatten(this.polygons.map((arr) => (arr[0], arr[1], arr[2])))
    }
}