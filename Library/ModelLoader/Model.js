export default class Model{
    name; //g

    vertices; //v
    textureCoordinates; //vt    
    vertexNormals; //vn
    
    //f
    vertexIndices;
    textureIndices;
    normalIndices;

    //In triangle form
    trianglesVertex;
    trianglesTexture;
    trianglesNormal;

    constructor(name="", vertices=[], textureCoordinates=[], vertexNormals=[], vertexIndices=[], textureIndices=[], normalIndices=[]){
        this.name = name;

        this.vertices = vertices;
        this.textureCoordinates = textureCoordinates;
        this.vertexNormals = vertexNormals;

        this.vertexIndices = vertexIndices;
        this.textureIndices = textureIndices;
        this.normalIndices = normalIndices;
    }

    constructFaces(){
        this.trianglesVertex = [];
        this.trianglesTexture = [];
        this.trianglesNormal = [];

        for (let i = 0; i < this.vertexIndices.length; i++){ 
            //Indices are 1 indexed, so
            let v = this.vertexIndices[i].map((num) => num-1); //1 indexed to 0 indexed
            let vt = this.textureIndices[i].map((num) => num-1); 
            let vn = this.textureIndices[i].map((num) => num-1);

            let vTriangle = [this.vertices[v[0]], this.vertices[v[1]], this.vertices[v[2]]]
            let vtTriangle = [this.textureCoordinates[vt[0]], this.textureCoordinates[vt[1]], this.textureCoordinates[vt[2]]]
            let vnTriangle = [this.vertexNormals[vn[0]], this.vertexNormals[vn[1]], this.vertexNormals[vn[2]]]        
            
            this.trianglesVertex.push(vTriangle);
            this.trianglesTexture.push(vtTriangle);
            this.trianglesNormal.push(vnTriangle);
        }

    }

    hasTexture(){ return (this.texture != undefined && this.texture != null)}
    async loadTexture(link){
        var image = new Image();
        image.src =  link;

        this.texture = image

        return new Promise((resolve, reject) => {
            this.texture.onload  =  () => (resolve("loaded"));
        })
    }
}