const board = new Board();
let p1 = board.addPoint();
let t1 = board.addText();

const animation = [
    () => {
        p1.init();
        t1.init(msg="hello");
        return board.NO_WAIT;
    },

    () => {
        p1.to(x=10, y=20, color=Colors.blue);
        t1.to(x=20, y=10, color=Colors.green);
        board.animate();
    },

    () => {
        p1.to(x=10, y=20, color=Colors.blue);
    },

    () => {
        p1.destroy(x=10, y=20, color=Colors.red);
    },
]

board.run(animation);