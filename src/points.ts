interface PointBufferRef {

};

class Point {
    ref: PointBufferRef;

    constructor(board) {
        ref = board.points.addOne();
    }
}