import GeometricObject from "./GeometricObject.js";
import {flatten, vec3, subtract, normalize, cross, negate, add} from "../Common/MV.js";
import Mesh from "../DataStructure/Mesh.js";
//import bump from "./BumpMapGenerator.JS" 

    

    

export default class ParametricSurface extends GeometricObject{
    constructor(uStart=0, uEnd=2*Math.PI, uDelta=2*Math.PI/360, vStart=0, vEnd=2*Math.PI, vDelta=2*Math.PI/360){
        super();
        this.uStart = uStart;
        this.uEnd = uEnd;
        this.uDelta = uDelta;

        this.vStart = vStart;
        this.vEnd = vEnd;
        this.vDelta = vDelta;
    
        if(this.constructor == this.parametricFunction) {
            throw new Error("Class is of abstract type and can't be instantiated");
        }

        //parametricFunction must be implemented. trueNormals is optional. The app will fall back on vertex normals.
        if(this.parametricFunction == undefined) {
            throw new Error("parametricFunction method must be implemented");
        }

    }


    //Indices are not good with more complex data apparently.
    calculateAndStoreIndexBasedMesh(){
        this.mesh = new Mesh();

        let object = this;

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
                let surfaceNormal =  this.calculateNormal(this.mesh.vertices[a][0],this.mesh.vertices[b][0], this.mesh.vertices[c][0])

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
                surfaceNormal =  this.calculateNormal(this.mesh.vertices[a][0],this.mesh.vertices[b][0], this.mesh.vertices[c][0])

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

        this.normals = this.mesh.getNormals();
        this.vertices = this.mesh.getVertices();
        this.indices = this.mesh.getIndices();
    
        /*
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

        }*/

        /*
        console.log("With indices")
        console.log(this.vertices);
        console.log(this.normals);
        console.log(this.vertices);
        */
        //So that it isn't recalculated and buffered needlessly
        this.hasBeenUpdated = false;
    }

    calculateEverythingAndStoreInMeshStructure(){
        this.mesh = new Mesh();

        let object = this;

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
                let surfaceNormal =  this.calculateNormal(this.mesh.vertices[a][0],this.mesh.vertices[b][0], this.mesh.vertices[c][0])

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
                surfaceNormal =  this.calculateNormal(this.mesh.vertices[a][0],this.mesh.vertices[b][0], this.mesh.vertices[c][0])

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

        //So that it isn't recalculated and buffered needlessly
        this.hasBeenUpdated = false;
    }
    //not working..
    experimentalVertexNormals(){
        let object = this;

        let surfaceNormals = {};

        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){
            let uNext = u + object.uDelta < object.uEnd ? u + object.uDelta : object.uStart;//u + object.uDelta - object.uEnd;

            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                let vNext = v + object.vDelta < object.vEnd ? v + object.vDelta : object.vStart;//v + object.vDelta - object.vEnd;

                let a = this.parametricFunction(u, v);
                let b = this.parametricFunction(uNext, v);
                let c = this.parametricFunction(u, vNext);
                let d = this.parametricFunction(uNext, vNext);

                if (!surfaceNormals.hasOwnProperty(a)){
                    surfaceNormals[a] = vec3(0,0,0);
                }
                if (!surfaceNormals.hasOwnProperty(b)){
                    surfaceNormals[b] = vec3(0,0,0);
                }        
                if (!surfaceNormals.hasOwnProperty(c)){
                    surfaceNormals[c] = vec3(0,0,0);
                }
                if (!surfaceNormals.hasOwnProperty(d)){
                    surfaceNormals[d] = vec3(0,0,0);
                }        

                
                function handle(a, b, c, obj){

                    surfaceNormals[a] = add(surfaceNormals[a], obj.calculateNormal(a, b, c))                    
                    surfaceNormals[a] = add(surfaceNormals[a], obj.calculateNormal(c, a, b))                    
                    surfaceNormals[a] = add(surfaceNormals[a], obj.calculateNormal(b, c, a))  

                    surfaceNormals[b] = add(surfaceNormals[b], obj.calculateNormal(a, b, c))                    
                    surfaceNormals[b] = add(surfaceNormals[b], obj.calculateNormal(c, a, b))                    
                    surfaceNormals[b] = add(surfaceNormals[b], obj.calculateNormal(b, c, a))
        

                    surfaceNormals[c] = add(surfaceNormals[c], obj.calculateNormal(a, b, c))                    
                    surfaceNormals[c] = add(surfaceNormals[c], obj.calculateNormal(c, a, b))                    
                    surfaceNormals[c] = add(surfaceNormals[c], obj.calculateNormal(b, c, a)) 
                }

                handle(a, b, c, this)            
                handle(c, b, d, this)

            }
        }

        let normals = [];
        //With sruface normals calculated, just associate them with the vertices
        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){
            let uNext = u + object.uDelta < object.uEnd ? u + object.uDelta : object.uStart;//u + object.uDelta - object.uEnd;

            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                let vNext = v + object.vDelta < object.vEnd ? v + object.vDelta : object.vStart;//v + object.vDelta - object.vEnd;

                let a = this.parametricFunction(u, v);
                let b = this.parametricFunction(uNext, v);
                let c = this.parametricFunction(u, vNext);
                let d = this.parametricFunction(uNext, vNext);

                normals.push(surfaceNormals[a]);
                normals.push(surfaceNormals[b]);
                normals.push(surfaceNormals[c]);
                normals.push(surfaceNormals[c]);
                normals.push(surfaceNormals[b]);
                normals.push(surfaceNormals[d]);

            }
        }

        return normals

    }


    //Good concept(encapsulating mesh sampling method in a function)
    getSolidVertices(){
        return this.iterator((u, v) => this.parametricFunction(u, v));
    }
    experimentalNormals(){
        return this.iterator((u, v) => this.trueNormals(u, v));
    }
    //Iterator function for vertex and normal sampling. This way if anything is to be changed about the sampling method, it can be done here.
    iterator(f){
        let object = this;

        let vertices = [];

        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){
            let uPrev = u - object.uDelta > object.uStart ? u - object.uDelta : object.uEnd;
            let uNext = u + object.uDelta < object.uEnd ? u + object.uDelta : object.uStart;//u + object.uDelta - object.uEnd;

            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                let vPrev = v - object.vDelta > object.vStart ? u - object.vDelta : object.vEnd;
                let vNext = v + object.vDelta < object.vEnd ? v + object.vDelta : object.vStart;//v + object.vDelta - object.vEnd;

                vertices = vertices.concat(...this.samplingMethod(f, u, uPrev, uNext, v, vPrev, vNext));

            }
        }

        return vertices
    }

    samplingMethod(f, u, uPrev, uNext, v, vPrev, vNext){
        let vertices = [];

        vertices.push(f(u, v));
        vertices.push(f(uNext, v));
        vertices.push(f(u, vNext));
        vertices.push(f(u, vNext));
        vertices.push(f(uNext, v));
        vertices.push(f(uNext, vNext));

        return vertices
    }

    //Deprecated for now.
    //!Two essential functions. We sample the points on the surface using samplePoints and construct the surface with them using sampleSolid
    samplePoints(object=this){
        let pointsInMesh = [];

        let i = 0;
        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){
            pointsInMesh.push([])
            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                pointsInMesh[i].push(object.parametricFunction(u, v));
            }
            i += 1;
        }
        
        return pointsInMesh;
    }
    sampleSolid(object=this){  
        let pointsInMesh = this.samplePoints(object); //doesn't wrap around, so it should be made to wrap around

        let vertices = [];

        let leftUp, rightUp, leftDown, rightDown;
        let iDown, jRight
        let triangleOne, triangleTwo; //two triangles per square visited


        for (let i = 0; i < pointsInMesh.length; i++){
            iDown = i + 1 == pointsInMesh.length ? 0 : i+1; //wrap around

            for (let j = 0; j < pointsInMesh[i].length; j++){
                jRight = j + 1 == pointsInMesh[i].length ? 0 : j+1;

                leftUp = pointsInMesh[i][j]; //upper left square
                rightUp = pointsInMesh[i][jRight];
                leftDown = pointsInMesh[iDown][j];
                rightDown = pointsInMesh[iDown][jRight];


                //! Anything could go wrong here... way too much working with objects without copying
                triangleOne = [leftUp, leftDown, rightDown]; //! going counter clockwise.. is this right?
                triangleTwo = [rightDown, rightUp, leftUp];
                
                vertices = vertices.concat(...triangleOne, ...triangleTwo);

            }
        }
    
        return vertices;
    }
    //For unraveling uv grid
    unravel(points){
        let res = [];

        for (const pointsArr of points){
            res = res.concat(pointsArr);
        }
        return res;
    }


    //Ref: https://discourse.threejs.org/t/calculating-vertex-normals-after-displacement-in-the-vertex-shader/16989
    calculateNormal(center, neighbor1, neighbor2){
        let tangent = subtract(neighbor1, center);
        let bitangent = subtract(neighbor2, center);
        
        return cross(tangent, bitangent); //No need to normalize, the vertex shader will handle that
    }




    //TODO cleanup
    getTrueNormals(){
        return this.experimentalNormals();
        //faulty

        let object = this;
        let pointsInMesh = [];

        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){
            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                let normal1 = object.trueNormals(u, v);
                //normal1 = this.bumpMap(normal1, u, v);

                for (let i = 0; i < 6; i++) pointsInMesh.push(normal1);
            }
        }
        
        return pointsInMesh;
    }
    /*
    sampleSolid(){
        let object = this;
        let pointsInMesh = [];

        let i = 0;
        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){
            pointsInMesh.push([]);
            
            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                pointsInMesh[i].push(object.parametricFunction(u, v));
            }
            i += 1;
        }

    
        let neighborsInMesh = []
        i = 0;
        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){
            let j = 0;
            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                let curNeighbors = [pointsInMesh[i][j]];
                curNeighbors = curNeighbors.concat(this.findNeighbors(pointsInMesh, i, j));

                let upperLeft = this.normalize(pointsInMesh.length, pointsInMesh[0].length, i-1, j-1);
                curNeighbors.push(pointsInMesh[upperLeft[0]][upperLeft[1]]);//We need to close off the loop
                
                neighborsInMesh = neighborsInMesh.concat(curNeighbors)
                j += 1;
            }
            i += 1;
        }

        return neighborsInMesh
    }
    */

    getMeshVertices(){
        return this.sampleMesh();
    }

    //should return an array
    sampleMesh(){
        let object = this;
        let pointsInMesh = [];

        let i = 0;
        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){
            pointsInMesh.push([]);
            
            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                pointsInMesh[i].push(object.parametricFunction(u, v));
            }
            i += 1;
        }

    

        let linesInMesh = new Set();
        i = 0;
        for (let u = object.uStart; u < object.uEnd; u += object.uDelta){
            let j = 0;
            for(let v = object.vStart; v < object.vEnd; v += object.vDelta){
                for (const neighbor of object.findNeighbors(pointsInMesh, i, j)){
                    if (!(linesInMesh.has([pointsInMesh[i][j], neighbor]) && linesInMesh.has(neighbor, pointsInMesh[i][j]))){
                        linesInMesh.add([pointsInMesh[i][j], neighbor]);
                    }
                }
                
                j += 1;
            }
            i += 1;
        }


        let vertices = [];
        for (let points of linesInMesh){
            vertices = vertices.concat(points)
        }
        return vertices;
    }
    
    //TODO MAKE THIS CLOCKWISE
    //TODO make sure we start at sol üst
    //!These are HELPER functions 
    findNeighbors(pointsInMesh, i, j){
        let iRange = pointsInMesh.length;
        let jRange = pointsInMesh[0].length;

        let neighbors = [];
        
        let current = this.normalize(iRange, jRange, i-1, j-1);
        neighbors.push(pointsInMesh[current[0]][current[1]]);
        current = this.normalize(iRange, jRange, i-1, j);
        neighbors.push(pointsInMesh[current[0]][current[1]]);
        current = this.normalize(iRange, jRange, i-1, j+1);
        neighbors.push(pointsInMesh[current[0]][current[1]]);
        current = this.normalize(iRange, jRange, i, j+1);
        neighbors.push(pointsInMesh[current[0]][current[1]]);
        current = this.normalize(iRange, jRange, i+1, j+1);
        neighbors.push(pointsInMesh[current[0]][current[1]]);
        current = this.normalize(iRange, jRange, i+1, j);
        neighbors.push(pointsInMesh[current[0]][current[1]]);
        current = this.normalize(iRange, jRange, i+1, j-1);
        neighbors.push(pointsInMesh[current[0]][current[1]]);
        current = this.normalize(iRange, jRange, i, j-1);
        neighbors.push(pointsInMesh[current[0]][current[1]]);

        return neighbors
    }
    normalize(iRange, jRange, i, j){
        let res = [i, j];
        if (i == -1){
            res[0] = iRange-1;
        }
        if (j == -1){
            res[1] = jRange-1;
        }
        if (i == iRange){
            res[0] = 0;
        }
        if (j == jRange){
            res[1] = 0;
        }

        return res;
    }

    bumpMap(normal1, u, v){
        if (this.bumpMappingOn){
            let bumpFactor = perlin.get(u, v);//perlin.get(this.pointsInMeshStrip[i][j][0], this.pointsInMeshStrip[i][j][1]);
            perlin.seed()
            normal1[0] *= bumpFactor;
            normal1[1] *= bumpFactor;
            normal1[2]  *= bumpFactor;
            normal1 = normalize(normal1);
        }
        return normal1;
    }
}