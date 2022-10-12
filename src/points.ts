const vertexShaderSource = `#version 300 es
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_anim;

in vec4 a_position;
in vec2 a_translation;
in vec2 a_scale;
in float a_rotation;

in vec4 a_color1;
in vec4 a_color2;

out vec4 v_color;

mat4 MovementMatrix() {
    vec2 t = a_translation;
    vec2 s = a_scale;
    vec2 r = vec2(cos(a_rotation), sin(a_rotation));
    vec2 a = u_resolution / max(u_resolution.x, u_resolution.y);
    mat4 tm = mat4(  1, 0, 0, t.x,     0, 1, 0, t.y,   0,0,1,0,  0,0,0,1);
    mat4 sm = mat4(  s.x, 0, 0, 0,     0, s.y, 0, 0,   0,0,1,0,  0,0,0,1);
    mat4 rm = mat4(r.x, -r.y, 0, 0,  r.y, r.x, 0, 0,   0,0,1,0,  0,0,0,1);
    mat4 am = mat4(  a.y, 0, 0, 0,     0, a.x, 0, 0,   0,0,1,0,  0,0,0,1);
    return sm * rm * tm * am;
}

void main()
{
    vec4 a_color = a_position.x < 0.0 ? a_color1 : a_color2;
    mat4 mm = MovementMatrix();
    gl_Position = a_position * mm;
    v_color = a_color;
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec4 v_color;
out vec4 outColor;
void main()
{
    outColor = v_color; 
    outColor.w = 0.1;
}`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
gl.shaderSource(vertexShader, vertexShaderSource);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);
if (shaderCompileFail(vertexShader) || shaderCompileFail(fragmentShader)) {
    throw Error;
}

const program = gl.createProgram() as WebGLProgram;
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (shaderLinkFail(program)) {
    throw Error;
}

// static
const modelData = (() => {
    let r = 0.05;
    return new Float32Array([
        -r,-r,  r,-r,  r,r,  /**/  -r,-r,  r,r,  -r,r,
    ]);
})();

// translation (2) -> scale (2) -> rotation (1) -> color (6)
let transformData = new Float32Array([
     0, 0,     2, 2,   .45,    1,0,0,    0,0,1,
    // .5, .5,    1, 1,     0,    1,0,0,    1,0,0,
     -.5, .5,    20, 1,      0,    1,1,0,    1,0,0,
]);

gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);

const resolutionUnifLocation = gl.getUniformLocation(program, "u_resolution");
const timeUnifLocation = gl.getUniformLocation(program, "u_time");
const animUnifLocation = gl.getUniformLocation(program, "u_anim");

const modelBuffer = gl.createBuffer();
const positionAttribLoc = gl.getAttribLocation(program, "a_position");
const cornerAttribLoc = gl.getAttribLocation(program, "a_cornerf");
gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
gl.bufferData(gl.ARRAY_BUFFER, modelData, gl.STATIC_DRAW);
gl.vertexAttribPointer(positionAttribLoc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionAttribLoc);

const transformBuffer = gl.createBuffer();
const translationAttribLoc = gl.getAttribLocation(program, "a_translation");
const rotationAttribLoc = gl.getAttribLocation(program, "a_rotation");
const scaleAttribLoc = gl.getAttribLocation(program, "a_scale");
const color1AttribLoc = gl.getAttribLocation(program, "a_color1");
const color2AttribLoc = gl.getAttribLocation(program, "a_color2");
gl.bindBuffer(gl.ARRAY_BUFFER, transformBuffer);
gl.bufferData(gl.ARRAY_BUFFER, transformData, gl.DYNAMIC_DRAW);

{
let F = false;
gl.vertexAttribPointer(translationAttribLoc, 2, gl.FLOAT, F, 11 * 4, 0 * 4);
gl.vertexAttribPointer(scaleAttribLoc,       2, gl.FLOAT, F, 11 * 4, 2 * 4);
gl.vertexAttribPointer(rotationAttribLoc,    1, gl.FLOAT, F, 11 * 4, 4 * 4);
gl.vertexAttribPointer(color1AttribLoc,      3, gl.FLOAT, F, 11 * 4, 5 * 4);
gl.vertexAttribPointer(color2AttribLoc,      3, gl.FLOAT, F, 11 * 4, 8 * 4);
}

gl.vertexAttribDivisor(scaleAttribLoc, 1);
gl.vertexAttribDivisor(translationAttribLoc, 1);
gl.vertexAttribDivisor(rotationAttribLoc, 1);
gl.vertexAttribDivisor(color1AttribLoc, 1);
gl.vertexAttribDivisor(color2AttribLoc, 1);

gl.enableVertexAttribArray(translationAttribLoc);
gl.enableVertexAttribArray(rotationAttribLoc);
gl.enableVertexAttribArray(scaleAttribLoc);
gl.enableVertexAttribArray(color1AttribLoc);
gl.enableVertexAttribArray(color2AttribLoc);

gl.resizeCanvas();
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.uniform2f(resolutionUnifLocation, gl.canvas.width, gl.canvas.height);

addEventListener('resize', () => {
    gl.resizeCanvas();
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(resolutionUnifLocation, gl.canvas.width, gl.canvas.height);
    console.log('resizing');
    draw();
});

function draw() {
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 2);
}

draw();
