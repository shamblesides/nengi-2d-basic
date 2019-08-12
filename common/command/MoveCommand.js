import nengi from 'nengi'

export const STOP = 0;
export const RIGHT = 1;
export const DOWN = 2;
export const LEFT = RIGHT + 4;
export const UP = DOWN + 4;

class MoveCommand {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
    }
}

MoveCommand.protocol = {
    x: nengi.UInt10,
    y: nengi.UInt10,
    dir: nengi.UInt3,
}

export default MoveCommand;
