const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error('WebGL not supported');
}

//Vertices
const vertexData = [
    // FRONT face
0.5, 0.5, 0,    // I
-0.5, 0.5, 0,   // II
-0.5, -0.5, 0,  // III
0.5, -0.5, 0,   // IV

// BOTTOM face (Green)
0.5, -0.5, 1,   // IV
-0.5, -0.5, 1,  // III
-0.5, -0.5, 0,  // III
0.5, -0.5, 0,   // IV

// LEFT face (Blue)
-0.5, -0.5, 1,  // III
-0.5, 0.5, 1,   // II
-0.5, 0.5, 0,   // II
-0.5, -0.5, 0,  // III

// TOP face (Yellow)
-0.5, 0.5, 1,   // II
0.5, 0.5, 1,    // I
0.5, 0.5, 0,    // I
-0.5, 0.5, 0,   // II

// BACK face
0.5, 0.5, 1,    // I
-0.5, 0.5, 1,   // II
-0.5, -0.5, 1,  // III
0.5, -0.5, 1,   // IV

// RIGHT face (Purple)
0.5, 0.5, 1,    // I
0.5, 0.5, 0,    // I
0.5, -0.5, 0,   // IV
0.5, -0.5, 1    // IV



];

const colorData = [
    //FRONT
    1, 0, 0,    // top
    1, 0, 0,   // bottom right
    1, 0, 0,  // bottom left
    1, 0, 0,

    //TOP GREEN
    1.2, 0.6, 0.3,    // top
    1.2, 0.6, 0.3,   // bottom right
    1.2, 0.6, 0.3,  // bottom left
    1.2, 0.6, 0.3,

    //RIGHT
    0, 0, 1,    // top
    0, 0, 1,   // bottom right
    0, 0, 1,  // bottom left
    0, 0, 1,
    
    //BACK
    0, 0, 0,    // top
    0, 0, 0,   // bottom right
    0, 0, 0,  // bottom left
    0, 0, 0,

    //BOTTOM
    0.5, 1, 0.5,    // top
    0.5, 1, 0.5,   // bottom right
    0.5, 1, 0.,  // bottom left
    0.5, 1, 0.5,

    //LEFT
    1, 0.6, 0,    // top
    1, 0.6, 0,   // bottom right
    1, 0.6, 0,  // bottom left
    1, 0.6, 0,
];

// Buffer data
const buffer = gl.createBuffer();
if (!buffer) {
    console.error("Failed to create buffer");
} else {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
}

// Buffer color
const colorBuffer = gl.createBuffer();
if (!colorBuffer) {
    console.error("Failed to create buffer");
} else {
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
}


// Vertex shader
const vsSource = `
    precision mediump float;
    attribute vec3 pos;

    uniform mat4 u_ScaleMatrix;
    uniform mat4 u_TranslateMatrix;
    uniform mat4 u_Matrix;

    attribute vec3 color;
    varying vec3 vColor;

    void main() {
        gl_Position = u_ScaleMatrix * u_TranslateMatrix * u_Matrix * vec4(pos, 1.0);
        gl_PointSize = 50.0;
        vColor = color;
    }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);

if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(`Vertex shader compilation error: ${gl.getShaderInfoLog(vertexShader)}`);
}

// Fragment shader
const fsSource = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4(vColor, 1);
    }
`;

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);

if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(`Fragment shader compilation error: ${gl.getShaderInfoLog(fragmentShader)}`);
}

// Program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

//program error checking
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`Shader program linking error: ${gl.getProgramInfoLog(program)}`);
}

// getting position attribute
const positionLocation = gl.getAttribLocation(program, "pos");
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
gl.useProgram(program);

//get loacation and enable it for the color attribute
const colorLocation = gl.getAttribLocation(program, `color`);
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

//Getting location of the matrixes unifroms
const uScaleMatrix = gl.getUniformLocation(program, `u_ScaleMatrix`);
const uTranslateMatrix = gl.getUniformLocation(program, `u_TranslateMatrix`);

//Step2 Uniform
const uMatrix = gl.getUniformLocation(program, 'u_Matrix')

function multiplyMatrices(matrixA, matrixB) {
    let result = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                result[i * 4 + j] += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
        }
    }
    return result;
}


//Scaling matrix 
const scaledMatrix = [
    0.5, 0, 0, 0,
    0, 0.5, 0, 0,
    0, 0, 0.5, 0,
    0, 0, 0, 1,
];

const translatedMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

let theta = Math.PI / 1;

 
draw();

function draw() {

    gl.clearColor(0, 0, 0, 0); // Set clear color
    gl.clear(gl.COLOR_BUFFER_BIT);
    theta = theta + Math.PI / 500;


    //Step5 make the matrix for each rotation this must be in the animation loop funciton
    const matrixX = [
        1, 0, 0, 0,
        0, Math.cos(theta), -Math.sin(theta), 0,
        0, Math.sin(theta), Math.cos(theta), 0,
        0, 0, 0, 1
    ]
    const matrixY = [
        Math.cos(theta), 0, Math.sin(theta), 0,
        0, 1, 0, 0,
        -Math.sin(theta), 0, Math.cos(theta), 0,
        0, 0, 0, 1
    ]
    const matrixZ = [
        Math.cos(theta), -Math.sin(theta), 0, 0,
        Math.sin(theta), Math.cos(theta), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]

    //Step6 use the multiplyMatrix function to multiply all your matrices together
    var matrixXY = multiplyMatrices(matrixX, matrixY);
    var matrixXYZ = multiplyMatrices(matrixXY, matrixZ);
    var matrixYZ = multiplyMatrices(matrixY, matrixZ);
    var matrixXZ = multiplyMatrices(matrixX, matrixZ);

    //Step7 Send the final matrix to the uniform in the vertexShader 
    
    gl.uniformMatrix4fv(uMatrix, false, matrixXYZ); //All rotations
        
    gl.uniformMatrix4fv(uScaleMatrix, false, scaledMatrix);
    gl.uniformMatrix4fv(uTranslateMatrix, false, translatedMatrix);
   
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 3, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 12, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 16, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 20, 4);
   
    gl.enable(gl.DEPTH_TEST);
   

  

    window.requestAnimationFrame(draw);
}
