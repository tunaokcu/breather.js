A WebGL-based 3D graphics library. Features scene graphs, cameras, light, surface material, geometric primitives(cube, sphere, hemisphere, plane, textured cube). In addition, the ParametricSurface class is easily extendible, requiring the user to only specify two functions to successfuly create a new parametric surface. There is also a obj file parser and loader. 

A demonstration is provided. Run index.html with a live server, or visit the link provided: https://tunaokcu.github.io/breather.js/. Use ctrl + mouse wheel to zoom in and out.

To view different scenes, call one of the provided test functions from main. In the demonstration folder, demonstrations for different features of the library are provided. Octopus demonstrates how to extend the SceneNode class to build hierarchical models. Breather and Torus are sample parametric surfaces modelled using the library's Parametric Surfaces class. All the user has to do is specify the parametric equation for the surface's vertices and normals.

This library is still in development. As of now the model loader is not integrated with the rest of the library, and it can only load certain obj files successfully. There are also known lighting issues.

Credits: 
Ege Çenberci and Tuna Okçu: Developed the base of the library for a course assignment. 
Edward Angel, Dave Shreiner: MV.js and initShaders.js in Common are their code. Link: https://www.interactivecomputergraphics.com/Code/