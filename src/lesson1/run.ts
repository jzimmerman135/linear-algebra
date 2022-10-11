// function claraError(msg: string) {
//     console.log(msg);
// }

// // The actual drawing on the canvas
// // client should never interact with this directly
// class canvasPrimitive { 
//     drawInit(animationTime: number) {
//         claraError("Unimplemented error: canvasPrimitive function is being called");
//     }
    
//     redraw() {
//         claraError("Unimplemented error: canvasPrimitive function is being called");
//     }

//     drawDelete(animationTime: number) {
//         claraError("Unimplemented error: canvasPrimitive function is being called");
//     }
// }

// // The description of the drawing on the canvas
// // client should use this to describe the canvasPrimitive animation end state
// class boardObject {
//     visible: boolean;
//     primitive: canvasPrimitive;
//     constructor(primitive: canvasPrimitive) {
//         this.visible = false;
//         this.primitive = primitive;
//     }

//     init() {
//         this.visible = true;
//         claraError("Unimplemented error: boardObject function is being called");
//     }

//     update() {
//         claraError("Unimplemented error: boardObject function is being called");
//     }

//     delete() {
//         this.visible = false;
//         claraError("Unimplemented error: boardObject function is being called");
//     }
// }

// class canvasPrimitivePoint extends canvasPrimitive {
//     x: number;
//     y: number;
//     r: number;
//     solid: boolean;
//     color: RGB;

//     constructor(
//         color: whiteRGB();
//         x: 0;
//         y: 0;
//         r: 1;

//     )
// }

// Point() {
//     return p1;
// }

// class Board {
//     context: HTMLElement;
//     animation: Array<ScreenStateDescriptor>;
//     primitives: Array<canvasPrimitive>;
//     animationLength: number;
//     boardW: number;
//     boardH: number;

//     constructor(ctx: HTMLElement) {
//         this.context = ctx;
//         this.animation = [];
//         this.primitives = [];
//         this.animationLength = 1;
//         this.boardH = ctx.clientHeight;
//         this.boardW = ctx.clientWidth;
//     }

//     add_animation(states: Array<ScreenStateDescriptor>) {
//         this.animation = states;
//     }

//     lerp_states(state1: number, state2: number) {

//     }

//     animate() {
//         return;
//     }
// }



// const board = Board(ctx)

// const p1 = Point(board)
// const p2 = Point(board)
// const c1 = Counter(board)

// function Point(board: Board) {
//     let cpPoint = canvasPrimitivePoint(board);
//     let boPoint = boardObjectPoint(cpPoint);
//     board.primitives.push(cpPoint);
//     return boPoint;
// }

// interface ScreenStateDescriptor {
//     to_init: Array<boardObject>;
//     to_update: Array<boardObject>;
// }

// animation_stages: Array<ScreenStateDescriptor> = [
//     screenState([
//         p1.init({ x:90, y:90, color:100, opacity:1 })
//     ], pause=0),

//     screenState([
//         p1.update({ color:{ r:250, g:233, b:234 }, opacity:1 }),
//         p2.update({ x:90, y:90, color:0xefefef, opacity:1 }),
//         c1.update({ x:90, y:90, color:0xefefef, opacity:1 })
//     ], pause=1),

//     screenState([
//         p1.delete(),
//         p2.update()
//     ], noWait = True),

// ]

// board.add_animation(animation_stages)


// interface vec3 {
//     x: number;
//     y: number;
//     z: number;
// }

// interface vec2 {
//     x: number;
//     y: number;
// }

// interface RGB {
//     r: number;
//     g: number;
//     b: number;
// }