// Colors IIFE
var Colors = (function () {
    // All regularly used colors should go here
    // Design principle: 3 red, 3 blue, 
    var Black = { r: 0, g: 0, b: 0, a: 1 };
    var White = { r: 1, g: 1, b: 1, a: 1 };
    var Red = { r: 1, g: 0, b: 0, a: 1 };
    var Green = { r: 0, g: 1, b: 0, a: 1 };
    var Blue = { r: 0, g: 0, b: 1, a: 1 };
    var Yellow = { r: 0, g: 1, b: 1, a: 1 };
    var Orange = { r: 1, g: 1, b: 0, a: 1 };
    var colors = {
        black: Black,
        white: White,
        red: Red,
        green: Green,
        blue: Blue,
        yellow: Yellow,
        orange: Orange
    };
    return colors;
})();
