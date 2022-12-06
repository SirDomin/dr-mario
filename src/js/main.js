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
const grid = new GridArea(100, 100, 20, 20, 16, 9);

engine.addObject(fps);
engine.addObject(grid);

console.log(grid);
new Tile(20, grid, 1, 1, Color.GREEN);
new Tile(20, grid, 2, 1, Color.RED);

new Tile(20, grid, 4, 1, Color.DARK_BLUE);
new Tile(20, grid, 5, 1, Color.PINK);

engine.onRun = function() {
    fps.text = `FPS: ${engine.fps}`;
}

engine.run();