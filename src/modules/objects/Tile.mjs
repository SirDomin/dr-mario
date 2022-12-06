import {GameObject} from "../GameObject.mjs";
import {Color} from "../Color.mjs";

export class Tile extends GameObject {

    tick;
    tickUpdate;

    constructor(width, grid, xPos, yPos, color) {
        super(grid.x + ((xPos - 1) * width), (grid.y + width) * yPos, width, width);
        this.color = color;
        this.speed = this.height;
        this.tick = 0;
        this.tickUpdate = 100;

        this.grid = grid;

        grid.tiles.push(this);
    }

    render(canvas) {
        canvas.drawSquare(this.x, this.y, this.width, this.height, this.color);
    }

    update(canvas) {
        this.tick++;
        if (this.tick % this.tickUpdate === 0) {
            this.tick = 0;
            if ((this.y - this.grid.y) / this.height + this.speed / this.height <= this.grid.rows) {
                this.y += this.speed;

            }
        }
    }
}
