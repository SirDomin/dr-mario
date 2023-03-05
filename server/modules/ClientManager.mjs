import {SocketMessage} from "../../src/modules/SocketMessage.mjs";

export class ClientManager {
    clients;

    constructor() {
        this.clients = [];
    }

    handlePing(message) {
        const client = this.getClientById(message.client);
        if (client === null) {
            return;
        }

        client.isAlive = true;
    }

    addClient(client) {
        client.isAlive = true;
        this.clients.push(client);

        client.send(SocketMessage.send(SocketMessage.TYPE_CONNECTION, `connected with id: ${client.id}`, client.id));

        console.log(`client with id ${client.id} connected`);
    }

    getClientById(id) {
        const client = this.clients.filter(client => client.id === id);
        return client.length ? client[0] : null;
    }

    removeClient(client) {
        console.log(`client with id ${client.id} disconnected`);

        const index = this.clients.findIndex(data => data.id = client.id);
        client.terminate();
        this.clients.splice(index, 1);
    }
}
