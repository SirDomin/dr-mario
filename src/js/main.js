import {Canvas} from "../modules/Canvas.mjs";
import {Engine} from "../modules/Engine.mjs";
import {StaticText} from "../modules/objects/StaticText.mjs";
import {Color} from "../modules/Color.mjs";
import {GridArea} from "../modules/GridArea.mjs";

const container = document.getElementById('game-container');

const canvas = new Canvas(container, 500, 500);
const engine = new Engine(canvas);

const fps = new StaticText(10, 25, 100, 10, 'test', Color.GREEN);
const grids = [
    new GridArea(50, 150, engine),
    new GridArea(300, 150, engine),
];

// engine.setupSocketListener();
engine.run();

engine.addObject(fps);

engine.onRun = function() {
    fps.text = `FPS: ${engine.fps}`;
}
