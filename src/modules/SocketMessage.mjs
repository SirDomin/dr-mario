export class SocketMessage {
    static TYPE_CONNECTION = 'CONNECTION';
    static TYPE_GAME_START = 'GAME_START';
    static TYPE_PLAYER_KEY = 'PLAYER_KEY';
    static TYPE_PLAYER_KEY_UPDATE = 'PLAYER_KEY_UPDATE';
    static TYPE_TICK = 'TICK';
    static TYPE_PILL = 'PILL';
    static TYPE_OUT_OF_PILLS = 'OUT_OF_PILLS';

    type;
    data;
    client;

    constructor(type, data, client) {
        this.type = type;
        this.client = client;
        this.data = data;
    }

    static send(type, data, client) {
        return JSON.stringify({
            'type': type,
            'data': data,
            'client': client,
        })
    }

    static read(message) {
        const data = JSON.parse(message);

        return new this(data.type, data.data, data.client);
    }
}