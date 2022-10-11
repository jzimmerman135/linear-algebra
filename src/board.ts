class Board {
    primitives: Array<canvasPrimitive>

    constructor() {
        this.primitives = [];
    }

    addPrimitive(p: canvasPrimitive) {
        this.primitives.push(p);
    }
}