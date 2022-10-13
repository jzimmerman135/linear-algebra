interface RGBA {
    r: number;
    g: number;
    b: number;
    a?: number;
}

// Colors IIFE
const Colors = (() => {

    // All regularly used colors should go here
    // Design principle: 3 red, 3 blue, 

    let Black: RGBA = {r: 0, g: 0, b: 0, a: 1}; 
    let White: RGBA = {r: 1, g: 1, b: 1, a: 1};
    let Red: RGBA = {r: 1, g: 0, b: 0, a: 1};
    let Green: RGBA = {r: 0, g: 1, b: 0, a: 1};
    let Blue: RGBA = {r: 0, g: 0, b: 0, a: 1};

    let colors = {
        black: Black,
        white: White,
        red: Red,
        green: Green,
        blue: Blue
    };

    return colors;

})();