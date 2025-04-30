"use strict";

var mountainExample = function(){
var canvas;
var gl;

var positionsArray = [];
var colorsArray = [];
    
var radius = 4;
var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)           
var  aspect;       // Viewport aspect ratio                                     
var eye;
    
var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;
var theta = 0;
    
const at = vec3(0.0, 1.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

let colors = [
    // white for the top
    vec4(1.0, 1.0, 1.0, 1.0),
    // green for the middle part
    vec4(0.0, 1.0, 0.0, 1.0),
    // brown for the base
    vec4(0.5, 0.25, 0.1, 1.0)
]

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available" );

    var vertices = [
        vec4( -1, 0, -1, 1 ),
        vec4(  0, 0,  1, 1 ),
        vec4(  1, 0, -1, 1 )
    ];
    
    // Creating a more mountain like structure
    generateMountainTriangle(vertices[0], vertices[1], vertices[2], 1.0, 5);
    
    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect =  canvas.width/canvas.height;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // POSITION buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // COLOR buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    const vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    render();
}

function triangle(a, b, c)
{
    positionsArray.push(a, b, c);
    // Assign colors based on the vertex position
    let height = a[1] + b[1] + c[1];
    if (height > 2.5) {
        // Top part of the mountain
        colorsArray.push(colors[0], colors[0], colors[0]);
    } else if (height > 1.5) {
        // Middle part of the mountain
        colorsArray.push(colors[1], colors[1], colors[1]);
    } else {
        // Base part of the mountain
        colorsArray.push(colors[2], colors[2], colors[2]);
    }

}
    
function generateMountainTriangle(a, b, c, height, count) {
    if (count == 0) {
        triangle(a, b, c);
        return;
    }

    // Calculate midpoints of each side
    let ab = mix(a, b, 0.5);
    let bc = mix(b, c, 0.5);
    let ca = mix(c, a, 0.5);

    // Find the peak point of the mountain
    let center = mix(mix(ab, bc, 0.5), ca, 0.5);
    center = add(center, vec4(0, height * (Math.random() + 0.5), 0, 0));

    // Lower height for next recursion
    let newHeight = height * 0.5;
    let newCount = count - 1;

    // Recursively divide the triangle
    generateMountainTriangle(a, ab, center, newHeight, newCount);
    generateMountainTriangle(ab, b, center, newHeight, newCount);
    generateMountainTriangle(b, bc, center, newHeight, newCount);
    generateMountainTriangle(bc, c, center, newHeight, newCount);
    generateMountainTriangle(c, ca, center, newHeight, newCount);
    generateMountainTriangle(ca, a, center, newHeight, newCount);
}
    
var render = function(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.cos(theta), 1, radius*Math.sin(theta));
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, 2, 10);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, positionsArray.length);
    theta += 0.005;
    requestAnimationFrame(render);
}

}
mountainExample();