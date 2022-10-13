var Points = (function () {
    var MAX_DIM = 0.5;
    var INNER_RADIUS = 0.5; // fraction
    var DEFAULT_SEGMENTS = 30;
    var DEFAULT_INSTANCES = 0;
    var TO_OFFSET = 12;
    var STRIDE = 25;
    var n_segments = DEFAULT_SEGMENTS;
    var n_instances = DEFAULT_INSTANCES;
    var n_vertices = n_segments * 6;
    var modelData = createModel(n_segments);
    // FROM: translation (2) -> scale (1) -> rotation (1) -> color 1 and 2 (8) -> 
    // TO:   translation (2) -> scale (1) -> rotation (1) -> color 1 and 2 (8) ->
    // anim (1) || (25 total stride)
    var transformData = new Float32Array([]);
    // create model data
    function createModel(n_segments) {
        var r = MAX_DIM * INNER_RADIUS;
        var m = [];
        var rad = function (i) { return Math.PI * 2.0 * i / n_segments; };
        // calculate hollow circle
        for (var i = 0; i < n_segments; i++) {
            m.push(r * Math.cos(rad(i)), r * Math.sin(rad(i)));
            m.push(MAX_DIM * Math.cos(rad(i)), MAX_DIM * Math.sin(rad(i)));
            m.push(MAX_DIM * Math.cos(rad(i + 1)), MAX_DIM * Math.sin(rad(i + 1)));
            m.push(r * Math.cos(rad(i)), r * Math.sin(rad(i)));
            m.push(MAX_DIM * Math.cos(rad(i + 1)), MAX_DIM * Math.sin(rad(i + 1)));
            m.push(r * Math.cos(rad(i + 1)), r * Math.sin(rad(i + 1)));
        }
        return new Float32Array(m);
    }
    var vertexShaderSource = "#version 300 es\nuniform vec2 u_resolution;\nuniform float u_size;\nuniform float u_time;\nuniform float u_max_dimension;\n\nin float a_anim;\n\nin vec4 a_position;\n\nin vec4 a_transform_from; // translate(2) scale(1) rotate(1) \nin vec4 a_transform_to;   // translate(2) scale(1) rotate(1)\n\nin vec4 a_color1_from;\nin vec4 a_color2_from;\nin vec4 a_color1_to;\nin vec4 a_color2_to;\n\nout vec4 v_color1;\nout vec4 v_color2;\nout vec4 v_position;\nout float v_anim;\n\nmat4 MovementMatrix() {\n    vec4 transform = mix(a_transform_from, a_transform_to, smoothstep(0., 1., u_time));\n    \n    vec2 t = transform.xy;\n    float s = u_size * transform.z;\n    vec2 r = vec2(cos(transform.w), sin(transform.w));\n    vec2 a = u_resolution / max(u_resolution.x, u_resolution.y);\n    \n    mat4 tm = mat4(  1, 0, 0, t.x,     0, 1, 0, t.y,   0,0,1,0,  0,0,0,1);\n    mat4 sm = mat4(    s, 0, 0, 0,       0, s, 0, 0,   0,0,1,0,  0,0,0,1);\n    mat4 rm = mat4(r.x, -r.y, 0, 0,  r.y, r.x, 0, 0,   0,0,1,0,  0,0,0,1);\n    mat4 am = mat4(  a.y, 0, 0, 0,     0, a.x, 0, 0,   0,0,1,0,  0,0,0,1);\n    return sm * rm * tm * am;\n}\n\nvoid main()\n{\n    mat4 mm = MovementMatrix();\n    gl_Position = a_position * mm;\n    v_position = a_position / u_max_dimension;\n    v_color1 = mix(a_color1_from, a_color1_to, u_time);\n    v_color2 = mix(a_color2_from, a_color2_to, u_time);\n    v_anim = a_anim;\n}";
    var fragmentShaderSource = "#version 300 es\nprecision highp float;\n\nuniform float u_time;\n\nin vec4 v_color1;\nin vec4 v_color2;\nin vec4 v_position;\nin float v_anim;\n\nout vec4 outColor;\n\nvoid main()\n{\n    vec2 uv = v_position.xy;\n    outColor = mix(v_color1, v_color2, uv.x * 0.5 + 0.5);\n\n    uv *= 0.5;\n    if (abs(v_anim) > 0.05) {\n        float sign = (v_anim) / abs(v_anim);\n        if (fract(-atan(uv.y, uv.x)/6.28) > u_time * (5.0) * sign) {\n            outColor = vec4(0.0);\n        }\n    }\n}";
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
    gl.useProgram(program);
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var resolutionUnifLocation = gl.getUniformLocation(program, "u_resolution");
    var timeUnifLocation = gl.getUniformLocation(program, "u_time");
    var sizeUnifLocation = gl.getUniformLocation(program, "u_size");
    var maxdimUnifLocation = gl.getUniformLocation(program, "u_max_dimension");
    gl.uniform1f(sizeUnifLocation, 0.05);
    gl.uniform1f(maxdimUnifLocation, 0.5);
    gl.uniform1f(timeUnifLocation, 0.0);
    var modelBuffer = gl.createBuffer();
    var positionAttribLoc = gl.getAttribLocation(program, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttribLoc);
    gl.vertexAttribPointer(positionAttribLoc, 2, gl.FLOAT, false, 0, 0);
    var transformBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, transformBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, transformData, gl.DYNAMIC_DRAW);
    var transFromAttribLoc = gl.getAttribLocation(program, "a_transform_from");
    var color1FromAttribLoc = gl.getAttribLocation(program, "a_color1_from");
    var color2FromAttribLoc = gl.getAttribLocation(program, "a_color2_from");
    var transToAttribLoc = gl.getAttribLocation(program, "a_transform_to");
    var color1ToAttribLoc = gl.getAttribLocation(program, "a_color1_to");
    var color2ToAttribLoc = gl.getAttribLocation(program, "a_color2_to");
    var animAttribLocation = gl.getAttribLocation(program, "a_anim");
    gl.enableVertexAttribArray(transFromAttribLoc);
    gl.enableVertexAttribArray(color1FromAttribLoc);
    gl.enableVertexAttribArray(color2FromAttribLoc);
    gl.enableVertexAttribArray(transToAttribLoc);
    gl.enableVertexAttribArray(color1ToAttribLoc);
    gl.enableVertexAttribArray(color2ToAttribLoc);
    gl.enableVertexAttribArray(animAttribLocation);
    var F = false;
    gl.vertexAttribPointer(transFromAttribLoc, 4, gl.FLOAT, F, 25 * 4, 0 * 4);
    gl.vertexAttribPointer(color1FromAttribLoc, 4, gl.FLOAT, F, 25 * 4, 4 * 4);
    gl.vertexAttribPointer(color2FromAttribLoc, 4, gl.FLOAT, F, 25 * 4, 8 * 4);
    gl.vertexAttribPointer(transToAttribLoc, 4, gl.FLOAT, F, 25 * 4, 12 * 4);
    gl.vertexAttribPointer(color1ToAttribLoc, 4, gl.FLOAT, F, 25 * 4, 16 * 4);
    gl.vertexAttribPointer(color2ToAttribLoc, 4, gl.FLOAT, F, 25 * 4, 20 * 4);
    gl.vertexAttribPointer(animAttribLocation, 1, gl.FLOAT, F, 25 * 4, 24 * 4);
    gl.vertexAttribDivisor(transFromAttribLoc, 1);
    gl.vertexAttribDivisor(color1FromAttribLoc, 1);
    gl.vertexAttribDivisor(color2FromAttribLoc, 1);
    gl.vertexAttribDivisor(transToAttribLoc, 1);
    gl.vertexAttribDivisor(color1ToAttribLoc, 1);
    gl.vertexAttribDivisor(color2ToAttribLoc, 1);
    gl.vertexAttribDivisor(animAttribLocation, 1);
    gl.resizeCanvas();
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(resolutionUnifLocation, gl.canvas.width, gl.canvas.height);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    function draw(time) {
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
    function recalculateModel(new_n_segments) {
        n_segments = new_n_segments;
        var modelData = createModel(n_segments);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, modelData, gl.STATIC_DRAW);
        gl.bindVertexArray(vao);
        n_vertices = n_segments * 6;
    }
    function switchFromTo() {
        for (var i = 0; i < n_instances; i++) {
            var fromOffset = i * STRIDE;
            var toOffset = TO_OFFSET + i * STRIDE;
            for (var j = 0; j < TO_OFFSET; j++) {
                transformData[fromOffset + j] = transformData[toOffset + j];
            }
        }
    }
    function animPoint(i, anim) {
        transformData[i * STRIDE + STRIDE - 1] = anim;
    }
    function setPoint(i, from, x, y, s, r, c1, c2) {
        var off = i * STRIDE + (from ? 0 : TO_OFFSET);
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
    function setPointTo(p) {
        setPoint(p.index, false, p.x, p.y, p.s, p.r, p.c1, p.c2);
    }
    function setPointFrom(p) {
        setPoint(p.index, true, p.x, p.y, p.s, p.r, p.c1, p.c2);
    }
    function newPoint() {
        var p = { x: 0, y: 0, s: 1, r: 0, c1: Colors.white, c2: Colors.white };
        var index = n_instances;
        var longerData = new Float32Array(transformData.length + STRIDE);
        longerData.set(transformData);
        transformData = longerData;
        setPoint(index, true, p.x, p.y, p.s, p.r, p.c1, p.c2);
        setPoint(index, false, p.x, p.y, p.s, p.r, p.c1, p.c2);
        animPoint(n_instances, 0);
        n_instances++;
        n_vertices = n_instances * 6;
        return [index, p];
    }
    return {
        ANIM_NONE: 0,
        ANIM_OPEN: 1,
        ANIM_CLOSE: -1,
        program: program,
        model: { data: modelData, buffer: modelBuffer },
        instances: { data: transformData, buffer: modelBuffer },
        vao: vao,
        n_vertices: n_vertices,
        n_instances: n_instances,
        setSegments: recalculateModel,
        draw: draw,
        setOpenAnim: function (i, anim) { animPoint(i, anim ? 1 : 0); },
        setCloseAnim: function (i, anim) { animPoint(i, anim ? -1 : 0); },
        setAnim: function (i, anim) { animPoint(i, anim); },
        setToAsFrom: switchFromTo,
        setTo: setPointTo,
        setFrom: setPointFrom,
        addOne: newPoint,
        resizeAndDraw: function () {
            gl.useProgram(program);
            console.log("resized");
            gl.resizeCanvas();
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.uniform2f(resolutionUnifLocation, gl.canvas.width, gl.canvas.height);
            draw();
        }
    };
})();
Points.setSegments(50);
addEventListener('resize', function () {
    Points.resizeAndDraw();
});
function animate() {
    var then = 0;
    function render(now) {
        now *= 0.001; // convert to seconds
        var time = (now - then) / 1;
        Points.draw(time);
        if (time > 1)
            return;
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    return true;
}
;
var Point = /** @class */ (function () {
    function Point(settings) {
        var _a = Points.addOne(), index = _a[0], defaultSettings = _a[1];
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
    Point.prototype.unpackSettings = function (settings) {
        this.x = settings.x || this.x;
        this.y = settings.y || this.y;
        this.s = settings.s || this.s;
        this.r = settings.r || this.r;
        this.c1 = settings.c1 || this.c1;
        this.c2 = settings.c2 || this.c2;
    };
    Point.prototype.to = function (settings) {
        Points.setAnim(this.index, Points.ANIM_NONE);
        this.unpackSettings(settings);
        Points.setTo(this);
    };
    Point.prototype.init = function (settings) {
        this.unpackSettings(settings);
        Points.setFrom(this);
        Points.setTo(this);
        Points.setAnim(this.index, Points.ANIM_OPEN);
    };
    Point.prototype.destroy = function (settings) {
        this.unpackSettings(settings);
        Points.setTo(this);
        Points.setAnim(this.index, Points.ANIM_CLOSE);
    };
    return Point;
}());
var p1 = new Point({ c1: Colors.yellow, c2: Colors.orange });
Points.draw();
p1.to({ x: .5, s: 4, c1: Colors.orange, c2: Colors.red });
animate();
// console.log(p1);
