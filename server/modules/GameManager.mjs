import {SocketMessage} from "../../src/modules/SocketMessage.mjs";
import {Pill} from "../../src/modules/objects/Pill.mjs";
import {Options} from "../../src/modules/Options.mjs";

export class GameManager {
    server;

    constructor(server) {
        this.server = server;
    }

    startGame(room) {
        room.startGame(this.randomizePills());
    }

    finishGame(room, clientId) {
        if (room.lastMessage[0] === clientId) {
            room.sendPointsToClients();

            room.gameFinished();
        } else {
            room.lastMessage[0] = clientId;
        }
    }

    handleCombo(room, clientId, combo, senderId) {
        if (room.lastMessage[0] === clientId && room.lastMessage[1] === combo) {
            room.addPointsForClient(combo, clientId);

            room.lastMessage = [];
        } else {
            room.lastMessage[0] = senderId;
            room.lastMessage[1] = combo;
        }
    }

    randomizePills() {
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

    emitPills(message) {
        const client = this.server.clientManager.getClientById(message.client);

        const room = this.server.roomManager.getRoomById(client.roomId);

        let pills = this.randomizePills();

        room.emitToClients(SocketMessage.TYPE_PILL, pills);
    }
}
