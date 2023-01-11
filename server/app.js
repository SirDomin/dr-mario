import {Server} from "./modules/Server.mjs";

const server = new Server();

server.createSocketListener();

console.log('server running');
