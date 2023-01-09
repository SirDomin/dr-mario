import { WebSocketServer } from "ws";
import {SocketMessage} from "./modules/SocketMessage.mjs";
import {Options} from "./modules/Options.mjs";
import {Pill} from "./modules/objects/Pill.mjs";

const wss = new WebSocketServer({ port: 8080 });

const uuid = () => {
    return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let clients = [];

wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        let message = SocketMessage.read(data);

        switch (message.type) {
            case SocketMessage.TYPE_GAME_START:

                break;
            case SocketMessage.TYPE_CONNECTION:

                break;

            case SocketMessage.TYPE_PLAYER_KEY:
                    emitToClients(SocketMessage.TYPE_PLAYER_KEY_UPDATE, message.data, message.client)
                break;
        }
    });

    clientAdded(ws);
});

function emitToClients(type, data, client) {
    for (let x in clients) {
        clients[x].send(SocketMessage.send(type, data, client));
    }
}

function clientAdded(client){
    client.id = uuid();
    clients.push(client);

    console.log(client.id, 'added');
    console.log(clients.map(connection => connection.id));

    client.send(SocketMessage.send(SocketMessage.TYPE_CONNECTION, `connected with id: ${client.id}`, client.id));

    if (clients.length === 2) {
        let pills = {
            pills: [
                {
                    color1: Pill.pickColor(),
                    color2: Pill.pickColor(),
                },
                {
                    color1: Pill.pickColor(),
                    color2: Pill.pickColor(),
                },
                {
                    color1: Pill.pickColor(),
                    color2: Pill.pickColor(),
                },
                {
                    color1: Pill.pickColor(),
                    color2: Pill.pickColor(),
                },
            ]
        }

        for (let x in clients) {
            clients[x].send(SocketMessage.send(SocketMessage.TYPE_PILL, pills, clients[x].id));

            clients[x].send(SocketMessage.send(SocketMessage.TYPE_GAME_START, {
                players: clients.map(connection => connection.id),
            }, clients[x].id));
        }

        startTick();
    }

    if (clients.length > 2) {
        clients = [];
        console.log('reseting');
    }
}

function startTick() {
    setInterval(() => {
        for (let x in clients) {
            clients[x].send(SocketMessage.send(SocketMessage.TYPE_TICK, {}, clients[x].id));
        }
    }, 1000 / Options.FRAMERATE)
}

console.log('xd');