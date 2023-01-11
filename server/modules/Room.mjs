import {SocketMessage} from "../../src/modules/SocketMessage.mjs";

export class Room {
    clients;
    id;
    createDate;
    name;
    points;
    finished;
    interval;

    constructor(id, name) {
        this.id = id;
        this.clients = [];
        this.createDate = new Date();
        this.name = name;
        this.points = [];
        this.lastMessage = [];
        this.finished = false;
        this.interval = null;
    }

    addClient(client) {
        if (this.clients.length >= 2) {
            return;
        }
        client.roomId = this.id;

        this.clients.push(client);
        this.points.push({
            client: client.id,
            points: 0,
        });
    }

    sendPointsToClients() {
        this.emitToClients(SocketMessage.TYPE_POINTS_UPDATED, {
            players: [
                {
                    id: this.clients[0].id,
                    points: this.getPointsForClient(this.clients[0].id),
                },
                {
                    id: this.clients[1].id,
                    points: this.getPointsForClient(this.clients[1].id),
                }
            ]
        })
    }

    emitToClients(type, data) {
        for (let x in this.clients) {
            this.clients[x].send(SocketMessage.send(type, data, this.clients[x].id));
        }
    }

    isRoomFull() {
        return this.clients.length === 2;
    }

    addPointsForClient(points, clientId) {
        this.points.filter(point => point.client === clientId)[0].points += points;

        this.sendPointsToClients();
    }

    getPointsForClient(clientId) {
        return this.points.filter(points => points.client === clientId)[0].points;
    }

    gameFinished() {
        this.emitToClients(SocketMessage.TYPE_GAME_OVER, {
            players: [
                {
                    id: this.clients[0].id,
                    points: this.getPointsForClient(this.clients[0].id),
                },
                {
                    id: this.clients[1].id,
                    points: this.getPointsForClient(this.clients[1].id),
                }
            ]
        });

        clearInterval(this.interval);
        this.lastMessage = [];
        this.clients = [];
        this.name = '';
        this.finished = true;
    }

    getClients() {
        return this.clients;
    }
}