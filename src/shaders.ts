const gl = (() => {
    const canvas = document.getElementById('contentWebGL') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2', { antialias: true});
    if (!gl) {
        console.error("Failed to get Webgl2 Rendering Context." + 
                      " Update your browser.");
        throw Error;
    }
    return gl;
})();

// @ts-ignore
const mat4 = glMatrix.mat4;

const shaders = {
    shaderCompileFail: (shader: WebGLShader) => {
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return true
        }
        return false;
    },

    shaderLinkFail: (program: WebGLProgram) => {
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return true;
        }
        return false;
    },

    resizeCanvas: () => {
        const canvas = gl.canvas;
        const width  = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width ||  canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        return true;
        }
        return false;
    },

    compileProgram(program: WebGLProgram, vss: string, fss: string): WebGLProgram {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
        gl.shaderSource(vertexShader, vss);
        gl.shaderSource(fragmentShader, fss);
        gl.compileShader(vertexShader);
        gl.compileShader(fragmentShader);
        if (this.shaderCompileFail(vertexShader) || this.shaderCompileFail(fragmentShader)) {
            throw Error;
        }

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (this.shaderLinkFail(program)) {
            throw Error;
        }

        return program;
    }
}