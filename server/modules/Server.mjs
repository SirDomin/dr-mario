import {ClientManager} from "./ClientManager.mjs";
import {WebSocketServer} from "ws";
import {RoomManager} from "./RoomManager.mjs";
import {SocketMessage} from "../../src/modules/SocketMessage.mjs";
import {Alert} from "../../src/modules/objects/Alert.mjs";
import {GameManager} from "./GameManager.mjs";

export class Server {
    websocketServer;
    clientManager;
    roomManager;
    clients;
    gameManager;

    constructor() {
        this.clientManager = new ClientManager();
        this.websocketServer = new WebSocketServer({ port: 8080 });
        this.roomManager = new RoomManager();
        this.gameManager = new GameManager(this);
    }

    createUuid() {
        return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    createSocketListener() {
        this.websocketServer.on('connection', function connection(ws) {
            ws.on('message', function message(data) {
                let message = SocketMessage.read(data);
                switch (message.type) {
                    case SocketMessage.TYPE_GAME_START:

                        break;
                    case SocketMessage.TYPE_CONNECTION:

                        break;

                    case SocketMessage.TYPE_PLAYER_KEY:
                        this.handleKeyPressed(message);
                        break;
                    case SocketMessage.TYPE_OUT_OF_PILLS:
                        this.gameManager.emitPills(message);
                        break;
                    case SocketMessage.TYPE_CREATE_ROOM:
                        this.connectToRoom(message);
                        break;
                    case SocketMessage.TYPE_POINTS_UPDATED:
                        this.handlePointsUpdated(message);
                        break;
                    case SocketMessage.TYPE_GAME_OVER:
                        this.handleGameOver(message);
                        break;
                }
            }.bind(this));

            ws.id = this.createUuid();
            this.clientManager.addClient(ws)
        }.bind(this));
    }

    handlePointsUpdated(message) {
        const client = this.clientManager.getClientById(message.client);

        const room = this.roomManager.getRoomById(client.roomId);

        this.gameManager.handleCombo(room, message.data.client, message.data.combo, message.client);

    }

    handleGameOver(message) {
        const client = this.clientManager.getClientById(message.client);

        const room = this.roomManager.getRoomById(client.roomId);

        this.gameManager.finishGame(room, client.id);

    }

    handleKeyPressed(message) {
        const client = this.clientManager.getClientById(message.client);

        const room = this.roomManager.getRoomById(client.roomId);

        if (!room) {
            return;
        }

        message.data.client = client.id;

        room.emitToClients(SocketMessage.TYPE_PLAYER_KEY_UPDATE, message.data);
    }

    connectToRoom(message) {
        const roomName = message.data.name;

        let room = this.roomManager.getRoomByName(roomName);
        const client = this.clientManager.getClientById(message.client);

        if (client === null) {
            console.log('client not found', message);
            return;
        }

        if (room === null) {
            room = this.roomManager.createRoom(this.createUuid(), roomName);
            client.send(SocketMessage.send(SocketMessage.TYPE_ALERT, {
                text: `created room named ${roomName}`,
                type: Alert.TYPE_SUCCESS,
            }, client.id));


        } else {
            if (room.finished === true) {
                client.send(SocketMessage.send(SocketMessage.TYPE_ALERT, {
                    text: `Room ${roomName} is already finished`,
                    type: Alert.TYPE_ERROR,
                }, client.id));

                return;
            }

            if (room.isRoomFull()) {
                client.send(SocketMessage.send(SocketMessage.TYPE_ALERT, {
                    text: `Room ${roomName} is full!`,
                    type: Alert.TYPE_ERROR,
                }, client.id));

                return;
            }

            client.send(SocketMessage.send(SocketMessage.TYPE_ALERT, {
                text: `joined room named ${roomName}`,
                type: Alert.TYPE_SUCCESS,
            }, client.id));
        }

        room.addClient(client);

        client.send(SocketMessage.send(SocketMessage.TYPE_JOINED_ROOM, {
            roomName: room.name,
            player: room.clients.length,
        }, client.id));

        if (room.isRoomFull()) {
            this.gameManager.startGame(room);

            room.emitToClients(SocketMessage.TYPE_POINTS_UPDATED, {
                players: [
                    {
                        id: room.clients[0].id,
                        points: room.getPointsForClient(room.clients[0].id),
                    },
                    {
                        id: room.clients[1].id,
                        points: room.getPointsForClient(room.clients[1].id),
                    }
                ]
            })
        }
    }
}