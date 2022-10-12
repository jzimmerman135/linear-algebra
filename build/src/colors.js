// Colors IIFE
var Colors = (function () {
    // All regularly used colors should go here
    // Design principle: 3 red, 3 blue, 
    var Black = { r: 0, g: 0, b: 0 };
    var White = { r: 1, g: 1, b: 1 };
    var Red = { r: 1, g: 0, b: 0 };
    var Green = { r: 0, g: 1, b: 0 };
    var Blue = { r: 0, g: 0, b: 0 };
    var colors = {
        black: Black,
        white: White,
        red: Red,
        green: Green,
        blue: Blue
    };
    return colors;
})();
