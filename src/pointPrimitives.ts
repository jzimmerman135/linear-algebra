const Points = (() => {
    
const MAX_DIM = 0.5;
const INNER_RADIUS = 0.5; // fraction
const DEFAULT_SEGMENTS = 30;
const DEFAULT_INSTANCES = 0;
const TO_OFFSET = 12;
const STRIDE = 25;

var n_segments = DEFAULT_SEGMENTS;
var n_instances = DEFAULT_INSTANCES;
var n_vertices = n_segments * 6;

var modelData = createModel(n_segments);

// FROM: translation (2) -> scale (1) -> rotation (1) -> color 1 and 2 (8) -> 
// TO:   translation (2) -> scale (1) -> rotation (1) -> color 1 and 2 (8) ->
// anim (1) || (25 total stride)
var transformData = new Float32Array([]);

// create model data
function createModel(n_segments: number) {
    let r = MAX_DIM * INNER_RADIUS;
    let m: number[] = [];
    let rad = (i: number) => { return Math.PI * 2.0 * i / n_segments };

    // calculate hollow circle
    for (let i = 0; i < n_segments; i++) {
        m.push(r * Math.cos(rad(i)), r * Math.sin(rad(i))  );
        m.push(MAX_DIM * Math.cos(rad(i)), MAX_DIM * Math.sin(rad(i))  );
        m.push(MAX_DIM * Math.cos(rad(i+1)), MAX_DIM * Math.sin(rad(i+1)));
        m.push(r * Math.cos(rad(i)), r * Math.sin(rad(i))  );
        m.push(MAX_DIM * Math.cos(rad(i+1)), MAX_DIM * Math.sin(rad(i+1))); 
        m.push(r * Math.cos(rad(i+1)), r * Math.sin(rad(i+1)));
    }
    return new Float32Array(m);
}

const vertexShaderSource = `#version 300 es
uniform vec2 u_resolution;
uniform float u_size;
uniform float u_time;
uniform float u_max_dimension;

in float a_anim;

in vec4 a_position;

in vec4 a_transform_from; // translate(2) scale(1) rotate(1) 
in vec4 a_transform_to;   // translate(2) scale(1) rotate(1)

in vec4 a_color1_from;
in vec4 a_color2_from;
in vec4 a_color1_to;
in vec4 a_color2_to;

out vec4 v_color1;
out vec4 v_color2;
out vec4 v_position;
out float v_anim;

mat4 MovementMatrix() {
    vec4 transform = mix(a_transform_from, a_transform_to, smoothstep(0., 1., u_time));
    
    vec2 t = transform.xy;
    float s = u_size * transform.z;
    vec2 r = vec2(cos(transform.w), sin(transform.w));
    vec2 a = u_resolution / max(u_resolution.x, u_resolution.y);
    
    mat4 tm = mat4(  1, 0, 0, t.x,     0, 1, 0, t.y,   0,0,1,0,  0,0,0,1);
    mat4 sm = mat4(    s, 0, 0, 0,       0, s, 0, 0,   0,0,1,0,  0,0,0,1);
    mat4 rm = mat4(r.x, -r.y, 0, 0,  r.y, r.x, 0, 0,   0,0,1,0,  0,0,0,1);
    mat4 am = mat4(  a.y, 0, 0, 0,     0, a.x, 0, 0,   0,0,1,0,  0,0,0,1);
    return sm * rm * tm * am;
}

void main()
{
    mat4 mm = MovementMatrix();
    gl_Position = a_position * mm;
    v_position = a_position / u_max_dimension;
    v_color1 = mix(a_color1_from, a_color1_to, u_time);
    v_color2 = mix(a_color2_from, a_color2_to, u_time);
    v_anim = a_anim;
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform float u_time;

in vec4 v_color1;
in vec4 v_color2;
in vec4 v_position;
in float v_anim;

out vec4 outColor;

void main()
{
    vec2 uv = v_position.xy;
    outColor = mix(v_color1, v_color2, uv.x * 0.5 + 0.5);

    uv *= 0.5;
    if (abs(v_anim) > 0.05) {
        float sign = (v_anim) / abs(v_anim);
        if (fract(-atan(uv.y, uv.x)/6.28) > u_time * (5.0) * sign) {
            outColor = vec4(0.0);
        }
    }
}`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
gl.shaderSource(vertexShader, vertexShaderSource);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);
if (shaders.shaderCompileFail(vertexShader) || shaders.shaderCompileFail(fragmentShader)) {
    throw Error;
}

const program = gl.createProgram() as WebGLProgram;
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (shaders.shaderLinkFail(program)) {
    throw Error;
}

gl.useProgram(program);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const resolutionUnifLocation = gl.getUniformLocation(program, "u_resolution");
const timeUnifLocation = gl.getUniformLocation(program, "u_time");
const sizeUnifLocation = gl.getUniformLocation(program, "u_size");
const maxdimUnifLocation = gl.getUniformLocation(program, "u_max_dimension");
gl.uniform1f(sizeUnifLocation, 0.05);
gl.uniform1f(maxdimUnifLocation, 0.5);
gl.uniform1f(timeUnifLocation, 0.0);

const modelBuffer = gl.createBuffer();
const positionAttribLoc = gl.getAttribLocation(program, "a_position");
gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
gl.bufferData(gl.ARRAY_BUFFER, modelData, gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttribLoc);
gl.vertexAttribPointer(positionAttribLoc, 2, gl.FLOAT, false, 0, 0);

const transformBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, transformBuffer);
gl.bufferData(gl.ARRAY_BUFFER, transformData, gl.DYNAMIC_DRAW);
const transFromAttribLoc = gl.getAttribLocation(program, "a_transform_from");
const color1FromAttribLoc = gl.getAttribLocation(program, "a_color1_from");
const color2FromAttribLoc = gl.getAttribLocation(program, "a_color2_from");
const transToAttribLoc = gl.getAttribLocation(program, "a_transform_to");
const color1ToAttribLoc = gl.getAttribLocation(program, "a_color1_to");
const color2ToAttribLoc = gl.getAttribLocation(program, "a_color2_to");
const animAttribLocation = gl.getAttribLocation(program, "a_anim");

gl.enableVertexAttribArray(transFromAttribLoc);
gl.enableVertexAttribArray(color1FromAttribLoc);
gl.enableVertexAttribArray(color2FromAttribLoc);
gl.enableVertexAttribArray(transToAttribLoc);
gl.enableVertexAttribArray(color1ToAttribLoc);
gl.enableVertexAttribArray(color2ToAttribLoc);
gl.enableVertexAttribArray(animAttribLocation);

let F = false;
gl.vertexAttribPointer(transFromAttribLoc,  4, gl.FLOAT, F, 25 * 4, 0 * 4);
gl.vertexAttribPointer(color1FromAttribLoc, 4, gl.FLOAT, F, 25 * 4, 4 * 4);
gl.vertexAttribPointer(color2FromAttribLoc, 4, gl.FLOAT, F, 25 * 4, 8 * 4);
gl.vertexAttribPointer(transToAttribLoc,    4, gl.FLOAT, F, 25 * 4, 12 * 4);
gl.vertexAttribPointer(color1ToAttribLoc,   4, gl.FLOAT, F, 25 * 4, 16 * 4);
gl.vertexAttribPointer(color2ToAttribLoc,   4, gl.FLOAT, F, 25 * 4, 20 * 4);
gl.vertexAttribPointer(animAttribLocation,  1, gl.FLOAT, F, 25 * 4, 24 * 4);

gl.vertexAttribDivisor(transFromAttribLoc, 1);
gl.vertexAttribDivisor(color1FromAttribLoc, 1);
gl.vertexAttribDivisor(color2FromAttribLoc, 1);
gl.vertexAttribDivisor(transToAttribLoc, 1);
gl.vertexAttribDivisor(color1ToAttribLoc, 1);
gl.vertexAttribDivisor(color2ToAttribLoc, 1);
gl.vertexAttribDivisor(animAttribLocation, 1);

shaders.resizeCanvas();
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.uniform2f(resolutionUnifLocation, gl.canvas.width, gl.canvas.height);

gl.disable(gl.DEPTH_TEST);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


function draw(time?: number) {
    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(vao);

    if (time != undefined)
        gl.uniform1f(timeUnifLocation, time);

    gl.bindBuffer(gl.ARRAY_BUFFER, transformBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, transformData, gl.DYNAMIC_DRAW);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, n_segments * 6, n_instances);
}

// function resizeAndDraw(time=0) {
//     gl.resizeCanvas();
//     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//     gl.uniform2f(resolutionUnifLocation, gl.canvas.width, gl.canvas.height);
//     draw();
// }

function recalculateModel(new_n_segments: number) {
    n_segments = new_n_segments;
    const modelData = createModel(n_segments);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData, gl.STATIC_DRAW);
    gl.bindVertexArray(vao);
    n_vertices = n_segments * 6;
}

function switchFromTo() {
    for (let i = 0; i < n_instances; i++) {
        let fromOffset = i * STRIDE;
        let toOffset = TO_OFFSET + i * STRIDE;
        for (let j = 0; j < TO_OFFSET; j++) {
            transformData[fromOffset + j] = transformData[toOffset + j];
        }
    }
}

function animPoint(i: number, anim: number) {
    transformData[i * STRIDE + STRIDE - 1] = anim;
}

function setPoint(i: number, from: boolean, x: number, y: number,
                  s: number, r: number, c1: RGBA, c2: RGBA) {
    let off = i * STRIDE + (from ? 0 : TO_OFFSET);
    transformData[off + 0] = x;
    transformData[off + 1] = y;
    transformData[off + 2] = s;
    transformData[off + 3] = r;
    transformData[off + 4] = c1.r;
    transformData[off + 5] = c1.g;
    transformData[off + 6] = c1.b;
    transformData[off + 7] = c1.a || 1.0;
    transformData[off + 8] = c2.r;
    transformData[off + 9] = c2.g;
    transformData[off + 10] = c2.b;
    transformData[off + 11] = c2.a || 1.0;
}

function setPointTo(p: Point) {
    setPoint(p.index, false, p.x, p.y, p.s, p.r, p.c1, p.c2);
}

function setPointFrom(p: Point) {
    setPoint(p.index, true, p.x, p.y, p.s, p.r, p.c1, p.c2);
}

function newPoint() {
    let p = { x: 0, y: 0, s: 1, r: 0, c1: Colors.white, c2: Colors.white };
    let index = n_instances;
    let longerData = new Float32Array(transformData.length + STRIDE);
    longerData.set(transformData);
    transformData = longerData;
    setPoint(index, true, p.x, p.y, p.s, p.r, p.c1, p.c2);
    setPoint(index, false, p.x, p.y, p.s, p.r, p.c1, p.c2);
    animPoint(n_instances, 0);
    n_instances++;
    n_vertices = n_instances * 6;
    return [index, p] as const;
}

return {
    ANIM_NONE: 0,
    ANIM_OPEN: 1,
    ANIM_CLOSE: -1,
    program: program,
    model: {data: modelData, buffer: modelBuffer},
    instances: {data: transformData, buffer: modelBuffer},
    vao: vao,
    n_vertices: n_vertices,
    n_instances: n_instances,
    setSegments: recalculateModel,
    draw: draw,
    setOpenAnim: (i: number, anim: boolean) => {animPoint(i, anim ? 1 : 0)},
    setCloseAnim: (i: number, anim: boolean) => {animPoint(i, anim ? -1 : 0)},
    setAnim: (i: number, anim: number) => {animPoint(i, anim)},
    setToAsFrom: switchFromTo,
    setTo: setPointTo,
    setFrom: setPointFrom, 
    addOne: newPoint,
    resizeAndDraw: () => {
        gl.useProgram(program);
        console.log("resized");
        shaders.resizeCanvas();
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(resolutionUnifLocation, gl.canvas.width, gl.canvas.height);
        draw();
    }
};
})();

Points.setSegments(50);

addEventListener('resize', () => {
    Points.resizeAndDraw();
});

function animate() {
    var then = 0;
    function render(now: number) {
        now *= 0.001;  // convert to seconds
        const time = (now - then) / 1;
        Points.draw(time);
        if (time > 1)
            return;
        
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return true;
}

// Points.setCloseAnim(0, true);
// Points.setToAsFrom();

// setTimeout(() => {
//     Points.setTo(0, 0, 0, );
// }, 2000);

interface PointSettings {
    x?: number;
    y?: number;
    s?: number;
    r?: number;
    c1?: RGBA; 
    c2?: RGBA;
};

class Point {
    index: number;
    x: number;
    y: number;
    s: number;
    r: number;
    c1: RGBA; 
    c2: RGBA;

    constructor(settings?: PointSettings) {
        let [index, defaultSettings] = Points.addOne();
        this.index = index;
        this.x = defaultSettings.x;
        this.y = defaultSettings.y;
        this.s = defaultSettings.s;
        this.r = defaultSettings.r;
        this.c1 = defaultSettings.c1;
        this.c2 = defaultSettings.c2;
        if (settings != undefined)
            this.unpackSettings(settings);
        Points.setFrom(this);
        Points.setTo(this);
    }

    unpackSettings(settings: PointSettings) {
        this.x = settings.x || this.x;
        this.y = settings.y || this.y;
        this.s = settings.s || this.s;
        this.r = settings.r || this.r;
        this.c1 = settings.c1 || this.c1;
        this.c2 = settings.c2 || this.c2;
    }

    to(settings: PointSettings) {
        Points.setAnim(this.index, Points.ANIM_NONE);
        this.unpackSettings(settings);
        Points.setTo(this);
    }

    init(settings: PointSettings) {
        this.unpackSettings(settings);
        Points.setFrom(this);
        Points.setTo(this);
        Points.setAnim(this.index, Points.ANIM_OPEN);
    }

    destroy(settings: PointSettings) {
        this.unpackSettings(settings);
        Points.setTo(this);
        Points.setAnim(this.index, Points.ANIM_CLOSE);
    }
}

let p1 = new Point({c1: Colors.yellow, c2: Colors.orange});
Points.draw();
p1.to({x: .5, s: 4, c1: Colors.orange, c2: Colors.red});

animate();
// console.log(p1);