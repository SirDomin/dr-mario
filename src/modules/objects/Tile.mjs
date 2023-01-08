import {GameObject} from "../GameObject.mjs";
import {Color} from "../Color.mjs";
import {EntityTypes} from "../EntityTypes.mjs";
import {Square} from "../Square.mjs";

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
        this.scan = false;
    }

    render(canvas) {
        const radiusStrength = 7;
        if (this.pill.destroyed === false) {
            let radii = [0, 0, 0, 0];

            switch(this.pill.position) {
                case 1:
                    if (this.pill.tiles[0] === this) {
                        radii = [radiusStrength, 0, 0, radiusStrength];
                    } else {
                        radii = [0, radiusStrength, radiusStrength, 0];
                    }
                    break;
                case 2:
                    if (this.pill.tiles[0] === this) {
                        radii = [0, 0, radiusStrength, radiusStrength];
                    } else {
                        radii = [radiusStrength, radiusStrength, 0, 0];
                    }
                    break;
                case 3:
                    if (this.pill.tiles[0] === this) {
                        radii = [0, radiusStrength, radiusStrength, 0];
                    } else {
                        radii = [radiusStrength, 0, 0, radiusStrength];
                    }
                    break;
                case 4:
                    if (this.pill.tiles[0] === this) {
                        radii = [radiusStrength, radiusStrength, 0, 0];
                    } else {
                        radii = [0, 0, radiusStrength, radiusStrength];
                    }
                    break;
            }
            canvas.roundRect(this.x, this.y, this.width, this.height, this.color, radii, 0.7, Color.BLACK);
        } else {
            canvas.roundRect(this.x, this.y, this.width, this.height, this.color, [radiusStrength], 0.7, Color.BLACK);
        }
    }

    update(canvas) {
        this.tick++;
        if (this.onGround === false && this.tick % this.tickUpdate === 0) {
            if (this.scan === true) {
                this.grid.handleCollisions();
                this.scan = false;
            }
            this.tick = 0;
            let nextY = this.yPos + 1;

            if (nextY <= this.grid.rows) {

                if (this.pill.grounded) {
                    if (((this.pill.destroyed) && !this.grid.isTileAtPos(this.xPos, this.yPos + 1, this) )) {
                        this.moveDown();
                        this.onCollision();
                    }
                    if (!this.pill.hasBlocksBelow() && this.pill.canMoveDown() && this.pill.destroyed === false) {
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
        this.scan = true;
    }

    onCollision() {
        this.pill.tileGrounded(this);
        this.tickUpdate = this.baseTickUpdate;
        this.steering = true;
        this.grid.handleCollisions();
    }
}
