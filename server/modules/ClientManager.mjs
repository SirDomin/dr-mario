import {SocketMessage} from "../../src/modules/SocketMessage.mjs";

export class ClientManager {
    clients;

    constructor() {
        this.clients = [];
    }

    addClient(client) {
        this.clients.push(client);

        client.send(SocketMessage.send(SocketMessage.TYPE_CONNECTION, `connected with id: ${client.id}`, client.id));
    }

    getClientById(id) {
        const client = this.clients.filter(client => client.id === id);
        return client.length ? client[0] : null;
    }
}