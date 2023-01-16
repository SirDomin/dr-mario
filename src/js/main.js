import {Canvas} from "../modules/Canvas.mjs";
import {Engine} from "../modules/Engine.mjs";
import {StaticText} from "../modules/objects/StaticText.mjs";
import {Color} from "../modules/Color.mjs";
import {GridArea} from "../modules/GridArea.mjs";
import {Options} from "../modules/Options.mjs";
import {SocketMessage} from "../modules/SocketMessage.mjs";
import {Alert} from "../modules/objects/Alert.mjs";

let serverIp = 'ws://192.168.0.106:8080';

const ws = new WebSocket(serverIp);

ws.onerror = event => {
    engine.addObject(new Alert(`could not connect to server`, Alert.TYPE_ERROR, engine));
}

ws.onopen = event => {
    engine.addObject(new Alert(`Connected to server!`, Alert.TYPE_SUCCESS, engine));
}

ws.onclose = event => {
    engine.addObject(new Alert(`Disconnected from server!`, Alert.TYPE_ERROR, engine));
}

ws.onmessage = event => {
    const message = SocketMessage.read(event.data);

    switch (message.type) {
        case SocketMessage.TYPE_GAME_START:
            grids.forEach(grid => {
                grid.addPill();
            });

            grids[0].setClient(message.data.players[0]);
            grids[1].setClient(message.data.players[1]);

            setTimeout(() => {
                grids.forEach(grid => {
                    grid.addPill();
                });
            }, 4000);

            setTimeout(() => {
                engine.addObject(new Alert(`Starting in 3...`, Alert.TYPE_INFO, engine, 60));
            }, 1000);

            setTimeout(() => {
                engine.addObject(new Alert(`Starting in 2...`, Alert.TYPE_INFO, engine, 60));
            }, 2000)

            setTimeout(() => {
                engine.addObject(new Alert(`Starting in 1...`, Alert.TYPE_INFO, engine, 60));
            }, 3000)


            break;
        case SocketMessage.TYPE_CONNECTION:
            engine.clientConnected(message.client);
        break;
        case SocketMessage.TYPE_PLAYER_KEY:

            break;
        case SocketMessage.TYPE_PLAYER_KEY_UPDATE:
            grids.forEach(grid => {
                grid.handleEvent(message);
            })

            break;
        case SocketMessage.TYPE_TICK:
            engine.serverTick();
        break;
        case SocketMessage.TYPE_PILL:
            grids.forEach(grid => {
                grid.addPills(message.data);
            })
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
            if (grids[0].client === message.data.players[0].id) {
                playerPoints[0].text = `points: ${message.data.players[0].points}`;
                playerPoints[1].text = `points: ${message.data.players[1].points}`;
            } else {
                playerPoints[0].text = `points: ${message.data.players[1].points}`;
                playerPoints[1].text = `points: ${message.data.players[0].points}`;
            }

        break;
        case SocketMessage.TYPE_GAME_OVER:
            grids.forEach(grid => {
                grid.tiles = [];
                grid.pills = [];
            })

            engine.addObject(new Alert('GAME OVER', Alert.TYPE_INFO, engine));

            engine.addObject(roomInfo);
            engine.removeObject(roomInfoUpdated.id);
            engine.removeObject(player1Info.id);
            engine.removeObject(player2Info.id);
        break;
        case SocketMessage.TYPE_PING:

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
const grids = [
    new GridArea(50, 150, engine),
    new GridArea(300, 150, engine),
];

const playerPoints = [
    new StaticText(grids[0].x, grids[0].y - 20, 100, 10, `points: `, Color.GREEN),
    new StaticText(grids[1].x, grids[1].y - 20, 100, 10, `points: `, Color.GREEN),
];

const player1Info = new StaticText(grids[0].x, grids[0].y - 40, 100, 10, ``, Color.GREEN);
const player2Info = new StaticText(grids[1].x, grids[1].y - 40, 100, 10, ``, Color.GREEN)

engine.addObject(roomInfo);

engine.addObject(fps);
grids.forEach(grid => {
    engine.addObject(grid);
})

Options.configureKeysForGrid(engine, grids[0]);

engine.onRun = function() {
    const tiles = grids[0].tiles.length;
    fps.text = `FPS: ${engine.fps}, tiles: ${tiles}`;

    if (tiles > 1000) {
        grids[0].tiles = [];
    }
}
