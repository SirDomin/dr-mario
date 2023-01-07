import {GameObject} from "../GameObject.mjs";
import {Color} from "../Color.mjs";
import {EntityType} from "../EntityType.mjs";

export class Virus extends GameObject {
    tick;
    tickUpdate;
    xPos;
    yPos;

    constructor(width, grid, xPos, yPos, color, tickUpdate) {
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
        this.type = EntityType.TYPE_TILE;
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
            let nextY = (this.y - this.grid.y) / this.height + this.speed / this.height;

            if (nextY <= this.grid.rows) {

                if (this.pill.grounded) {
                    if (((this.pill.destroyed || this.pill.hasBlocksBelow()) && !this.grid.isTileAtPos(this.xPos, this.yPos + 1, this) )) {
                        this.moveDown();
                        this.onCollision();
                    }
                    return;
                }

                if (this.pill.hasBlocksBelow() === false) {
                    this.moveDown();
                } else {
                    this.onCollision();
                }

            } else {
                if (this.pill.grounded === false){
                    this.onGround = true;
                    this.onCollision();
                }
            }
        }
    }

    onRemove() {
        this.pill.destroyed = true;
    }

    place() {
        this.steering = false;
        this.tickUpdate = this.baseTickUpdate / 10;
    }

    moveDown() {
        this.y += this.speed;
        this.yPos += 1;
    }

    onCollision() {
        this.pill.tileGrounded(this);
        this.tickUpdate = this.baseTickUpdate;
        this.steering = true;
        this.grid.handleCollisions();
    }
}
