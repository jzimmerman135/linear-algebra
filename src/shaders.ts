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

interface WebGL2RenderingContext {
    resizeCanvas?: any;
}
gl.resizeCanvas = () => {resizeCanvasToDisplaySize(gl.canvas)};

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

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
    const width  = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width ||  canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
      return true;
    }
    return false;
}

function createProgramFromShaders(vss: string, fss: string): WebGLProgram {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
    gl.shaderSource(vertexShader, vss);
    gl.shaderSource(fragmentShader, fss);
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

    return program;
}