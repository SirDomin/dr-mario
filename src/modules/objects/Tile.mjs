import {GameObject} from "../GameObject.mjs";
import {Color} from "../Color.mjs";
import {EntityTypes} from "../EntityTypes.mjs";

export class Tile extends GameObject {
    tick;
    tickUpdate;
    onGround;
    xPos;
    yPos;
    pill;
    grounded;
    steering;

    constructor(width, grid, xPos, yPos, color, pill, tickUpdate) {
        super(grid.x + ((xPos - 1) * width), (grid.y + width) * yPos, width, width);

        this.xPos = xPos;
        this.yPos = yPos;

        this.color = color;
        this.speed = this.height;
        this.tick = 0;
        this.tickUpdate = tickUpdate;
        this.baseTickUpdate = tickUpdate;
        this.onGround = false;
        this.grid = grid;
        this.type = EntityTypes.TYPE_TILE;
        this.collisionType = GameObject.COLLISION_TYPE_BOX;
        this.pill = pill;
        this.grounded = false;
        this.steering = true;
        grid.tiles.push(this);
    }

    render(canvas) {
        canvas.drawSquare(this.x, this.y, this.width, this.height, this.color);
    }

    update(canvas) {
        this.tick++;
        if (this.onGround === false && this.tick % this.tickUpdate === 0) {
            this.tick = 0;
            let nextX = this.x;
            let nextY = (this.y - this.grid.y) / this.height + this.speed / this.height;

            if (nextY <= this.grid.rows) {

                if (this.grounded) {
                    return;
                }

                if (this.pill.hasBlocksBelow() === false) {
                    this.moveDown();
                } else {
                    this.onCollision();
                }

            } else {
                if (this.pill.grounded === false){
                    this.grounded = true;
                    this.onGround = true;
                    this.onCollision();
                }
            }
        }
    }

    place() {
        this.steering = false;
        this.tickUpdate = this.baseTickUpdate / 8;
    }

    moveDown() {
        this.y += this.speed;
        this.yPos += 1;
    }

    onCollision() {
        this.pill.tileGrounded(this);
        this.tickUpdate = this.baseTickUpdate;
        this.steering = true;
    }
}
