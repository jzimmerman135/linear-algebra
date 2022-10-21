class Uniforms {
    setters: {[key: string]: (value: any) => void};

    constructor(
        program: WebGLProgram,
        names: string[],
        setters: ((loc: WebGLUniformLocation, value: any) => void)[],
        initVals?: any[],
    ){
        this.setters = {};
        for (let i = 0; i < names.length; i++) {
            let loc = gl.getUniformLocation(program, names[i]);
            let setFunction = setters[i];
            this.setters[names[i]] = (value: any) => {
                 setFunction(loc as WebGLUniformLocation, value)
            };
        }
        if (initVals) {
            for (let i = 0; i < names.length; i++) {
                const setFunction = this.setters[names[i]];
                setFunction(initVals[i]);
            }
        }
    }
}

class Attributes {
    count: number;
    stride: number;
    names: string[];
    sizes: number[];
    offsets: number[];
    locations: number[];
    divisors?: number[];

    constructor(
        program: WebGLProgram, 
        names: string[],
        sizes: number[],
        offsets: number[],
        stride: number,
        divisors?: number[]
    ) {
        this.count = names.length;
        this.stride = stride;

        if (this.count != sizes.length || this.count != offsets.length ||
            this.count != (divisors || names).length) {
            console.error("Attributes object has varying length initializers");
            throw Error;
        }

        this.names = [...names];
        this.sizes = [...sizes];
        this.offsets = [...offsets];
        this.divisors = divisors;
        this.locations = new Array<number>(this.count).fill(-1);
        if (divisors != undefined)
            this.divisors = [...divisors];
        
        for (let i = 0; i < this.count; i++) {
            this.locations[i] = gl.getAttribLocation(program, this.names[i]);
            if (this.locations[i] == -1) {
                console.error(`Can't find attribute ${this.names[i]}`);
                throw Error;
            }
        }
    }

    getLocations(program: WebGLProgram) {
        for (let i = 0; i < this.count; i++) {
            this.locations[i] = gl.getAttribLocation(program, this.names[i]);
            if (this.locations[i] == -1) {
                console.error(`Can't find attribute ${this.names[i]}`);
                throw Error;
            }
        }
    }

    setOffsets(offsets: number[]) {
        if (offsets.length != this.count) {
            console.error("offsets length doesn't match attributes count");
            return;
        }
        this.offsets = [...offsets];
    }

    enable(gl: WebGL2RenderingContext, type?: number, norm?: boolean) {
        for (let i = 0; i < this.count; i++) {
            gl.enableVertexAttribArray(this.locations[i]);
            gl.vertexAttribPointer(
                this.locations[i],
                this.sizes[i],
                type || gl.FLOAT,
                norm || false,
                this.stride,
                this.offsets[i]
            );
            if (this.divisors != undefined) {
                gl.vertexAttribDivisor(this.locations[i], this.divisors[i]);
            }
        }
    }
}