import ObjParser from "./ObjParser.js"

import ModelRenderer from "./ModelRenderer.js";


window.onload = async () => {
    await modelTest('./cow/spot/spot_triangulated.obj', "./cow/spot/spot_texture.png");
}

async function modelTest(objSrc, textureSrc){
    let modelRenderer = new ModelRenderer();     

    const response = await fetch(objSrc);
    const text = await response.text();   
    let parser = new ObjParser();
    let model = parser.parse(text);
    model.constructFaces();

    if (textureSrc){
        model.loadTexture(textureSrc).then(() =>     modelRenderer.render(model) );
    }
    else{
        modelRenderer.render(model)
    }
    
    
    //model.texture.onload = () => modelRenderer.render(model);
}
async function crateTest(){
    modelTest('./crate.obj', './crate.png')

}

async function steveTest(){
    const response = await fetch('./steve/minecraft_steve.obj');
    const text = await response.text();   
    let parser = new ObjParser();
    let model = parser.parse(text);
    model.constructFaces();
    model.loadTexture("./steve/Minecraft_steve_skin.jpg");
    
    
    let modelRenderer = new ModelRenderer();     
    model.texture.onload = () => modelRenderer.render(model);
}