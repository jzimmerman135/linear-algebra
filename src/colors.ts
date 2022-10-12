interface RGB {
    r: number;
    g: number;
    b: number;
}

interface FourPointRGB {
    bl: RGB,
    br: RGB,
    tl: RGB,
    tr: RGB
}

// Colors IIFE
const Colors = (() => {

    // All regularly used colors should go here
    // Design principle: 3 red, 3 blue, 

    let Black: RGB = {r: 0, g: 0, b: 0}; 
    let White: RGB = {r: 1, g: 1, b: 1};
    let Red: RGB = {r: 1, g: 0, b: 0};
    let Green: RGB = {r: 0, g: 1, b: 0};
    let Blue: RGB = {r: 0, g: 0, b: 0};

    let colors = {
        black: Black,
        white: White,
        red: Red,
        green: Green,
        blue: Blue
    };

    return colors;

})();