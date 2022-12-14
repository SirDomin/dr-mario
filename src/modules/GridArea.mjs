import {Square} from "./Square.mjs";
import {Color} from "./Color.mjs";
import {Pill} from "./objects/Pill.mjs";
import {EntityType} from "./EntityType.mjs";
import {Options} from "./Options.mjs";
import {LevelGenerator} from "./LevelGenerator.mjs";

export class GridArea {
    x;
    y;
    rows;
    tileWidth;
    tileHeight;
    columns;
    tiles;
    pill;
    indexesToRemove;
    engine;

    constructor(x, y, engine) {
        this.x = x;
        this.y = y;
        this.rows = Options.GRID_ROWS;
        this.tileWidth = Options.TILE_SIZE;
        this.tileHeight = Options.TILE_SIZE;
        this.tickUpdate = Options.TILE_UPDATE;
        this.columns = Options.GRID_COLUMNS;
        this.tiles = [];
        this.pill = null;
        this.indexesToRemove = [];
        this.engine = engine;

        this.levelGenerator = new LevelGenerator(Options.LEVEL, Options.MAP_SIZE, this);
        this.levelGenerator.generateLevel();

        this.prepareLevel();
        this.addPill();
    }

    prepareLevel() {
        this.tiles = this.tiles.concat(this.levelGenerator.getLevel());
        console.log(this.tiles);
    }

    update(canvas) {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].update(canvas);
        }

        if (this.pill) {
            this.pill.update(canvas);
        }
    }

    render(canvas) {
        let x = this.x;
        let y = this.y;

        for (let i = 0; i < (this.rows * this.columns); i++) {
            if (i % this.columns === 0) {
                x = this.x;
                y += this.tileHeight;
            }

            let square = new Square(x, y, this.tileWidth, this.tileHeight);
            x += this.tileWidth;

            canvas.squareBorder(square);
            // canvas.writeText()
        }

        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].render(canvas);
        }
    }

    isTileAtPos(xPos, yPos, tile) {
        return this.tiles.filter(object => {
            return (
                tile.pill !== object.pill &&
                xPos === object.xPos && yPos === object.yPos
            )
        }).length > 0;
    }

    getTileAtPos(xPos, yPos) {
        return this.tiles.filter(object => {
            return (
                xPos === object.xPos && yPos === object.yPos
            )
        });
    }

    handleCollisions() {
        for (let i = 0; i < this.pill.tiles.length; i++) {
            this.checkPositionY(this.pill.tiles[i]);
            this.checkPositionX(this.pill.tiles[i]);
        }
    }

    checkPositionY(tile) {

        let chain = 0;
        let tilesCombo = [];
        for (let i = 0; i <= this.rows + 1; i++) {
            const tileFound = this.getTileAtPos(tile.xPos, i)[0] ?? null;

            if (tileFound && tileFound.color === tile.color) {
                chain++;
                tilesCombo.push(tileFound);
            } else {
                if (chain >= 4) {
                    this.handleCombo(tilesCombo);
                }
                tilesCombo = [];
                chain = 0;
            }
        }

        if (chain >= 4) {
            this.handleCombo(tilesCombo);
        }
    }

    checkPositionX(tile) {
        let chain = 0;
        let tilesCombo = [];
        for (let i = 0; i <= this.columns + 1; i++) {
            const tileFound = this.getTileAtPos(i, tile.yPos)[0] ?? null;

            if (tileFound !== null && tileFound.color === tile.color) {
                chain++;
                tilesCombo.push(tileFound);
            } else {
                if (chain >= 4) {
                    this.handleCombo(tilesCombo);
                }
                tilesCombo = [];
                chain = 0;
            }
        }

    }

    handleCombo(tilesCombo) {
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < tilesCombo.length; j++) {
                if (this.tiles[i].id === tilesCombo[j].id) {
                    this.tiles[i].color = Color.PINK;
                    this.tiles[i].onRemove();
                    this.indexesToRemove.push(i);
                }
            }
        }

        this.handleRemovedObjects();
    }

    handleRemovedObjects() {
        let indexes = new Set(
            this.indexesToRemove.sort((a, b) => {
                return b-a
            })
        );

        indexes.forEach(index => {
            this.tiles.splice(index, 1);
        });

        this.indexesToRemove = [];
    }

    checkChain(tile) {

    }

    placeBlock() {
        this.pill.placeBlock();
    }

    tileGrounded() {
        this.pill.tileGrounded();
    }

    movePillRight() {
        this.pill.moveRight();
    }

    movePillLeft() {
        this.pill.moveLeft();
    }

    rotatePillRight() {
        this.pill.rotateRight();
    }

    rotatePillLeft() {
        this.pill.rotateLeft();
    }

    addPill() {
        if (this.pill) {
            this.pill.tiles = [];
        }

        this.pill = new Pill(this, this.tileWidth);
    }
}
