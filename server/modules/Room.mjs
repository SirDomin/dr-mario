export class Room {
    clients;
    id;
    createDate;
    name;
    points;

    constructor(id, name) {
        this.id = id;
        this.clients = [];
        this.createDate = new Date();
        this.name = name;
        this.points = [];
        this.lastMessage = [];
    }

    addClient(client) {
        if (this.clients.length >= 2) {
            return;
        }
        client.roomId = this.id;

        this.clients.push(client);
    }

    isRoomFull() {
        return this.clients.length === 2;
    }

    getClients() {
        return this.clients;
    }
}