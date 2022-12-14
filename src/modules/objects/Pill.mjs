import {GameObject} from "../GameObject.mjs";
import {Tile} from "./Tile.mjs";
import {Color} from "../Color.mjs";

export class Pill extends GameObject {
    tiles;
    grid;
    tilesGrounded;
    grounded;
    destroyed;

    constructor(grid, tileSize) {
        super(grid.x + (2 * tileSize), (grid.y + tileSize) * 4, tileSize, tileSize);

        this.grid = grid;
        this.tilesGrounded = 0;
        this.tiles = [
            new Tile(grid.tileWidth, grid, 4, 1, this.pickColor(), this, grid.tickUpdate),
            new Tile(grid.tileWidth, grid, 5, 1, this.pickColor(), this, grid.tickUpdate),
        ];
        this.destroyed = false;
        this.grounded = false;
    }

    setPositions(posX, posY, posX1, posY1) {
        this.tiles = [
            new Tile(this.grid.tileWidth, this.grid, posX, posY, this.pickColor(), this, this.grid.tickUpdate),
            new Tile(this.grid.tileWidth, this.grid, posX1, posY1, this.pickColor(), this, this.grid.tickUpdate),
        ];
    }

    pickColor() {
        let colors = [
            Color.RED,
            Color.YELLOW,
            Color.GREEN,
            Color.PINK
        ];

        return colors[Math.floor(Math.random() * colors.length)];
    }

    tileGrounded(tile) {
        if (this.grounded === false) {
            for (let i = 0; i < this.tiles.length; i++) {
                this.tiles[i].grounded = true;
            }

            this.grounded = true;
            this.grid.handleCollisions();

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
            this.tiles[i].x += this.grid.tileWidth;
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
            this.tiles[i].x -= this.grid.tileWidth;
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
        if (this.tiles.length < 2) {
            return false;
        }
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
