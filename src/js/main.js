import {Canvas} from "../modules/Canvas.mjs";
import {Engine} from "../modules/Engine.mjs";
import {StaticText} from "../modules/objects/StaticText.mjs";
import {Color} from "../modules/Color.mjs";

const container = document.getElementById('game-container');

const canvas = new Canvas(container, 400, 400);
const engine = new Engine(canvas);

const fps = new StaticText(100, 10, 100, 10, 'test', Color.GREEN);

engine.addObject(fps);

engine.onRun = function() {
    fps.text = `FPS: ${engine.fps}`;
}

engine.run();