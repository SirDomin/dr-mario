export class Options {
    static FRAMERATE = 60;
    static TILE_SIZE = 20;
    static TILE_UPDATE = 10;
    static GRID_COLUMNS = 8;
    static GRID_ROWS = 16;

    static configureKeysForGrid(engine, grid) {
        engine.addKeyHandler(76, () => {
            engine.createRoom();
        }, true)
    }
}
