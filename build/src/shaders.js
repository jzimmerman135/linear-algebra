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
function defaultAttribDescriptor(size, offset, name) {
    var att = {
        size: size,
        offset: offset,
        name: name,
        initLoc: -1,
        updateLoc: -1,
        destroyLoc: -1
    };
    return att;
}
function defaultUniformDescriptor(name) {
    var uni = {
        name: name,
        initLoc: null,
        updateLoc: null,
        destroyLoc: null
    };
    return uni;
}
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
