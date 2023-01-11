import {Canvas} from "../modules/Canvas.mjs";
import {Engine} from "../modules/Engine.mjs";
import {StaticText} from "../modules/objects/StaticText.mjs";
import {Color} from "../modules/Color.mjs";
import {GridArea} from "../modules/GridArea.mjs";
import {Options} from "../modules/Options.mjs";
import {SocketMessage} from "../modules/SocketMessage.mjs";
import {Alert} from "../modules/objects/Alert.mjs";

const serverIp = 'ws://192.168.0.106:8080';

const ws = new WebSocket(serverIp);

ws.onerror = event => {
    engine.addObject(new Alert(`could not connect to server`, Alert.TYPE_ERROR, engine));
}

ws.onopen = event => {
    engine.addObject(new Alert(`Connected to server!`, Alert.TYPE_SUCCESS, engine));
}

ws.onmessage = event => {
    const message = SocketMessage.read(event.data);

    switch (message.type) {
        case SocketMessage.TYPE_GAME_START:
            grid.setClient(message.data.players[0]);
            grid2.setClient(message.data.players[1])

            grid.addPill();
            grid2.addPill();

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
            engine.serverTick();
        break;
        case SocketMessage.TYPE_PILL:
            grid.addPills(message.data);
            grid2.addPills(message.data);
        break;
        case SocketMessage.TYPE_ALERT:
            engine.addObject(new Alert(message.data.text, message.data.type, engine));
        break;
        case SocketMessage.TYPE_JOINED_ROOM:
            engine.removeObject(roomInfo.id);
            roomInfoUpdated.text = `Room: ${message.data.roomName}`;
            engine.addObject(roomInfoUpdated);
            player1Info.text = `Player1 ${message.data.player === 1 ? '(You)' : ''}`;
            player2Info.text = `Player2 ${message.data.player === 2 ? '(You)' : ''}`;

            engine.addObject(player1Info);
            engine.addObject(player2Info);

            engine.addObject(playerPoints[0]);
            engine.addObject(playerPoints[1]);
        break;
        case SocketMessage.TYPE_POINTS_UPDATED:
            if (grid.client === message.data.players[0].id) {
                playerPoints[0].text = `points: ${message.data.players[0].points}`;
                playerPoints[1].text = `points: ${message.data.players[1].points}`;
            } else {
                playerPoints[0].text = `points: ${message.data.players[1].points}`;
                playerPoints[1].text = `points: ${message.data.players[0].points}`;
            }

        break;
        case SocketMessage.TYPE_GAME_OVER:
            grid.tiles = [];
            grid2.tiles = [];
            grid.pills = [];
            grid.pills = [];
            engine.addObject(new Alert('GAME OVER', Alert.TYPE_INFO, engine));

            engine.addObject(roomInfo);
            engine.removeObject(roomInfoUpdated.id);
            engine.removeObject(player1Info.id);
            engine.removeObject(player2Info.id);
        break;
    }
}

const roomInfo = new StaticText(100, 50, 100, 10, `Press L to join or create a room!`, Color.GREEN)
const roomInfoUpdated = new StaticText(100, 50, 100, 10, ``, Color.GREEN);

const container = document.getElementById('game-container');

const canvas = new Canvas(container, 500, 500);
const engine = new Engine(canvas, ws);
engine.run();

const fps = new StaticText(100, 25, 100, 10, 'test', Color.GREEN);
const grid = new GridArea(50, 100, engine);
const grid2 = new GridArea(300, 100, engine);
const playerPoints = [
    new StaticText(grid.x, grid.y + 10, 100, 10, `points: `, Color.GREEN),
    new StaticText(grid2.x, grid2.y + 10, 100, 10, `points: `, Color.GREEN),
];
const player1Info = new StaticText(grid.x, grid.y - 10, 100, 10, ``, Color.GREEN);
const player2Info = new StaticText(grid2.x, grid2.y - 10, 100, 10, ``, Color.GREEN)


engine.addObject(roomInfo);

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
