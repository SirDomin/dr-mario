import { WebSocketServer } from "ws";
import {SocketMessage} from "../src/modules/SocketMessage.mjs";
import {Options} from "../src/modules/Options.mjs";
import {Pill} from "../src/modules/objects/Pill.mjs";
import {Room} from "./modules/Room.mjs";
import {Alert} from "../src/modules/objects/Alert.mjs";

const wss = new WebSocketServer({ port: 8080 });

const uuid = () => {
    return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let clients = [];
let rooms = [];

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
            case SocketMessage.TYPE_OUT_OF_PILLS:
                emitPills();
            break;
            case SocketMessage.TYPE_CREATE_ROOM:
                connectToRoom(message);
            break;
            case SocketMessage.TYPE_POINTS_UPDATED:
                handleCombo(message);
            break;
            case SocketMessage.TYPE_GAME_OVER:
                finishGame(message);
            break;
        }
    });

    clientAdded(ws);
});

function finishGame(message) {
    const client = getClientById(message.data.client);

    const room = getRoomById(client.roomId);

    if (room.lastMessage[0] === message.data.client) {
        emitToRoom(SocketMessage.TYPE_GAME_OVER, {
            points1: clients[0].points,
            points2: clients[1].points,
        }, room);

        clients[0].points = 0;
        clients[1].points = 0;

        emitToRoom(SocketMessage.TYPE_POINTS_UPDATED, {
            players: [
                {
                    id: clients[0].id,
                    points: clients[0].points,
                },
                {
                    id: clients[1].id,
                    points: clients[1].points,
                }
            ]
        }, room);

        room.lastMessage = [];
        room.clients = [];
        room.name = '';
    } else {
        room.lastMessage[0] = message.data.client;
    }
}

function handleCombo(message) {
    let client = getClientById(message.data.client);

    const room = getRoomById(client.roomId);

    if (room.lastMessage[0] === message.data.client && room.lastMessage[1] === message.data.combo) {
        client.points += message.data.combo;
        console.log(`${client.points},0: ${clients[0].points}, 1: ${clients[1].points}`);

        emitToRoom(SocketMessage.TYPE_POINTS_UPDATED, {
            players: [
                {
                    id: clients[0].id,
                    points: clients[0].points,
                },
                {
                    id: clients[1].id,
                    points: clients[1].points,
                }
            ]
        }, room);

        room.lastMessage = [];
    } else {
        room.lastMessage[0] = message.data.client;
        room.lastMessage[1] = message.data.combo;
    }
}

function emitToClients(type, data, client) {
    for (let x in clients) {
        clients[x].send(SocketMessage.send(type, data, client));
    }
}

function emitToRoom(type, data, room) {
    for (let x in room.clients) {
        room.clients[x].send(SocketMessage.send(type, data, room.clients[x].id));
    }
}

function clientAdded(client){
    client.id = uuid();
    client.points = 0;
    clients.push(client);

    console.log(client.id, 'connected');

    client.send(SocketMessage.send(SocketMessage.TYPE_CONNECTION, `connected with id: ${client.id}`, client.id));
}

function randomizePills() {
    return {
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
}

function getClientById(id) {
    const client = clients.filter(client => client.id === id);
    return client.length ? client[0] : null;
}

function getRoomById(id) {
    return rooms.filter(room => room.id === id)[0];
}

function getRoomByName(name) {
    const room = rooms.filter(room => room.name === name);
    return room.length ? room[0] : null;
}

function emitPills() {
    let pills = randomizePills();

    for (let x in clients) {
        clients[x].send(SocketMessage.send(SocketMessage.TYPE_PILL, pills, clients[x].id));
    }
}

function connectToRoom(message) {
    const roomName = message.data.name;

    let room = getRoomByName(roomName);
    const client = getClientById(message.client);

    if (client === null) {
        console.log('client not found', message);
        return;
    }
    client.points = 0;

    if (room === null) {
        room = createRoom(roomName);
        client.send(SocketMessage.send(SocketMessage.TYPE_ALERT, {
            text: `created room named ${roomName}`,
            type: Alert.TYPE_INFO,
        }, client.id));
    } else {
        client.send(SocketMessage.send(SocketMessage.TYPE_ALERT, {
            text: `joined room named ${roomName}`,
            type: Alert.TYPE_INFO,
        }, client.id));
    }

    room.addClient(client);

    client.send(SocketMessage.send(SocketMessage.TYPE_JOINED_ROOM, {
        roomName: room.name,
        player: room.clients.length,
    }, client.id));

    if (room.isRoomFull()) {
        let pills = randomizePills();

        for (let x in room.clients) {
            room.clients[x].send(SocketMessage.send(SocketMessage.TYPE_PILL, pills, room.clients[x].id));

            room.clients[x].send(SocketMessage.send(SocketMessage.TYPE_GAME_START, {
                players: room.clients.map(connection => connection.id),
            }, room.clients[x].id));
        }

        startTick(room);
    }
}

function createRoom(name) {
    const room = new Room(rooms.length, name);
    rooms.push(room);

    return room;
}

function startTick(room) {
    setInterval(() => {
        for (let x in room.clients) {
            room.clients[x].send(SocketMessage.send(SocketMessage.TYPE_TICK, {}, room.clients[x].id));
        }
    }, 1000 / Options.FRAMERATE)
}

console.log('server running');
