import {Color} from "./Color.mjs";

export class Canvas {
    container;
    width;
    height;
    canvas;
    ctx;
    previousColor;

    constructor(container, width, height) {
        this.container = container;
        this.width = width;
        this.height = height;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.previousColor = Color.PINK;
        this.ctx.fillStyle = this.previousColor;

        this.container.appendChild(this.canvas);
    }

    drawImage(img, square) {

    }

    drawSquare(x, y, w, h, color = this.previousColor) {
        this.changeColor(color);
        this.ctx.fillRect(x, y, w, h);
    }

    roundRect(x, y, w, h, color, radii, strokeWidth = 0, strokeColor = Color.BLACK) {
        this.ctx.lineWidth = strokeWidth;
        this.ctx.strokeStyle = strokeColor;
        this.changeColor(color);
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, w, h, radii);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
    }

    squareBorder(square, color = Color.GRAY, size = 0.1) {
        this.ctx.lineWidth = size;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.rect(square.x, square.y, square.w, square.h);
        this.ctx.stroke();
    }

    writeText = (text, x, y, color = this.previousColor) => {
        this.changeColor(color)
        this.ctx.fillText(text, x, y);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    changeColor(color) {
        this.previousColor = this.ctx.fillStyle;
        this.ctx.fillStyle = color;
    }
}