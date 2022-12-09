import {Canvas} from "../modules/Canvas.mjs";
import {Engine} from "../modules/Engine.mjs";
import {StaticText} from "../modules/objects/StaticText.mjs";
import {Color} from "../modules/Color.mjs";
import {GridArea} from "../modules/GridArea.mjs";
import {Tile} from "../modules/objects/Tile.mjs";

const container = document.getElementById('game-container');

const canvas = new Canvas(container, 500, 500);
const engine = new Engine(canvas);

const fps = new StaticText(100, 10, 100, 10, 'test', Color.GREEN);
const grid = new GridArea(100, 100, 20, 20, 16, 8);

engine.addObject(fps);
engine.addObject(grid);

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

engine.onRun = function() {
    const tiles = grid.tiles.length;
    fps.text = `FPS: ${engine.fps}, tiles: ${tiles}`;

    if (tiles > 1000) {
        grid.tiles = [];
    }
}

engine.run();
