var gl = (function () {
    var canvas = document.getElementById('contentWebGL');
    var gl = canvas.getContext('webgl2', { antialias: true });
    if (!gl) {
        console.error("Failed to get Webgl2 Rendering Context." +
            " Update your browser.");
        throw Error;
    }
    return gl;
})();
gl.resizeCanvas = function () { resizeCanvasToDisplaySize(gl.canvas); };
function shaderCompileFail(shader) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return true;
    }
    return false;
}
function shaderLinkFail(program) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return true;
    }
    return false;
}
function resizeCanvasToDisplaySize(canvas) {
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}
function createProgramFromShaders(vss, fss) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vss);
    gl.shaderSource(fragmentShader, fss);
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
    return program;
}
