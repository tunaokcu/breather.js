import { flatten, vec3, cross, subtract, add} from "../Common/MV.js";


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

    /*
    sampleMesh(parametricSurface){
        this.getMesh_PATCHES_WITHOUT_WRAP_AROUND(parametricSurface)
    }*/
    
    calculate(object){
        this.calculateLatest(object);
        //this.calculateEverythingAndStoreInMeshStructure(object);
    }

    //Latest calculate method
    calculateLatest(object){
        let vertices = [];
        let normals = [];

        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){
            let uNext = u + object.uDelta //< object.uEnd ? u + object.uDelta : object.uStart;//u + object.uDelta - object.uEnd;

            for (let v = object.vStart; v < object.vEnd; v += object.vDelta){
                let vNext = v + object.vDelta //< object.vEnd ? v + object.vDelta : object.vStart;//v + object.vDelta - object.vEnd;

                if (uNext >= object.uEnd || vNext >= object.vEnd){ continue; }

                let v1 = object.parametricFunction(u, v)
                let v2 = object.parametricFunction(uNext, v)
                let v3 = object.parametricFunction(u, vNext)
                let v4 = object.parametricFunction(u, vNext);
                let v5 = object.parametricFunction(uNext, vNext);
                let v6 = object.parametricFunction(uNext, v);

                let n1 = object.normalFunction(u, v)
                let n2 = object.normalFunction(uNext, v)
                let n3 = object.normalFunction(u, vNext)
                let n4 = object.normalFunction(u, vNext);
                let n5 = object.normalFunction(uNext, vNext);
                let n6 = object.normalFunction(uNext, v);

                vertices.push(v1);
                vertices.push(v2);
                vertices.push(v3);
                vertices.push(v4)
                vertices.push(v5)
                vertices.push(v6)

                normals.push(n1);
                normals.push(n2);
                normals.push(n3);
                normals.push(n4)
                normals.push(n5)
                normals.push(n6)
            }
        }

        this.vertices = flatten(vertices)
        this.normals = flatten(normals);

    }

    calculateEverythingAndStoreInMeshStructure(object){
        this.mesh = new Mesh();

        let maxNum = 0;
        let jMax = 0;
        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){

            let j = 0;
            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                //In the first pass, specify vertices
                this.mesh.vertices.push([object.parametricFunction(u, v), vec3(0, 0, 0)]);

                j += 1;
                maxNum += 1;
            }

            jMax = j;
        }

        let i = 0;
        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){

            let j = 0;
            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){


                //Get indices
                let a = (i * jMax + j )% maxNum;
                let b = ((i+1)*jMax + j) % maxNum;
                let c = (i * jMax + j + 1) % maxNum;
                
                //Get surface normal
                let surfaceNormal =  calculateNormal(this.mesh.vertices[a][0],this.mesh.vertices[b][0], this.mesh.vertices[c][0])

                //Add surface normal to each vertex normal
                this.mesh.vertices[a][1] = add(this.mesh.vertices[a][1], surfaceNormal)
                this.mesh.vertices[b][1] = add(this.mesh.vertices[b][1], surfaceNormal)
                this.mesh.vertices[c][1] = add(this.mesh.vertices[c][1], surfaceNormal)


                //Add polygon
                this.mesh.polygons.push([a, b, c, surfaceNormal])
            


                //Get indices
                a = (i * jMax + j + 1) % maxNum;
                b = ((i+1)*jMax + j) % maxNum;
                c = ((i+1)*jMax + j + 1) % maxNum;
                
                //Get surface normal
                surfaceNormal =  calculateNormal(this.mesh.vertices[a][0],this.mesh.vertices[b][0], this.mesh.vertices[c][0])

                //Add surface normal to each vertex normal
                this.mesh.vertices[a][1] = add(this.mesh.vertices[a][1], surfaceNormal)
                this.mesh.vertices[b][1] = add(this.mesh.vertices[b][1], surfaceNormal)
                this.mesh.vertices[c][1] = add(this.mesh.vertices[c][1], surfaceNormal)

                //Add polygon
                this.mesh.polygons.push([a, b, c, surfaceNormal])

                j += 1;
            }

            i += 1
        }



        for (const polygon of this.mesh.polygons){
            let [i1, i2, i3, disregard] = polygon

            let v1, v2, v3;
            let n1, n2, n3;
            v1 = this.mesh.vertices[i1][0]
            n1 = this.mesh.vertices[i1][1]

            v2 = this.mesh.vertices[i2][0]
            n2 = this.mesh.vertices[i2][1]

            v3 = this.mesh.vertices[i3][0]
            n3 = this.mesh.vertices[i3][1]

            this.mesh.verticesToBuffer.push(v1);
            this.mesh.verticesToBuffer.push(v2);
            this.mesh.verticesToBuffer.push(v3);

            this.mesh.normalsToBuffer.push(n1);
            this.mesh.normalsToBuffer.push(n2);
            this.mesh.normalsToBuffer.push(n3);

        }

        this.vertices = flatten(this.mesh.verticesToBuffer);
        this.normals = flatten(this.mesh.normalsToBuffer);
    }

    //We still need to 
    getMesh_PATCHES_WITHOUT_WRAP_AROUND(object){

        let maxNum = 0;
        let jMax = 0;
        //On first pass, get vertices 
        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){

            let j = 0;
            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                //In the first pass, specify vertices
                this.mesh.vertices.push([object.parametricFunction(u, v), vec3(0, 0, 0), vec3(0, 0, 0)]);

                j += 1;
                maxNum += 1;
            }

            jMax = j;
        }

        let vertices = [];
        let normals = [];

        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){
            //let uPrev = u - object.uDelta //> object.uStart ? u - object.uDelta : object.uEnd;
            let uNext = u + object.uDelta //< object.uEnd ? u + object.uDelta : object.uStart;//u + object.uDelta - object.uEnd;

            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                //let vPrev = v - object.vDelta //> object.vStart ? u - object.vDelta : object.vEnd;
                let vNext = v + object.vDelta //< object.vEnd ? v + object.vDelta : object.vStart;//v + object.vDelta - object.vEnd;

                if (uNext >= object.uEnd || vNext >= object.vEnd){ continue; }

                let v1 = object.parametricFunction(u, v)
                let v2 = object.parametricFunction(uNext, v)
                let v3 = object.parametricFunction(u, vNext)
                let v4 = object.parametricFunction(u, vNext);
                let v5 = object.parametricFunction(uNext, vNext);
                let v6 = object.parametricFunction(uNext, v);

                let n1 = calculateNormal(v1, v2, v3);
                let n2 = calculateNormal(v4, v5, v6)

                vertices.push(v1);
                vertices.push(v2);
                vertices.push(v3);
                vertices.push(v4)
                vertices.push(v5)
                vertices.push(v6)

                normals.push(n1);
                normals.push(n1);
                normals.push(n1);
                normals.push(n2)
                normals.push(n2)
                normals.push(n2)
            }
        }

        this.vertices = flatten(vertices)
        this.normals = flatten(normals);
        
        this.hasBeenUpdated = false;
    }

    //Vertex normals
    getNormals(){
        return flatten(this.vertices.map((arr) => arr[1]))
    }

    getVertices(){
        console.log(this.vertices);
        let res = flatten(this.vertices.map((arr) => arr[0]))
        console.log(this.vertices);
        return res;
    }
    getIndices(){
        return flatten(this.polygons.map((arr) => (arr[0], arr[1], arr[2])))
    }
}

    //Ref: https://discourse.threejs.org/t/calculating-vertex-normals-after-displacement-in-the-vertex-shader/16989
   function calculateNormal(center, neighbor1, neighbor2){
        let tangent = subtract(neighbor1, center);
        let bitangent = subtract(neighbor2, center);
        
        return cross(tangent, bitangent); //No need to normalize, the vertex shader will handle that
    }