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

        this.mesh = new Mesh();
    }

    
    calculateMesh(){
        this.mesh.calculate(this);

        this.numberOfVertices = this.mesh.normals.length / 3;
        this.meshNotCalculated = false;
    }

    getVertices(){
        return this.mesh.vertices;
    }
    getTrueNormals(){
        return this.mesh.normals;
    }    

    trueNormalsSpecified(){
        return typeof this.normalFunction === "function"
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

        return flatten(vertices)
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







    /*
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
    */
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