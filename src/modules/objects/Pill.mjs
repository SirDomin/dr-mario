import {GameObject} from "../GameObject.mjs";
import {Tile} from "./Tile.mjs";
import {Color} from "../Color.mjs";

export class Pill extends GameObject {
    tiles;
    grid;
    tilesGrounded;
    grounded;

    constructor(grid) {
        super(grid.x + (2 * 20), (grid.y + 20) * 4, 20, 20);

        this.grid = grid;
        this.tilesGrounded = 0;
        this.tiles = [
            new Tile(grid.tileWidth, grid, 4, 1, Color.GREEN, this, grid.tickUpdate),
            new Tile(grid.tileWidth, grid, 5, 1, Color.RED, this, grid.tickUpdate),
        ];

        this.grounded = false;
    }

    tileGrounded(tile) {
        if (this.grounded === false) {
            for (let i = 0; i < this.tiles.length; i++) {
                this.tiles[i].grounded = true;
            }

            this.grounded = true;
            this.grid.addPill();
        }

    }

    hasBlocksBelow() {
        if (!this.areBlocksAligned()) {
            return false;
        }

        for (let i = 0; i < this.tiles.length; i++) {
            if (this.grid.isTileAtPos(this.tiles[i].xPos, this.tiles[i].yPos + 1, this.tiles[i])) {
                return true;
            }
        }

        return false;
    }

    moveRight() {
        if (!this.canMove()){
            return;
        }

        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].xPos + 1 > this.grid.columns) {
                return;
            }
            if (this.grid.isTileAtPos(this.tiles[i].xPos + 1, this.tiles[i].yPos, this.tiles[i])) {
                return;
            }
        }

        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].x += 20;
            this.tiles[i].xPos +=1;
        }

    }

    moveLeft() {
        if (!this.canMove()){
            return;
        }

        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].xPos - 1 <= 0) {
                return;
            }

            if (this.grid.isTileAtPos(this.tiles[i].xPos - 1, this.tiles[i].yPos, this.tiles[i])) {
                return;
            }
        }

        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].x -= 20;
            this.tiles[i].xPos -=1;
        }
    }

    rotateLeft() {
        if (!this.canMove()){
            return;
        }

        alert('rotate left');
    }

    rotateRight() {
        if (!this.canMove()){
            return;
        }

        alert('rotate right');
    }

    placeBlock() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].place();
        }
    }

    areBlocksAligned() {
        const baseY = this.tiles[0].y;

        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].y !== baseY) {
                return false;
            }
        }

        return true;
    }

    canMove() {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].steering === false) {
                return false;
            }
        }

        return true;
    }

    update(canvas) {
        super.update(canvas);
    }

    render(canvas) {
        super.render(canvas);

    }
}