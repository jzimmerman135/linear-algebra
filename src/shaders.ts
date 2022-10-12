const gl = (() => {
    const canvas = document.getElementById('contentWebGL') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
    if (!gl) {
        console.error("Failed to get Webgl2 Rendering Context." + 
                      " Update your browser.");
        throw Error;
    }
    return gl;
})();

interface AttributeDescriptor {
    size: number;
    offset: number;
    name: string;
    initLoc: number;
    updateLoc: number;
    destroyLoc: number;
}

function defaultAttribDescriptor(size: number, offset: number, name: string) {
    let att: AttributeDescriptor = {
        size: size,
        offset: offset,
        name: name,
        initLoc: -1,
        updateLoc: -1,
        destroyLoc: -1
    }
    return att;
} 

interface UniformDescriptor {
    name: string;
    initLoc: WebGLUniformLocation | null;
    updateLoc: WebGLUniformLocation | null; 
    destroyLoc: WebGLUniformLocation | null; 
}

function defaultUniformDescriptor(name: string) {
    let uni: UniformDescriptor = {
        name: name,
        initLoc: null,
        updateLoc: null,
        destroyLoc: null
    };
    return uni;
}

function shaderCompileFail(shader: WebGLShader) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return true
    }
    return false;
}

function shaderLinkFail(program: WebGLProgram) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return true;
    }
    return false;
}