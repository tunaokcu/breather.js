import ParametricSurface from "../Library/Objects/ParametricSurface.js";
import {vec4, cross, vec3} from "../Library/Common/MV.js";

export default class Breather extends ParametricSurface{

    constructor(uStart=-4*Math.PI, uEnd=4*Math.PI, uDelta=90*Math.PI/360, vStart=-4*Math.PI, vEnd=4*Math.PI, vDelta=90*Math.PI/360, aa = 0.9){
        if(!(aa < 1 && aa > 0)){
            throw Error("aa should be within range (0, 1)")
        }
        super(uStart, uEnd, uDelta, vStart, vEnd, vDelta);
        this.aa = aa;

        this.setTestParams();
    }
    
    parametricFunction(u, v){
        return breather(this.aa, u, v);
    }

    trueNormals(u, v){
        let res = normals(this.aa, u, v, breatherW(this.aa));

        return res
    }

    setTestParams(){
        this.aa = 0.4;
        this.uStart = -14;
        this.uEnd = 14;
        this.vStart = -37.4;
        this.vEnd = 37.4;

        this.uDelta = 30*Math.PI/360
        this.vDelta = 30*Math.PI/360

    }
}

//This DOES return vec3
function normals(aa, u, v, w){
    let res = cross(uPartials(aa, u, v, w), vPartials(aa, u, v, w));
    return res;
}
function uPartials(aa, u, v, w){
    return vec3(dxdu(aa, u, v, w),
                dydu(aa, u, v, w),
                dzdu(aa, u, v, w));
}
function vPartials(aa, u, v, w){
    return vec3(dxdv(aa, u, v, w),
    dydv(aa, u, v, w),
    dzdv(aa, u, v, w));
}

//aa must range (0, 1)
function breather(aa, u, v){
    let w = breatherW(aa);
    let denom = breatherDenom(aa, w, u, v);
    
    let x = breatherX(aa, u, denom);
    let y = breatherY(aa, u, v, w, denom);
    let z = breatherZ(aa, u ,v, w, denom);
    
    let res = vec4(x,y,z, 1.0);
    return res;
}
function breatherW(aa){
    return Math.sqrt(1-Math.pow(aa, 2));
}
function breatherDenom(aa, w, u, v){
    //NOTE! X AND Y DO NOT DENOTE COORDINATES HERE, THEY ARE ARBITRARY NAMES
    let x = Math.pow(w*Math.cosh(aa*u), 2);
    let y = Math.pow(aa*Math.sin(w*v), 2);
    return aa*(x + y);
}   
function breatherX(aa, u, denom){
    return -u + 2*(1-Math.pow(aa, 2)) * Math.cosh(aa*u) * Math.sin(aa*u) / denom;
}
function breatherY(aa, u, v, w, denom){
    return 2 * w * Math.cosh(aa*u) * (-w*Math.cos(v)*Math.cos(w*v) - Math.sin(v)*Math.sin(w*v)) / denom;
}
function breatherZ(aa, u, v, w, denom){
    return 2 * w * Math.cosh(aa*u) * (-w * Math.sin(v) * Math.cos(w*v) + Math.cos(v) * Math.sin(w*v)) / denom;
}

function dxdu(aa, u, v, w){
    return -1 + 2*(Math.pow(-aa,2)+1)*(Math.pow(w,2)*Math.cos(aa*u)* Math.pow(Math.cosh(aa*u),3) +
     Math.pow(aa,2) * Math.cos(aa*u) * Math.cosh(aa*u) * Math.sin(w*v) +
     Math.pow(aa,2) * Math.sin(aa*u) * Math.sinh(aa*u) * Math.pow(Math.sin(w*v),2) - 
     Math.pow(w,2) * Math.sin(aa*u) * Math.pow(Math.cosh(aa*u),2) * Math.sinh(aa*u)) /
     Math.pow(Math.pow(w,2)*Math.pow(Math.cosh(aa*u),2) + Math.pow(aa,2) * Math.pow(Math.sin(w*v),2),2)
}

function dxdv(aa, u, v, w){
    return (2 * aa * (Math.pow(aa,2) - 1) * w * Math.sin(aa*u) * Math.cosh(aa*u) *Math.sinh(2*v*w) )/
    Math.pow(Math.pow(aa,2) * Math.pow(Math.sin(v*w),2) + Math.pow(w,2) * Math.pow(Math.cosh(aa*u),2),2)
}

function dydu(aa, u, v, w){
    return (2*Math.sinh(aa*u)*(Math.sin(v)*Math.sin(w*v) + w*Math.cos(v)*Math.cos(v*w))*
    (Math.pow(w,3)*Math.pow(Math.cosh(aa*u),2) - Math.pow(aa,2)*w*Math.pow(Math.sin(v*w),2)))/
    Math.pow(Math.pow(aa,2) * Math.pow(Math.sin(v*w),2) + Math.pow(w,2) * Math.pow(Math.cosh(aa*u),2),2)
}

function dydv(aa, u, v, w){
    return (2*w*Math.cosh(aa*u)*(Math.pow(w,2)*Math.sin(w*v)*Math.cos(v)-Math.sin(v*w)*Math.cos(v))*
    (Math.pow(w,2)*Math.pow(Math.cosh(aa*u),2)+ Math.pow(aa,2)*Math.pow(Math.sin(w*v),2))-
    Math.pow(aa,2)*w*Math.sin(2*w*v)*(-w*Math.cos(w*v)*Math.cos(v)-Math.sin(w*v)*Math.sin(v)))/
    (aa*Math.pow(Math.pow(aa,2) * Math.pow(Math.sin(v*w),2) + Math.pow(w,2) * Math.pow(Math.cosh(aa*u),2),2))
}

function dzdu(aa, u, v, w){
    return (2*w*Math.sinh(aa*u)*(Math.sin(w*v)*Math.cos(v)-w*Math.cos(w*v)*Math.sin(v))*
    (Math.pow(aa,2) * Math.pow(Math.sin(w*v),2) - Math.pow(w,2) * Math.pow(Math.cosh(aa*u),2)))/
    Math.pow(Math.pow(aa,2) * Math.pow(Math.sin(v*w),2) + Math.pow(w,2) * Math.pow(Math.cosh(aa*u),2),2)
}

function dzdv(aa, u, v, w){
    return (2*w*Math.cosh(aa*u)*
    (Math.pow(w,2)*Math.sin(w*v)*Math.sin(v)-Math.sin(w*v)*Math.sin(v))*
    (Math.pow(w,2)*Math.pow(Math.cosh(aa*u),2)+Math.pow(aa,2)*Math.pow(Math.sin(w*v),2))-
    Math.pow(aa,2)*w*Math.sin(2*w*v)*(-w*Math.cos(w*v)*Math.sin(v)+Math.sin(w*v)*Math.cos(v)))/
    (aa*Math.pow(Math.pow(aa,2) * Math.pow(Math.sin(v*w),2) + Math.pow(w,2) * Math.pow(Math.cosh(aa*u),2),2))
}