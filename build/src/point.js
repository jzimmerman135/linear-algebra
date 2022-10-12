var gl = (function () {
    var canvas = document.getElementById('contentWebGL');
    var gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error("Failed to get Webgl2 Rendering Context." +
            " Update your browser.");
        throw Error;
    }
    return gl;
})();
;
var Point = /** @class */ (function () {
    function Point() {
        this.index = -1;
    }
    return Point;
}());
// connect locations
var PointPrimitives = {
    n_elem: 0,
    translationAttrib: { size: 2, offset: 0, name: "a_translation", loc: -1 },
    rotationAttrib: { size: 1, offset: 2, name: "a_rotation", loc: -1 },
    scaleAttrib: { size: 2, offset: 3, name: "a_scale", loc: -1 },
    widthAttrib: { size: 1, offset: 5, name: "a_width", loc: -1 },
    colorAttrib: { size: 3, offset: 6, name: "a_color", loc: -1 },
    positionUniform: { name: "u_position", loc: null },
    timeUniform: { name: "u_time", loc: null },
    animUniform: { name: "u_anim", loc: null },
    bufferStride: 2 + 1 + 2 + 1 + 3,
    bufferType: gl.FLOAT,
    buffer: gl.createBuffer(),
    bufferData: new Float32Array([]),
    program: gl.createProgram()
};
function addNew() {
}
var vss = "#version 300 es\nuniform vec2 a_position;\nin vec2 a_translation;\nin float a_rotation;\nin vec2 a_scale;\nin vec4 a_color;\nout vec4 v_color;\nvoid main()\n{\n    mat3 tMat = mat3(\n        0, 0, a_translation.x,\n        0, 0, a_translation.y,\n        0, 0,               1\n    );\n\n    mat3 rMat = mat3(\n         cos(a_rotation), sin(a_rotation), 0,\n        -sin(a_rotation), cos(a_rotation), 0,\n                       0,               0, 1\n    );\n\n    mat3 sMat = mat3(\n        a_scale.x,       0, 0,\n              0, a_scale.y, 0,\n              0,       0, 1\n    );\n\n    mat3 transform = tMat * sMat * rMat;\n\n    float r = a_rotation;\n    float sx = a_scale.x;\n    float tx = a\n\n    gl_Position = vec3(a_position, 1) * transform;\n    v_position = gl_Position;\n    v_color = a_color;\n}\n";
var fss = "#version 300 es\nprecision highp float;\nuniform u_time;\nuniform u_anim;\nin vec4 v_color;\nin vec2 v_position;\nout vec4 outColor;\nvoid main()\n{\n    outColor = v_color;\n}\n";
// compile shaders
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(vertexShader, vss);
gl.shaderSource(fragmentShader, fss);
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
// get attribute locations and enable
attributes.forEach(function (att) {
    att.loc = gl.getAttribLocation(PointPrimitives.program, att.name);
    gl.enableVertexAttribArray(att.loc);
});
// get uniform locations
uniforms.forEach(function (uni) {
    uni.loc = gl.getUniformLocation(PointPrimitives.program, uni.name);
});
// bind data buffer
gl.bindBuffer(gl.ARRAY_BUFFER, PointPrimitives.buffer);
gl.bufferData(gl.ARRAY_BUFFER, PointPrimitives.bufferData, gl.STATIC_DRAW);
attributes.forEach(function (att) {
    gl.vertexAttribPointer(att.loc, att.size * 4, gl.FLOAT, false, PointPrimitives.bufferStride * 4, att.offset * 4);
});
var time = 0.01;
var anim = 0.01;
gl.uniform2f(PointPrimitives.positionUniform.loc, 0, 0);
gl.uniform1f(PointPrimitives.timeUniform.loc, time);
gl.uniform1f(PointPrimitives.animUniform.loc, anim);
gl.drawArrays(gl.TRIANGLES, 0, PointPrimitives.n_elem);
