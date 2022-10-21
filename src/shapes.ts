const shapesPainter = (() => {
    const vss = `#version 300 es
    uniform float u_time;
    uniform mat4 u_projection;
    uniform float u_maxdim;
    uniform float u_flipY;

    in vec4 u_position;
    in vec4 u_normal;

    in mat4 a_modelview_f;
    in mat4 a_modelview_b;
    in vec4 a_color1_f;
    in vec4 a_color1_b;
    in vec4 a_color2_f;
    in vec4 a_color2_b;

    out vec4 v_color1;
    out vec4 v_color2;
    out vec4 v_position;
    out vec4 v_normal;

    void main() {
        // if u_flipY then make the y value negative on position
        a_position.y = u_flipY > 0.01 ? -a_position.y : a_position.y;

        // smooth mix for animation
        float t = smoothstep(0.0, 1.0, u_time);
        mat4 a_modelview = mix(a_modelview_f, a_modelview_b, t); 
        vec4 a_color1 = mix(a_color1_f, a_color1_b, t);
        vec4 a_color2 = mix(a_color2_f, a_color2_b, t);

        gl_Position = a_modelview * u_projection * a_position;
        v_position = a_position / u_maxdim;
        v_color1 = a_color1;
        v_color2 = a_color2;
    }`;

    const fss = `#version 300 es
    in vec4 v_color1;
    in vec4 v_color2;
    in vec4 v_position;
    void main {
        outColor = mix(v_color1, v_color2, v_position.x);
    }`; 

    const program = gl.createProgram() as WebGLProgram;
    shaders.compileProgram(program, vss, fss);

    const frontVao = gl.createVertexArray() as WebGLVertexArrayObject;
    const backVao = gl.createVertexArray() as WebGLVertexArrayObject;

    const elemBuffer = gl.createBuffer() as WebGLBuffer;
    const modelBuffer = gl.createBuffer() as WebGLBuffer;
    const instanceBuffer = gl.createBuffer() as WebGLBuffer;

    var frontFirst = true;
    var vao = frontVao;

    // uniforms
    const uniforms = new Uniforms(
        program, [
            'u_time', 'u_projection', 'u_maxdim', 'u_flipY'
        ], [
            (loc, val) => {gl.uniform1f(loc, val)},
            (loc, val) => {gl.uniformMatrix4fv(loc, false, val)},
            (loc, val) => {gl.uniform1f(loc, val)},
            (loc, val) => {gl.uniform1f(loc, val)},
        ],
        [0, mat4.create(), 0.5, 0.0]
    );

    // model attributes
    const modelAttribs = new Attributes(
        program, [
            'a_position', 'a_normal'
        ],
        [3, 3], [0, 3], 6,
    );

    // instance attributes
    const frontInstanceOffsets = [0, 16, 32, 36, 40, 44, 48];
    const backInstanceOffsets = [16, 0, 36, 32, 44, 40, 48];
    const instanceAttribs = new Attributes(
        program, [
            'a_modelview_f', 'a_modelview_b', 'a_color1_f', 'a_color1_f',
            'a_color2_f', 'a_color2_b', 'a_anim'
        ],
        [16, 16, 4, 4, 4, 4, 1], new Array(7), 49, [1, 1, 1, 1, 1, 1, 1],
    );

    {
        const setupVAO = () => {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer);
            gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
            modelAttribs.enable(gl);
            gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
            instanceAttribs.enable(gl);
        }

        gl.bindVertexArray(frontVao);
        instanceAttribs.setOffsets(frontInstanceOffsets);
        setupVAO(); 

        gl.bindVertexArray(backVao);
        instanceAttribs.setOffsets(backInstanceOffsets);
        setupVAO();
    }

    return {
        program: program,
        bindElemData: (elemData: Int16Array) => {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elemData, gl.STATIC_DRAW);
        },
        bindModelData: (modelData: Float32Array) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, modelData, gl.STATIC_DRAW);
        },
        bindInstanceData: (instanceData: Float32Array) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.DYNAMIC_DRAW)
        },
        setUniform: (name: string, value: any) => {
            let setFunction = uniforms.setters[name];
            setFunction(value);
        },
        setFrontFirst: (isFrontFirst: boolean) => {
            frontFirst = isFrontFirst;
            vao = frontFirst ? frontVao : backVao;
        },
        draw: (mode: number, count: number, offset: number, nInstances: number) => {
            gl.bindVertexArray(vao);
            gl.drawElementsInstanced(mode, count, gl.SHORT, offset, nInstances);
        }
    }
})();

class shapesManager {
    #indexData: Int16Array;
    #modelData: Float32Array;
    #instanceData: Float32Array;
    #fromFirst: boolean;
    #nSegments: number;
    #nInstances: number;
    #nVertices: number;
    #stride = 49;

    constructor() {
        this.#indexData = new Int16Array([]);
        this.#modelData = new Float32Array([]);
        this.#instanceData = new Float32Array([]);
        this.#fromFirst = false;
        this.#nSegments = 15;
        this.#nInstances = 0;
        this.#nVertices = 0;
    }

    addInstance(modelView?: Float32Array, color1?: Float32Array, color2?: Float32Array, anim?: boolean) {
        this.#nInstances++;
        let oldInstanceData = this.#instanceData;
        let oldLen = oldInstanceData.length;
        this.#instanceData = new Float32Array(this.#nInstances * this.#stride);
        this.#instanceData.set(oldInstanceData);
        this.#instanceData.set(modelView || mat4.create(), oldLen);
        this.#instanceData.set(modelView || mat4.create(), oldLen + 16);
        this.#instanceData.set(color1 || [0,0,0,0], oldLen + 32);
        this.#instanceData.set(color1 || [0,0,0,0], oldLen + 36);
        this.#instanceData.set(color2 || [0,0,0,0], oldLen + 40);
        this.#instanceData.set(color2 || [0,0,0,0], oldLen + 44);
        this.#instanceData[oldLen + 48] = anim || false ? 0 : 1;
    }

    buildVertices(generateVertices: (nSegments: number) => number[]) {
        this.#modelData = new Float32Array(generateVertices(this.#nSegments));
    }
    
    buildIndices(generateIndices: (nSegments: number) => number[]) {
        let [count, data] = generateIndices(this.#nSegments);
        this.#indexData = new Int16Array(data);
        this.#nVertices = count;
    }

    setFrom(index: number, modelView?: Float32Array, color1?: Float32Array, color2?: Float32Array) {
        if (!this.#fromFirst) {
            this.setTo(index, modelView, color1, color2);
            return;
        }
        let offset = index * this.#stride;
        if (modelView)
            this.#instanceData.set(modelView, offset);
        if (color1)
            this.#instanceData.set(color1, offset + 32);
        if (color2)
            this.#instanceData.set(color2, offset + 40);
    }

    setTo(index: number, modelView?: Float32Array, color1?: Float32Array, color2?: Float32Array) {
        if (!this.#fromFirst) {
            this.setFrom(index, modelView, color1, color2);
            return;
        }
        let offset = index * this.#stride;
        if (modelView)
            this.#instanceData.set(modelView, offset + 16);
        if (color1)
            this.#instanceData.set(color1, offset + 36);
        if (color2)
            this.#instanceData.set(color2, offset + 44);
    }

    draw(time: number, reflection?: boolean) {
        gl.useProgram(shapesPainter.program);

        shapesPainter.bindElemData(this.#indexData);
        shapesPainter.bindModelData(this.#modelData);
        shapesPainter.bindInstanceData(this.#instanceData);

        shapesPainter.setUniform('u_time', time);
        shapesPainter.setUniform('u_flipY', 0.0);
        shapesPainter.draw(gl.TRIANGLES, this.#nVertices, 0, this.#nInstances);

        if (reflection) {
            shapesPainter.setUniform('u_flipY', 1.0);
            shapesPainter.draw(gl.TRIANGLES, this.#nVertices, 0, this.#nInstances);
        }
    }
}