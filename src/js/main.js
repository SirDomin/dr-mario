import {Canvas} from "../modules/Canvas.mjs";
import {Engine} from "../modules/Engine.mjs";
import {StaticText} from "../modules/objects/StaticText.mjs";
import {Color} from "../modules/Color.mjs";
import {GridArea} from "../modules/GridArea.mjs";
import {Options} from "../modules/Options.mjs";
import {SocketMessage} from "../modules/SocketMessage.mjs";

const ws = new WebSocket('ws://217.113.236.15:2137');

ws.onmessage = event => {
    const message = SocketMessage.read(event.data);

    switch (message.type) {
        case SocketMessage.TYPE_GAME_START:
            grid.setClient(message.data.players[0]);
            grid2.setClient(message.data.players[1])

            grid.addPill();
            grid2.addPill();
            // engine.run();

            break;
        case SocketMessage.TYPE_CONNECTION:
            engine.clientConnected(message.client);
            break;

        case SocketMessage.TYPE_PLAYER_KEY:

            break;
        case SocketMessage.TYPE_PLAYER_KEY_UPDATE:
            grid.handleEvent(message);
            grid2.handleEvent(message);
            break;
        case SocketMessage.TYPE_TICK:
            engine.animate();
        break;
        case SocketMessage.TYPE_PILL:
            grid.addPills(message.data);
            grid2.addPills(message.data);
        break;
    }
}

const container = document.getElementById('game-container');

const canvas = new Canvas(container, 500, 500);
const engine = new Engine(canvas, ws);

const fps = new StaticText(100, 10, 100, 10, 'test', Color.GREEN);
const grid = new GridArea(100, 100, engine);
const grid2 = new GridArea(300, 100, engine);

engine.addObject(fps);
engine.addObject(grid);
engine.addObject(grid2);

Options.configureKeysForGrid(engine, grid);

engine.onRun = function() {
    const tiles = grid.tiles.length;
    fps.text = `FPS: ${engine.fps}, tiles: ${tiles}`;

    if (tiles > 1000) {
        grid.tiles = [];
    }
}
