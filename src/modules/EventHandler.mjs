import {SocketMessage} from "./SocketMessage.mjs";

export class EventHandler {
    canvas;
    keysDown;
    keyHandlers;
    engine;

    constructor(canvas, engine){
        this.canvas = canvas;
        this.keysDown = [];
        this.keyHandlers = [];
        this.engine = engine;

        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('mousedown', this.onMouseDown);
    }

    handleKeysDown = () => {
        for (let x in this.keyHandlers) {
            if (this.keysDown[x]) {
                if(this.keyHandlers[x].single) {
                    if (this.keyHandlers[x].handled === true) {
                        continue;
                    }
                    this.keyHandlers[x].handled = true;
                }
                this.keyHandlers[x].callback();
            }
        }
    }

    addKeyHandler(keyCode, callback, single = false) {
        this.keyHandlers[keyCode] = {
            callback: callback,
            single: single
        };
    }

    onKeyDown = (e) => {
        this.keysDown[e.keyCode] = true;
        this.engine.ws.send(SocketMessage.send(SocketMessage.TYPE_PLAYER_KEY, {code: e.keyCode, event: 'keyDown'}, this.engine.client));
    }

    onKeyUp = (e) => {
        delete this.keysDown[e.keyCode];

        if (this.keyHandlers[e.keyCode]){
            this.keyHandlers[e.keyCode].handled = false;
        }

        this.engine.ws.send(SocketMessage.send(SocketMessage.TYPE_PLAYER_KEY, {code: e.keyCode, event: 'keyUp'}, this.engine.client));
    }

    onMouseDown = (e) => {
        const rect = this.canvas.canvas.getBoundingClientRect();
        let x = e.pageX - rect.x;
        let y = e.pageY - rect.y;
    }

    removeKeyHandler(keyCode) {
        delete this.keyHandlers[keyCode];
    }
}