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
            // let nextY = (this.y - this.grid.y) / this.height + this.speed / this.height;
            let nextY = this.yPos + 1;

            if (nextY <= this.grid.rows) {

                if (this.pill.grounded) {
                    if (((this.pill.destroyed || this.pill.hasBlocksBelow()) && !this.grid.isTileAtPos(this.xPos, this.yPos + 1, this) )) {
                        this.moveDown();
                        this.onCollision();
                    }
                    return;
                }

                if (this.pill.hasBlocksBelow() === false && this.pill.canMoveDown()) {
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

    canMoveToPos(x, y) {
        const newPosY = (y - this.grid.y) / this.height;
        const newPosX = (x - this.grid.x) / this.width + 1;

        return this.grid.isTileAtPos(newPosX, newPosY, this);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;

        this.yPos = (y - this.grid.y) / this.height;
        this.xPos = (x - this.grid.x) / this.width + 1;
    }

    onRemove() {
        this.pill.destroyed = true;
    }

    place() {
        this.steering = false;
        this.tickUpdate = this.baseTickUpdate / 10;
    }

    moveDown() {
        this.setPosition(this.x, this.y + this.speed);
    }

    onCollision() {
        this.pill.tileGrounded(this);
        this.tickUpdate = this.baseTickUpdate;
        this.steering = true;
        this.grid.handleCollisions();
    }
}
