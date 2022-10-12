interface PointPrimitivesTracker {
    n_elem: number;
    n_vertices: number;
    // vertex attributes
    translationAttrib: AttributeDescriptor;
    rotationAttrib: AttributeDescriptor;
    scaleAttrib: AttributeDescriptor;
    widthAttrib: AttributeDescriptor;
    colorAttrib: AttributeDescriptor;
    // shader uniforms
    positionUniform: UniformDescriptor;
    timeUniform: UniformDescriptor;
    animUniform: UniformDescriptor;
    // vertex attribute pointer data    
    buffer: WebGLBuffer;
    bufferData: Float32Array;
    bufferStride: number;
    // programs
    initProgram: WebGLProgram;
    updateProgram: WebGLProgram;
    destroyProgram: WebGLProgram;

    add(p: PointValueDescriptor): any;
    draw(time: number, anim: number): void;
};


// connect locations
const PointPrimitives: PointPrimitivesTracker = {
    n_elem: 0,
    n_vertices: 0,

    translationAttrib: defaultAttribDescriptor(2, 0, "a_translation"),
    rotationAttrib:    defaultAttribDescriptor(1, 2, "a_rotation"),
    scaleAttrib:       defaultAttribDescriptor(2, 3, "a_scale"),
    widthAttrib:       defaultAttribDescriptor(1, 5, "a_width"),
    colorAttrib:       defaultAttribDescriptor(3, 6, "a_color"),

    positionUniform: defaultUniformDescriptor("u_position"),
    timeUniform:     defaultUniformDescriptor("u_time"),
    animUniform:     defaultUniformDescriptor("u_anim"),
    
    buffer: gl.createBuffer() as WebGLBuffer,
    bufferData: new Float32Array([]),
    bufferStride: 2 + 1 + 2 + 1 + 3,

    initProgram: gl.createProgram() as WebGLProgram,
    updateProgram: gl.createProgram() as WebGLProgram,
    destroyProgram: gl.createProgram() as WebGLProgram,

    add: addNewPoint,
    draw: drawUpdatePoints,
};

// returns corners of a quad (six vertices) as pos[12], col[6],
function pointVerticesPosCol(p: PointValueDescriptor) {
    const r = 0.05;
    let bl = { x: p.x - r, y: p.y - r, c: p.color.bl };
    let br = { x: p.x + r, y: p.y - r, c: p.color.br };
    let tl = { x: p.x - r, y: p.y + r, c: p.color.tl };
    let tr = { x: p.x + r, y: p.y + r, c: p.color.tr };
    let pos = [
        bl.x, bl.y,     br.x, br.y,      tr.x, tr.y,
        bl.x, bl.y,     tr.x, tr.y,      tl.x, tl.y
    ];
    let col = [
        bl.c,           br.c,           tr.c,
        bl.c,           tr.c,           tl.c
    ];
    return [pos, col] as const;
}

// add six square vertices
function addNewPoint(p: PointValueDescriptor) {
    PointPrimitives.n_elem++;
    PointPrimitives.n_vertices += 6;
    let dataArray = Array.prototype.slice.call(PointPrimitives.bufferData);
    let [pos, col] = pointVerticesPosCol(p);
    for (let i = 0; i < 6; i++) {
        dataArray.push(
            pos[2 * i],
            pos[2 * i + 1],
            p.rotation,
            p.scale_x,
            p.scale_y,
            p.width,
            col[i].r,
            col[i].g,
            col[i].b
        );
    }

    PointPrimitives.bufferData = new Float32Array(dataArray);
    return 
}

// update six vertices
function updatePointData(p: PointValueDescriptor) {
    let stride = PointPrimitives.bufferStride;
    let buffer = PointPrimitives.bufferData;
    let [pos, col] = pointVerticesPosCol(p);
    for (let i = 0; i < 6; i++) {
        let j = (p.index + i) * stride;
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

const updateVss = `#version 300 es
uniform vec2 a_position;
in vec2 a_translation;
in float a_rotation;
in vec2 a_scale;
in vec4 a_color;
out vec4 v_color;
void main()
{
    vec2 r = vec2(cos(a_rotation), sin(a_rotation));
    vec2 s = a_scale;
    vec2 t = a_translation;
    mat3 tMat = mat3(0, 0, t.x, 0, 0, t.y, 0, 0, 1);
    mat3 sMat = mat3(s.x, 0, 0, 0, s.y, 0, 0, 0, 1);
    mat3 rMat = mat3(r.x, r.y, 0, -r.y, r.x, 0, 0, 0, 1);
    mat3 transform = tMat * sMat * rMat;
    gl_Position = vec3(a_position, 1) * transform;
    v_position = gl_Position;
    v_color = a_color;
}
`;

const updateFss = `#version 300 es
precision highp float;
uniform u_time;
uniform u_anim;
in vec4 v_color;
in vec2 v_position;
out vec4 outColor;
void main()
{
    vec3 col = vec3(0);
    if (length(v_position) > 0.25) {
        col = v_color.rgb;
    }
    outColor = vec4(col, v_color.w);
}
`;

// compile shaders
const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
gl.shaderSource(vertexShader, updateVss);
gl.shaderSource(fragmentShader, updateFss);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);
if (shaderCompileFail(vertexShader) || shaderCompileFail(fragmentShader)) {
    throw Error;
}

// create program
const program = gl.createProgram() as WebGLProgram;
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

// link shaders
gl.linkProgram(program);
if (shaderLinkFail(program)) {
    throw Error;
}

// loopable attributes and uniforms
let attributes = [
    PointPrimitives.translationAttrib,
    PointPrimitives.rotationAttrib,
    PointPrimitives.scaleAttrib,
    PointPrimitives.widthAttrib,
    PointPrimitives.colorAttrib
];
let uniforms = [
    PointPrimitives.positionUniform,
    PointPrimitives.timeUniform,
    PointPrimitives.animUniform
];

// get attribute and uniform locations
attributes.forEach((att) => {
    att.updateLoc = gl.getAttribLocation(program, att.name);
});
uniforms.forEach((uni) => {
    uni.updateLoc = gl.getUniformLocation(program, uni.name)
});

// set fixed position uniform
gl.uniform2f(PointPrimitives.positionUniform.updateLoc, 0, 0);

function drawUpdatePoints(time: number, anim: number) {
    gl.useProgram(PointPrimitives.updateProgram);

    // bind data buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, PointPrimitives.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, PointPrimitives.bufferData, gl.STATIC_DRAW);

    // enable buffer and pointers
    attributes.forEach((att) => {
        gl.enableVertexAttribArray(att.updateLoc);
        gl.vertexAttribPointer(att.updateLoc, att.size * 4,
            gl.FLOAT, false, PointPrimitives.bufferStride * 4, att.offset * 4
        );
    });

    gl.uniform1f(PointPrimitives.timeUniform.updateLoc, time);
    gl.uniform1f(PointPrimitives.animUniform.updateLoc, anim);

    gl.drawArrays(gl.TRIANGLES, 0, PointPrimitives.n_vertices);
}
