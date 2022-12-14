import {Canvas} from "../modules/Canvas.mjs";
import {Engine} from "../modules/Engine.mjs";
import {StaticText} from "../modules/objects/StaticText.mjs";
import {Color} from "../modules/Color.mjs";
import {GridArea} from "../modules/GridArea.mjs";
import {Tile} from "../modules/objects/Tile.mjs";
import {Options} from "../modules/Options.mjs";
import {LevelGenerator} from "../modules/LevelGenerator.mjs";

const container = document.getElementById('game-container');

const canvas = new Canvas(container, 500, 500);
const engine = new Engine(canvas);

const fps = new StaticText(100, 10, 100, 10, 'test', Color.GREEN);
const grid = new GridArea(100, 100, engine);

const tile = new Tile(Options.TILE_SIZE, grid, 3, 3, Color.RED);

engine.addObject(fps);
engine.addObject(grid);
engine.addObject(tile);

Options.configureKeysForGrid(engine, grid);

engine.onRun = function() {
    const tiles = grid.tiles.length;
    fps.text = `FPS: ${engine.fps}, tiles: ${tiles}`;

    if (tiles > 1000) {
        grid.tiles = [];
    }
}

engine.run();
