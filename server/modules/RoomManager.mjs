import {Room} from "./Room.mjs";

export class RoomManager {
    rooms;

    constructor() {
        this.rooms = [];
    }

    createRoom(id, name) {
        const room = new Room(id, name);
        this.rooms.push(room);

        return room;
    }

    getRoomById(id) {
        return this.rooms.filter(room => room.id === id)[0];
    }

    getRoomByName(name) {
        const room = this.rooms.filter(room => room.name === name);
        return room.length ? room[0] : null;
    }

    removeRoom() {

    }
}