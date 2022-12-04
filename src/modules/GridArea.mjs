import {Square} from "./Square.mjs";
import {Color} from "./Color.mjs";

export class GridArea {
    x;
    y;
    rows;
    tileWidth;
    tileHeight;
    columns;
    tiles;

    constructor(x, y, tileWidth, tileHeight, rows, columns) {
        this.x = x;
        this.y = y;
        this.rows = rows;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.columns = columns;
        this.tiles = [];
    }

    update(canvas) {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].update(canvas);
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
}
