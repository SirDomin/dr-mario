export class Options {
    static FRAMERATE = 60;
    static TILE_SIZE = 20;
    static TILE_UPDATE = 10;
    static GRID_COLUMNS = 8;
    static GRID_ROWS = 16;

    static configureKeysForGrid(engine, grid) {
        engine.addKeyHandler(76, () => {
            engine.createRoom();
            delete engine.eventHandler.keysDown[76];
            engine.eventHandler.keyHandlers[76].handled = false
        }, true);

        engine.addKeyHandler(80, () => {
            engine.setupSocketListener(true);
            delete engine.eventHandler.keysDown[80];
            engine.eventHandler.keyHandlers[80].handled = false
        }, true);

        engine.addKeyHandler(13, () => {
            engine.startGame();
            delete engine.eventHandler.keysDown[80];
            engine.eventHandler.keyHandlers[80].handled = false
        }, true);
    }
}
