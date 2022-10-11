// The actual drawing on the canvas
// client should never interact with this directly
class canvasPrimitive {
    drawInit(animationTime: number) { unimplemented("drawInit() : canvasPrimitive"); }
    drawUpdate() { unimplemented("drawInit() : canvasPrimitive"); }
    drawDestroy(animationTime: number) { unimplemented("drawInit() : canvasPrimitive"); }
}

interface canvasDescriptor {
    primitive: canvasPrimitive;
    visible?: boolean;
    x?: number;
    y?: number;
}

/* POINTS */

class pointPrimitive extends canvasPrimitive{
    x: number;
    y: number;
    opacity: number;
    r: number;
    color: RGB;

    constructor() {
        super();
        this.x = 0;
        this.y = 0;
        this.opacity = 1;
        this.r = 1;
        this.color = RGBWhite;
    }

    drawInit() {
        
    }
};

interface pointDescriptor extends canvasDescriptor {
    primitive: pointPrimitive;
    x?: number;
    y?: number;
    opacity?: number;
    visible?: boolean;
    r?: number;
    color?: RGB;
}

function Point(board : Board) : pointDescriptor {
    let cp = new pointPrimitive;
    let cd: pointDescriptor = {primitive: cp};
    board.addPrimitive(cp);
    return cd;
}

const c = document.getElementById('content2d') as HTMLCanvasElement;


