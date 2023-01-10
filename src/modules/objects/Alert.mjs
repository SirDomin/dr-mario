import {GameObject} from "../GameObject.mjs";
import {Color} from "../Color.mjs";

export class Alert extends GameObject {
    static TYPE_INFO = 'INFO';

    text;
    color;
    lifetime;
    engine;
    type;

    constructor(text, type, engine) {
        super(150, 20, 200, 50);

        this.color = Color.RED;
        this.backgroundColor = Color.BLACK;
        this.text = text;
        this.lifetime = 200;
        this.engine = engine;
        this.type = type;
        this.renderPriority = 2;
        this.prepareColors();
    }

    prepareColors() {
        switch (this.type) {
            case Alert.TYPE_INFO:
                this.backgroundColor = Color.BLACK;
                this.color = Color.YELLOW;
            break;
        }
    }

    render(canvas) {
        canvas.drawSquare(this.x, this.y, this.width, this.height, this.backgroundColor);
        const fontSizeNeeded = this.width / this.text.length * 2.2
        canvas.setFont(fontSizeNeeded);
        canvas.writeText(this.text, this.x + 10, this.y + this.height / 2 + fontSizeNeeded * 0.3, this.color)
        canvas.setFont();
    }

    update(text) {
        this.lifetime--;

        if (this.lifetime <= 0) {
            this.engine.removeObject(this.id);
        }
    }
}