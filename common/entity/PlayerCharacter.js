import nengi from 'nengi'
import { default as MoveCommand, UP, DOWN, LEFT, RIGHT, STOP } from '../command/MoveCommand.js';

const dxy = {
    [UP]: [0,-1],
    [DOWN]: [0,1],
    [LEFT]: [-1,0],
    [RIGHT]: [1,0],
    [STOP]: [0,0],
}

class PlayerCharacter {
    constructor() {
        this.x = 0
        this.y = 0
        this.lastDir = STOP;
        this.nextCmd = null;
        this.moveTime = 0;
    }

    processMove(/** @type{MoveCommand} */cmd) {
        this.nextCmd = cmd;
    }

    tick(delta) {
        if (this.moveTime > 0) {
            this.moveTime -= delta;
        }
        const cmd = this.nextCmd;
        if (this.moveTime > 0 || !cmd || cmd.dir === STOP || !dxy[cmd.dir] || cmd.x !== this.x || cmd.y !== this.y) {
            // console.log(cmd&&cmd.x, this.x, cmd&&cmd.y, this.y, cmd&&cmd.dir, this.moveTime)
            return;
        }

        const [dx, dy] = dxy[cmd.dir];
        this.x += dx;
        this.y += dy;
        this.lastDir = cmd.dir;
        this.nextCmd = null;
        this.moveTime = 1 / 60 * 16 / 1.5;
    }
}

PlayerCharacter.protocol = {
    x: nengi.UInt10,
    y: nengi.UInt10,
    fromDir: nengi.UInt3,
}

export default PlayerCharacter
