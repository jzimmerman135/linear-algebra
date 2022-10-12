var r = 0.05;
// connect locations
var PointPrimitives = {
    n_elem: 0,
    n_vertices: 0,
    translationAttrib: defaultAttribDescriptor(2, 0, "a_translation"),
    rotationAttrib: defaultAttribDescriptor(1, 2, "a_rotation"),
    scaleAttrib: defaultAttribDescriptor(2, 3, "a_scale"),
    widthAttrib: defaultAttribDescriptor(1, 5, "a_width"),
    colorAttrib: defaultAttribDescriptor(3, 6, "a_color"),
    positionUniform: defaultUniformDescriptor("u_position"),
    timeUniform: defaultUniformDescriptor("u_time"),
    animUniform: defaultUniformDescriptor("u_anim"),
    buffer: gl.createBuffer(),
    bufferData: new Float32Array([]),
    bufferStride: 2 + 1 + 2 + 1 + 3,
    initProgram: gl.createProgram(),
    updateProgram: gl.createProgram(),
    destroyProgram: gl.createProgram(),
    add: addNewPoint,
    draw: drawUpdatePoints
};
// returns corners of a quad (six vertices) as pos[12], col[6],
function pointVerticesPosCol(p) {
    var bl = { x: p.x - r, y: p.y - r, c: p.color.bl };
    var br = { x: p.x + r, y: p.y - r, c: p.color.br };
    var tl = { x: p.x - r, y: p.y + r, c: p.color.tl };
    var tr = { x: p.x + r, y: p.y + r, c: p.color.tr };
    var pos = [
        bl.x, bl.y, br.x, br.y, tr.x, tr.y,
        bl.x, bl.y, tr.x, tr.y, tl.x, tl.y
    ];
    var col = [
        bl.c, br.c, tr.c,
        bl.c, tr.c, tl.c
    ];
    return [pos, col];
}
// add six square vertices
function addNewPoint(p) {
    PointPrimitives.n_elem++;
    PointPrimitives.n_vertices += 6;
    var dataArray = Array.prototype.slice.call(PointPrimitives.bufferData);
    var _a = pointVerticesPosCol(p), pos = _a[0], col = _a[1];
    for (var i = 0; i < 6; i++) {
        dataArray.push(pos[2 * i], pos[2 * i + 1], p.rotation, p.scale_x, p.scale_y, p.width, col[i].r, col[i].g, col[i].b);
    }
    PointPrimitives.bufferData = new Float32Array(dataArray);
}
// update six vertices
function updatePointData(p) {
    var stride = PointPrimitives.bufferStride;
    var buffer = PointPrimitives.bufferData;
    var _a = pointVerticesPosCol(p), pos = _a[0], col = _a[1];
    for (var i = 0; i < 6; i++) {
        var j = (p.index + i) * stride;
        buffer[j + 0] = pos[2 * i];
        buffer[j + 1] = pos[2 * i + 1];
        buffer[j + 2] = p.rotation;
        buffer[j + 3] = p.scale_x;
        buffer[j + 4] = p.scale_y;
        buffer[j + 5] = p.width;
        buffer[j + 6] = col[i].r;
        buffer[j + 7] = col[i].g;
        buffer[j + 8] = col[i].b;
    }
}
var updateVss = "#version 300 es\nuniform vec2 a_position;\nin vec2 a_translation;\nin float a_rotation;\nin vec2 a_scale;\nin vec4 a_color;\nout vec4 v_color;\nvoid main()\n{\n    vec2 r = vec2(cos(a_rotation), sin(a_rotation));\n    vec2 s = a_scale;\n    vec2 t = a_translation;\n    mat3 tMat = mat3(0, 0, t.x, 0, 0, t.y, 0, 0, 1);\n    mat3 sMat = mat3(s.x, 0, 0, 0, s.y, 0, 0, 0, 1);\n    mat3 rMat = mat3(r.x, r.y, 0, -r.y, r.x, 0, 0, 0, 1);\n    mat3 transform = tMat * sMat * rMat;\n    gl_Position = vec3(a_position, 1) * transform;\n    v_position = gl_Position;\n    v_color = a_color;\n}\n";
var updateFss = "#version 300 es\nprecision highp float;\nuniform u_time;\nuniform u_anim;\nin vec4 v_color;\nin vec2 v_position;\nout vec4 outColor;\nvoid main()\n{\n    vec3 col = vec3(0);\n    if (length(v_position) > 0.25) {\n        col = v_color.rgb;\n    }\n    outColor = vec4(col, v_color.w);\n}\n";
// compile shaders
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(vertexShader, updateVss);
gl.shaderSource(fragmentShader, updateFss);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);
if (shaderCompileFail(vertexShader) || shaderCompileFail(fragmentShader)) {
    throw Error;
}
// create program
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
// link shaders
gl.linkProgram(program);
if (shaderLinkFail(program)) {
    throw Error;
}
// loopable attributes and uniforms
var attributes = [
    PointPrimitives.translationAttrib,
    PointPrimitives.rotationAttrib,
    PointPrimitives.scaleAttrib,
    PointPrimitives.widthAttrib,
    PointPrimitives.colorAttrib
];
var uniforms = [
    PointPrimitives.positionUniform,
    PointPrimitives.timeUniform,
    PointPrimitives.animUniform
];
// get attribute and uniform locations
attributes.forEach(function (att) {
    att.updateLoc = gl.getAttribLocation(program, att.name);
});
uniforms.forEach(function (uni) {
    uni.updateLoc = gl.getUniformLocation(program, uni.name);
});
// set fixed position uniform
gl.uniform2f(PointPrimitives.positionUniform.updateLoc, 0, 0);
function drawUpdatePoints(time, anim) {
    gl.useProgram(PointPrimitives.updateProgram);
    // bind data buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, PointPrimitives.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, PointPrimitives.bufferData, gl.STATIC_DRAW);
    // enable buffer and pointers
    attributes.forEach(function (att) {
        gl.enableVertexAttribArray(att.updateLoc);
        gl.vertexAttribPointer(att.updateLoc, att.size * 4, gl.FLOAT, false, PointPrimitives.bufferStride * 4, att.offset * 4);
    });
    gl.uniform1f(PointPrimitives.timeUniform.updateLoc, time);
    gl.uniform1f(PointPrimitives.animUniform.updateLoc, anim);
    gl.drawArrays(gl.TRIANGLES, 0, PointPrimitives.n_vertices);
}
