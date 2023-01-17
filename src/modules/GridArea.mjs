import {Square} from "./Square.mjs";
import {Color} from "./Color.mjs";
import {Pill} from "./objects/Pill.mjs";
import {EntityTypes} from "./EntityTypes.mjs";
import {Options} from "./Options.mjs";
import {SocketMessage} from "./SocketMessage.mjs";

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
    client;
    pills;

    constructor(x, y, engine, client) {
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
        this.client = client;
        this.pills = [];
        this.serverTick = true;
        this.engine.addGrid(this);
    }

    setClient(client) {
        this.client = client;
    }

    addPills(data) {
        for (const x in data.pills) {
            this.pills.push([data.pills[x].color1, data.pills[x].color2]);
        }
    }

    handleEvent(socketMessage) {
        const data = socketMessage.data;

        if (data.client !== this.client) {
            return;
        }

        if (data.event === 'keyUp') {
            return;
        }

        switch(data.code) {
            case 39:
                this.movePillRight();
            break;
            case 37:
                this.movePillLeft();
            break;
            case 89:
                this.rotatePillRight();
            break;
            case 84:
                this.rotatePillLeft();
            break;
            case 32:
                this.placeBlock();
            break;
        }
    }

    update(canvas) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.pill !== this.tiles[i].pill && this.previewPill !== this.tiles[i].pill) {
                this.tiles[i].update(canvas);
            }
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

    isTileAtCoords(x, y, tile) {
        const yPos = (y - this.y) / this.tileHeight;
        const xPos = (x - this.x) / this.tileWidth + 1;

        return this.isTileAtPos(xPos, yPos, tile);
    }

    isOutOfBound(x, y) {
        const yPos = (y - this.y) / this.tileHeight;
        const xPos = (x - this.x) / this.tileWidth + 1;

        return xPos > this.columns || yPos > this.rows;
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

        this.engine.ws.send(SocketMessage.send(SocketMessage.TYPE_POINTS_UPDATED, {combo: tilesCombo.length, client: this.client}, this.engine.client));

        this.handleRemovedObjects();
    }

    gameOver() {
        this.engine.ws.send(SocketMessage.send(SocketMessage.TYPE_GAME_OVER, {client: this.client}, this.engine.client));
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
        if (this.pills.length <= 2) {
            this.engine.ws.send(SocketMessage.send(SocketMessage.TYPE_OUT_OF_PILLS, {}, this.engine.client));
        }

        let colors = this.pills.shift();

        if (!colors) {
            return;
        }

        if (this.previewPill) {
            this.pill = this.previewPill;
            this.pill.endPreview();

            this.previewPill = new Pill(this, this.tileWidth, colors[0], colors[1]);
        } else {
            this.previewPill = new Pill(this, this.tileWidth, colors[0], colors[1]);
        }
    }
}
