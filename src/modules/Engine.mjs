import {EventHandler} from "./EventHandler.mjs";
import {Options} from "./Options.mjs";
import {SocketMessage} from "./SocketMessage.mjs";
import {Alert} from "./objects/Alert.mjs";
import {StaticText} from "./objects/StaticText.mjs";
import {Color} from "./Color.mjs";
import {Config} from "../../config/config.mjs";
import {GameState} from "./GameState.mjs";

export class Engine {
    canvas;
    eventHandler;
    gameObjects;
    ticks;
    fps;
    start;
    indexesToRemove;
    pause;
    onRunCallback;
    ws;
    client;
    serverName;

    constructor(canvas) {
        this.canvas = canvas;
        this.eventHandler = new EventHandler(this.canvas, this);
        this.gameObjects = [];
        this.ticks = 0;
        this.fps = 0;
        this.start = performance.now();
        this.indexesToRemove = [];
        this.pause = false;
        this.frameTime = 0;
        this.lastLoop = new Date;
        this.loop = performance.now();
        this.ws = null;
        this.alerts = [];
        this.pingInterval = null;
        this.grids = [];
        this.onRunCallback = function(){ };
        this.playerInfo = [];
        this.playerPoints = [];
        this.room = null;
        this.gameState = GameState.WAITING_FOR_OPPONENT;

        this.serverName = localStorage.getItem('serverName') ?? Config.address ?? null;
        this.serverInfo = new StaticText(100, 25, 100, 10, `Server: ${this.serverName}`, Color.GREEN);
        this.gameStateInfo = new StaticText(10, 75, 100, 10, `Game state: ${this.gameState}`, Color.GREEN);
        this.roomInfo = new StaticText(10, 75, 100, 10, `Press P to connect to server`, Color.GREEN)

        if (this.serverName) {
            console.log(this.serverName);
            this.setupSocketListener();
            this.roomInfo = new StaticText(10, 50, 100, 10, `Connected to ${this.serverName}`, Color.GREEN)
            this.serverInfo.text = `Server: ${this.serverName}`
        }

        this.addObject(this.roomInfo);
        this.addObject(this.serverInfo);
        this.addObject(this.gameStateInfo);
    }

    addGrid(grid) {
        this.grids.push(grid);
        this.addObject(grid);
        if (this.grids.length === 2) {
            this.prepareScoreBoards();
            Options.configureKeysForGrid(this, this.grids[0]);
        }
    }

    prepareScoreBoards() {
        this.playerPoints = [
            new StaticText(this.grids[0].x, this.grids[0].y - 20, 100, 10, `points: `, Color.GREEN),
            new StaticText(this.grids[1].x, this.grids[1].y - 20, 100, 10, `points: `, Color.GREEN),
        ];

        this.playerInfo = [
            new StaticText(this.grids[0].x, this.grids[0].y - 40, 100, 10, ``, Color.GREEN),
            new StaticText(this.grids[1].x, this.grids[1].y - 40, 100, 10, ``, Color.GREEN),
        ];
    }

    clientConnected(clientUuid) {
        this.client = clientUuid;
        localStorage.setItem('uuid', clientUuid);
        this.pingInterval = setInterval(() => {
            try {
                this.ws.send(SocketMessage.send(SocketMessage.TYPE_PING, {}, this.client));
            } catch (exception) {
                this.addObject(new Alert(`Disconnected from server`, Alert.TYPE_ERROR, this));

                clearInterval(this.pingInterval);
            }
        }, 2000);
    }

    setupSocketListener(forcePrompt = false) {
        if (forcePrompt === true) {
            this.serverName = null;
        }

        const uuid = localStorage.getItem('uuid') ?? null;
        const playerName = localStorage.getItem('playerName') ?? prompt('Enter your name: ');
        localStorage.setItem('playerName', playerName);

        this.ws = new WebSocket(Config.address + `?uuid=${uuid}?playerName=${playerName}`);
        this.ws.onerror = event => {
            this.addObject(new Alert(`could not connect to server`, Alert.TYPE_ERROR, this));
            this.room = null;
            this.client = null;
            this.roomInfo.text = `Press P to connect to server`;
            this.serverInfo.text = `Server: unavailable`
            localStorage.removeItem('serverName');
        }

        this.ws.onopen = event => {
            this.addObject(new Alert(`Connected to server!`, Alert.TYPE_SUCCESS, this));
            this.serverName = Config.address;
            localStorage.setItem('serverName', this.serverName);
            this.serverInfo.text = `Server: ${this.serverName}`

            this.roomInfo.text = `Press L to join or create a room!`;
        }

        this.ws.onclose = event => {
            // this.addObject(new Alert(`Disconnected from server!`, Alert.TYPE_ERROR, this));
            this.room = null;
            this.client = null;
            this.roomInfo.text = `Press P to connect to server`;
            this.serverInfo.text = `Server: not connected`
            localStorage.removeItem('serverName');

        }

        this.ws.onmessage = event => {
            const message = SocketMessage.read(event.data);

            switch (message.type) {
                case SocketMessage.TYPE_GAME_READY:
                    this.gameState = GameState.READY_TO_START;
                    this.gameStateInfo.update(`Game state: ${this.gameState}, press Enter to begin`);

                    console.log('game ready', this.gameState);

                    break;
                case SocketMessage.TYPE_GAME_START:
                    this.gameState = GameState.PLAYING;
                    this.gameStateInfo.update(`Game state: ${this.gameState}`);

                    this.grids.forEach(grid => {
                        grid.addPill();
                    });

                    this.grids[0].setClient(message.data.players[0]);
                    this.grids[1].setClient(message.data.players[1]);

                    setTimeout(() => {
                        this.grids.forEach(grid => {
                            grid.addPill();
                        });
                    }, 4000);

                    setTimeout(() => {
                        this.addObject(new Alert(`Starting in 3...`, Alert.TYPE_INFO, this, 60));
                    }, 1000);

                    setTimeout(() => {
                        this.addObject(new Alert(`Starting in 2...`, Alert.TYPE_INFO, this, 60));
                    }, 2000)

                    setTimeout(() => {
                        this.addObject(new Alert(`Starting in 1...`, Alert.TYPE_INFO, this, 60));
                    }, 3000)


                    break;
                case SocketMessage.TYPE_CONNECTION:
                    this.clientConnected(message.client);
                    break;
                case SocketMessage.TYPE_PLAYER_KEY:

                    break;
                case SocketMessage.TYPE_PLAYER_KEY_UPDATE:
                    this.grids.forEach(grid => {
                        grid.handleEvent(message);
                    })

                    break;
                case SocketMessage.TYPE_TICK:
                    this.serverTick();
                    break;
                case SocketMessage.TYPE_PILL:
                    this.grids.forEach(grid => {
                        grid.addPills(message.data);
                    })
                    break;
                case SocketMessage.TYPE_ALERT:
                    this.addObject(new Alert(message.data.text, message.data.type, this));
                    break;
                case SocketMessage.TYPE_JOINED_ROOM:
                    this.roomInfo.text = `Room: ${message.data.roomName}`;
                    this.room = message.data.roomName;
                    let playerName = localStorage.getItem('playerName');
                    this.playerInfo[0].text = message.data.player === 1 ? playerName : 'Opponent';
                    this.playerInfo[1].text = message.data.player === 2 ? playerName : 'Opponent';

                    this.addObject(this.playerInfo[0]);
                    this.addObject(this.playerInfo[1]);

                    this.addObject(this.playerPoints[0]);
                    this.addObject(this.playerPoints[1]);
                    break;
                case SocketMessage.TYPE_POINTS_UPDATED:
                    if (this.grids[0].client === message.data.players[0].id) {
                        this.playerPoints[0].text = `points: ${message.data.players[0].points}`;
                        this.playerPoints[1].text = `points: ${message.data.players[1].points}`;
                    } else {
                        this.playerPoints[0].text = `points: ${message.data.players[1].points}`;
                        this.playerPoints[1].text = `points: ${message.data.players[0].points}`;
                    }

                    break;
                case SocketMessage.TYPE_GAME_OVER:
                    this.gameState = GameState.READY_TO_START;
                    this.gameStateInfo.update(`Game state: ${this.gameState}, press Enter to play again`);

                    this.grids.forEach(grid => {
                        grid.restart();
                    });

                    this.addObject(new Alert('GAME OVER', Alert.TYPE_INFO, this));

                    this.roomInfo.text = `Press L to join or create a room!`;

                    this.removeObject(this.playerInfo[0].id);
                    this.removeObject(this.playerInfo[1].id);
                    break;
                case SocketMessage.TYPE_PING:

                    break;
            }
        }
    }

    startGame() {
        if (this.gameState !== GameState.READY_TO_START) {
            return;
        }

        this.gameState = GameState.PLAYING;
        this.gameStateInfo.update(`Game state: ${this.gameState}`);

        this.ws.send(SocketMessage.send(SocketMessage.TYPE_GAME_START, {client: this.client}, this.client));

    }

    fpsLoop(){
        this.ticks++;

        const thisFrameTime = (this.loop=new Date) - this.lastLoop;
        this.frameTime += (thisFrameTime - this.frameTime) / 20;
        this.lastLoop = this.loop;

        if (this.ticks % 5 === 0) {
            this.fps = (1000 / this.frameTime).toFixed(0)
        }
    }

    addObject(gameObject) {
        this.gameObjects.push(gameObject);
    }

    addKeyHandler(keyCode, callback, single = false) {
        this.eventHandler.addKeyHandler(keyCode, callback, single);
    }

    render() {
        this.canvas.clear();
        this.gameObjects
            .sort((a, b) => a.renderPriority - b.renderPriority)
            .forEach(gameObject => {
            gameObject.render(this.canvas);
        });
    }

    onRun(){ }

    run() {
        setInterval(() => {
            requestAnimationFrame(() => {
                this.animate();
            });
        }, 1000 / Options.FRAMERATE)
    }

    animate() {
        this.fpsLoop();

        if(!this.pause) {
            this.render();
        }
        this.updateTick();
        this.handleRemovedObjects();

        this.onRun();
    }

    destroy() {
        this.run = function (){}
    }

    updateTick() {
        this.gameObjects
            .filter(object => object.serverTick === false)
            .forEach(gameObject => {
                gameObject.update();
            })
        ;

        this.update();
        this.eventHandler.handleKeysDown();
        this.handleOutOfBound();
    }

    serverTick() {
        this.gameObjects
            .filter(object => object.serverTick === true)
            .forEach(gameObject => {
                gameObject.update();
            })
        ;
    }

    update() {

    }

    getData() {
        return {
            ticks: this.ticks,
            fps: this.fps,
            pause: this.pause,
            objects: this.gameObjects.length
        }
    }

    handleOutOfBound() {
        for(let x in this.gameObjects) {
            let object = this.gameObjects[x];
            if (object.x < 0) {
                object.x = 0;
            }
            if (object.x + object.width > this.canvas.width) {
                object.x = this.canvas.width - object.width;
            }
            if (object.y < 0) {
                this.outOfBound(object, x);

                object.y = 0;
            }
            if (object.y + object.height > this.canvas.height) {
                object.y = this.canvas.height - object.height;
            }
        }
    }

    getTicks() {
        return this.ticks;
    }

    getObjectA(x, y) {
        for(let i in this.gameObjects) {
            if(this.gameObjects[i].checkCollision({
                x: x,
                y: y,
                width: 1,
                height: 1
            })) {
                this.gameObjects[i].color = 'blue';
            }
        }
    }

    outOfBound(object, x) {
        if (object.removeOnOutOfBound) {
            this.removeObject(object.id);
        }
    }

    getObjectById(id) {
        return this.gameObjects.filter(object => object.id === id)[0] ?? {};
    }

    inRange(object1, object2) {
        return (object1.x + object1.width > object2.x && object1.x < object2.x + object2.width);
    }

    removeObject(objectId) {
        let index = this.gameObjects.findIndex(object => object.id === objectId);
        this.indexesToRemove.push(index);
    }

    handleRemovedObjects() {
        let indexes = new Set(
            this.indexesToRemove.sort((a, b) => {
                return b-a
            })
        );

        indexes.forEach(index => {
            this.gameObjects.splice(index, 1);
        });

        this.indexesToRemove = [];
    }

    createRoom() {
        if (this.room !== null) {
            if (!confirm('Exit current room?')) {
                return;
            }
        }

        const roomName = prompt('Enter name of room:');

        if (roomName.length >= 3) {
            this.ws.send(SocketMessage.send(SocketMessage.TYPE_CREATE_OR_JOIN_ROOM, {name: roomName}, this.client));
        } else {
            alert('name must be longer than 3');
        }
    }
}
