var vertexShaderSource = "#version 300 es\nuniform vec2 u_resolution;\nuniform float u_time;\nuniform float u_anim;\n\nin vec4 a_position;\nin vec2 a_translation;\nin vec2 a_scale;\nin float a_rotation;\nin vec4 a_color;\n\nout vec4 v_color;\n\nmat4 MovementMatrix() {\n    vec2 t = a_translation;\n    vec2 s = a_scale;\n    vec2 r = vec2(cos(a_rotation), sin(a_rotation));\n    vec2 a = u_resolution / max(u_resolution.x, u_resolution.y);\n    mat4 tm = mat4(  1, 0, 0, t.x,     0, 1, 0, t.y,   0,0,1,0,  0,0,0,1);\n    mat4 sm = mat4(  s.x, 0, 0, 0,     0, s.y, 0, 0,   0,0,1,0,  0,0,0,1);\n    mat4 rm = mat4(r.x, -r.y, 0, 0,  r.y, r.x, 0, 0,   0,0,1,0,  0,0,0,1);\n    mat4 am = mat4(  a.y, 0, 0, 0,     0, a.x, 0, 0,   0,0,1,0,  0,0,0,1);\n    return sm * rm * tm * am;\n}\n\nvoid main()\n{\n    mat4 mm = MovementMatrix();\n    gl_Position = a_position * mm;\n    v_color = a_color;\n}";
var fragmentShaderSource = "#version 300 es\nprecision mediump float;\n\nin vec4 v_color;\nout vec4 outColor;\nvoid main()\n{\n    outColor = v_color + vec4(0.2, 0.0, 0.7, 0); \n}";
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);
if (shaderCompileFail(vertexShader) || shaderCompileFail(fragmentShader)) {
    throw Error;
}
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (shaderLinkFail(program)) {
    throw Error;
}
// static
var modelData = (function () {
    // BL -> BR -> TR || BL -> TR -> TL
    var r = 0.05;
    return new Float32Array([
        -r, -r, r, -r, r, r, /**/ -r, -r, r, r, -r, r,
    ]);
})();
// translation (2) -> scale (2) -> rotation (1)
var transformData = new Float32Array([
    0, 0, 2, 2, .45, 1, 0, 0,
    .5, .5, 2, 2, .45, 1, 0, 0,
]);
// per vertex
// let colors = new Float32Array([
//     1,0,0//  1,0,0,  1,0,0,  /**/  1,0,1,  1,0,0,  1,0,0,
// ]);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);
var modelBuffer = gl.createBuffer();
var positionAttribLoc = gl.getAttribLocation(program, "a_position");
gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
gl.bufferData(gl.ARRAY_BUFFER, modelData, gl.STATIC_DRAW);
gl.vertexAttribPointer(positionAttribLoc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionAttribLoc);
// const colorBuffer = gl.createBuffer();
var transformBuffer = gl.createBuffer();
var resolutionUnifLocation = gl.getUniformLocation(program, "u_resolution");
var timeUnifLocation = gl.getUniformLocation(program, "u_time");
var translationAttribLoc = gl.getAttribLocation(program, "a_translation");
var rotationAttribLoc = gl.getAttribLocation(program, "a_rotation");
var scaleAttribLoc = gl.getAttribLocation(program, "a_scale");
var colorAttribLoc = gl.getAttribLocation(program, "a_color");
gl.bindBuffer(gl.ARRAY_BUFFER, transformBuffer);
gl.bufferData(gl.ARRAY_BUFFER, transformData, gl.DYNAMIC_DRAW);
gl.vertexAttribPointer(translationAttribLoc, 2, gl.FLOAT, false, 8 * 4, 0 * 4);
gl.vertexAttribPointer(scaleAttribLoc, 2, gl.FLOAT, false, 8 * 4, 2 * 4);
gl.vertexAttribPointer(rotationAttribLoc, 1, gl.FLOAT, false, 8 * 4, 4 * 4);
gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, 8 * 4, 5 * 4);
gl.vertexAttribDivisor(scaleAttribLoc, 1);
gl.vertexAttribDivisor(translationAttribLoc, 1);
gl.vertexAttribDivisor(rotationAttribLoc, 1);
gl.vertexAttribDivisor(colorAttribLoc, 1);
gl.enableVertexAttribArray(translationAttribLoc);
gl.enableVertexAttribArray(rotationAttribLoc);
gl.enableVertexAttribArray(scaleAttribLoc);
gl.enableVertexAttribArray(colorAttribLoc);
gl.resizeCanvas();
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.uniform2f(resolutionUnifLocation, gl.canvas.width, gl.canvas.height);
addEventListener('resize', function () {
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
