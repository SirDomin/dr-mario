import {EntityTypes} from "./EntityTypes.mjs";
import {Utils} from "./Utils.mjs";

export class GameObject {
    x;
    y;
    width;
    height;
    removeOnOutOfBound;
    type;
    collisionType;
    collisionChecks;
    id;
    color;
    speed;
    target;

    static COLLISION_TYPE_BOX = 1;

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.removeOnOutOfBound = false;
        this.type = EntityTypes.TYPE_DEFAULT_OBJECT;
        this.collisionType = GameObject.COLLISION_TYPE_BOX;
        this.collisionChecks = 0;
        this.id = Utils.generateId();
        this.color = 'red';
        this.speed = (6) * (Math.random() + 0.1);
        this.target = null;
    }

    update(canvas) {
        if (this.target) {
            this.x += -(this.speed) * Math.cos(Math.atan2(this.target.y - this.y, this.x - this.target.x));
            this.y += (this.speed) * Math.sin(Math.atan2(this.target.y - this.y, this.x - this.target.x));
        }
    }

    render(canvas) {
        canvas.drawSquare(this.x, this.y, this.width, this.height, this.color);
    }

    getMidPoint() {
        return new Point(this.x + this.width / 2, this.y + this.height / 2);
    }

    onClick() {

    }

    moveTo(x, y) {
        this.target = new Point(x, y);
    }

    collide(object) {
        game.removeObject(this.id);
    }

    checkCollision(object) {
        this.collisionChecks++;
        return (
            this.x + this.width >= object.x &&
            this.x <= object.x + object.width &&
            this.y + this.height >= object.y &&
            this.y <= object.y + object.height
        );
    }
}