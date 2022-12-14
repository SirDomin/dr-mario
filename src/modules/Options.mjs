import {MapSize} from "./valueObjects/MapSize.mjs";

export class Options {
    static FRAMERATE = 60;
    static TILE_SIZE = 20;
    static TILE_UPDATE = 20;
    static GRID_COLUMNS = 8;
    static GRID_ROWS = 16;
    static LEVEL = 0;
    static MAP_SIZE = new MapSize(Options.GRID_COLUMNS, Options.GRID_ROWS);

    static configureKeysForGrid(engine, grid) {
        engine.addKeyHandler(39, () => {
            grid.movePillRight()
        }, true)

        engine.addKeyHandler(37, () => {
            grid.movePillLeft()
        }, true)

        engine.addKeyHandler(40, () => {
            grid.rotatePillRight()
        }, true)

        engine.addKeyHandler(38, () => {
            grid.rotatePillLeft()
        }, true)

        engine.addKeyHandler(32, () => {
            grid.placeBlock()
        }, true)
    }
}
