import {GameObject} from "../GameObject.mjs";

export class StaticText extends GameObject {
    text;
    color;

    constructor(x, y, w, h, text, color) {
        super(x, y, w, h);

        this.color = color;
        this.text = text;
    }

    render(canvas) {
        canvas.writeText(this.text, this.x, this.y, this.color)
    }

    update(text = this.text) {
        this.text = text;
    }
}