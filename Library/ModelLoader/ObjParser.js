import Model from "./Model.js";

export default class ObjParser{
    parse(text){
        let model = new Model();
        
        let f_lines = [];
        for (const line of text.split("\n")){
            let lineTrimmed = line.trim();

            //Comment or blank line
            if (lineTrimmed[0] == "#" || lineTrimmed == ""){ continue; } 

            //Name
            else if (lineTrimmed[0] == "g"){
                model.name = this.parse_g(lineTrimmed);
            }

            //Texture coordinates
            else if (lineTrimmed.startsWith("vt")){
                model.textureCoordinates.push(this.parse_vt(lineTrimmed))
            }

            //Normal vectors
            else if (lineTrimmed.startsWith("vn")){
                model.vertexNormals.push(this.parse_vn(lineTrimmed))
            }

            //Vertices
            else if (lineTrimmed[0] =="v"){
                model.vertices.push(this.parse_v(lineTrimmed));
            }

            //Faces
            else if (lineTrimmed[0] == "f"){
                f_lines.push(lineTrimmed);
            }
        }

        for (const f_line of f_lines){
            const [vertexIndices, textureIndices, normalIndices]  = this.parse_f(f_line);

            model.vertexIndices.push(vertexIndices);
            model.textureIndices.push(textureIndices);
            model.normalIndices.push(normalIndices);
        }

        return model;
    }

    parse_g(line){
        return line.slice(1).trim(); //Skip the first char, trim 
    }

    parse_v(line){
        return line.slice(1).trim().split(" ").map((s) => parseFloat(s));
    }

    parse_vt(line){
        //Skip the first two chars(vt)
        let vt = line.slice(2).trim().split(" ");
        
        //Turn strings to floats
        //TODO what about 3d texture sampling? 
        return vt.map((str) => parseFloat(str)).slice(0, 2);
    }

    parse_vn(line){
        //Skip the first two chars(vn)
        let vt = line.slice(2).trim().split(" ");

        //Turn strings to floats
        return vt.map((str) => parseFloat(str));
    }
    
    parse_f(line){
        let face = line.slice(1).trim(); //Skip the first char, trim
        let indexStrings = face.split(" "); //Split into three

        let [v1, v2, v3] = indexStrings.map((str) => str.split("/").map((s) => parseFloat(s)));

        let [v, t, n] = [[v1[0], v2[0], v3[0]], [v1[1], v2[1], v3[1]], [v1[2], v2[2], v3[2]]]
        return [v, t, n];
    }
}