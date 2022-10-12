interface CanvasElementDescriptor {
    index: number;
};

interface PointValueDescriptor extends CanvasElementDescriptor {
    index: number;
    x: number;
    y: number;
    rotation: number;
    scale_x: number;
    scale_y: number;
    width: number;
    opacity: number;
    color: FourPointRGB; // bl br tl tr
};

function defaultPointValueDescriptor(index: number) : PointValueDescriptor {
    return {
        index: index,
        x: 0,
        y: 0,
        rotation: 0,
        scale_x: 1,
        scale_y: 1,
        width: 1,
        opacity: 1,
        color: {
            bl: Colors.white, br: Colors.white,
            tl: Colors.white, tr: Colors.white
        },
    }
}

interface PointReference {
    index: number;
    x: number;
    y: number;
    rotation: number;
    scale_x: number;
    scale_y: number;
    width: number;
    color_r: number;
    color_g: number;
    color_b: number;
};

interface AnimationDescriptor {
    type: number;
    desc: CanvasElementDescriptor;
};