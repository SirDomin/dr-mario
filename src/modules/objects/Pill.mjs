import {GameObject} from "../GameObject.mjs";
import {Tile} from "./Tile.mjs";
import {Color} from "../Color.mjs";

export class Pill extends GameObject {
    tiles;
    grid;
    tilesGrounded;
    grounded;
    destroyed;
    rotated;
    position;

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
        this.rotated = false;
        this.position = 1;
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

    canMoveDown() {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].yPos + 1 > this.grid.rows && this.areBlocksAligned()) {
                return false;
            }
        }

        return true;
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

        let rotated;

        switch (this.position) {
            case 1:
                rotated = this.rotate(this.tiles[0].x, this.tiles[0].y, this.tiles[0].x, this.tiles[0].y - this.tiles[0].height);

                break;
            case 2:
                rotated = this.rotate(this.tiles[0].x + this.tiles[0].width, this.tiles[0].y, this.tiles[0].x, this.tiles[0].y)

                break;
            case 3:
                rotated = this.rotate(this.tiles[1].x, this.tiles[1].y - this.tiles[1].height, this.tiles[1].x, this.tiles[1].y)

                break;

            case 4:
                rotated = this.rotate(this.tiles[1].x, this.tiles[0].y + this.tiles[0].height, this.tiles[1].x + this.tiles[1].width, this.tiles[1].y);

                break;
        }

        if (!rotated) {
            return;
        }

        this.position = this.position % 4 + 1;
    }

    rotate(x1, y1, x2, y2) {
        if (this.grid.isTileAtCoords(x1, y1, this.tiles[0]) || this.grid.isTileAtCoords(x2, y2, this.tiles[1])){
            return false;
        }

        if (this.grid.isOutOfBound(x1, y1) || this.grid.isOutOfBound(x2, y2)) {
            return false;
        }

        this.rotated = !this.rotated;
        this.tiles[0].setPosition(x1, y1);
        this.tiles[1].setPosition(x2, y2);

        return true;
    }

    rotateRight() {
        if (!this.canMove()){
            return;
        }

        let rotated;

        switch (this.position) {
            case 1:
                rotated = this.rotate(this.tiles[0].x, this.tiles[0].y - this.tiles[0].height, this.tiles[0].x, this.tiles[0].y);

                break;
            case 2:
                rotated = this.rotate(this.tiles[0].x, this.tiles[0].y, this.tiles[0].x + this.tiles[0].width, this.tiles[0].y)

                break;
            case 3:
                rotated = this.rotate(this.tiles[0].x - this.tiles[0].width, this.tiles[0].y, this.tiles[1].x, this.tiles[1].y - this.tiles[1].height);

                break;

            case 4:
                rotated = this.rotate(this.tiles[0].x + this.tiles[0].width, this.tiles[0].y + this.tiles[0].height, this.tiles[0].x, this.tiles[0].y + this.tiles[0].height);

                break;
        }

        if (!rotated) {
            return;
        }

        this.position--;

        if (this.position === 0) {
            this.position = 4;
        }

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
        const baseX = this.tiles[0].x;

        if (this.rotated === false) {
            for (let i = 0; i < this.tiles.length; i++) {
                if (this.tiles[i].y !== baseY) {
                    return false;
                }
            }
        } else {
            for (let i = 0; i < this.tiles.length; i++) {
                if (this.tiles[i].x !== baseX) {
                    return false;
                }
            }

            if(Math.abs(this.tiles[0].yPos - this.tiles[1].yPos) > 1) {
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
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].update(canvas);
        }

        super.update(canvas);
    }

    render(canvas) {
        super.render(canvas);
    }
}
