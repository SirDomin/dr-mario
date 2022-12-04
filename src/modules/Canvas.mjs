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

        this.previousColor = 'rgba(130, 131, 124, 1)';
        this.ctx.fillStyle = this.previousColor;

        this.container.appendChild(this.canvas);
    }

    drawImage(img, square) {

    }

    drawSquare(square, color = this.previousColor) {
        this.changeColor(color);
        this.ctx.fillRect(square.x, square.y, square.w, square.h);
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