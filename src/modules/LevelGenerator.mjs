import {Square} from "./Square.mjs";
import {Color} from "./Color.mjs";
import {Pill} from "./objects/Pill.mjs";
import {EntityType} from "./EntityType.mjs";
import {Options} from "./Options.mjs";
import {Point} from "./Point.mjs";
import {MapSize} from "./valueObjects/MapSize.mjs";
import {Tile} from "./objects/Tile.mjs";

export class LevelGenerator {
    level;
    mapSize;
    tiles = [];
    availableFields = [];
    grid;

    LEVELS = [4, 8, 16, 20];

    constructor(
        level = 0,
        mapSize = new MapSize(Options.GRID_COLUMNS, Options.GRID_ROWS),
        grid = null
    ) {
        if(LevelGenerator.exists) {
            console.log("LevelGenerator already exists");
            return LevelGenerator.instance;
        }
        console.log("LevelGenerator created");

        LevelGenerator.instance = this;
        LevelGenerator.exists = true;
        this.mapSize = mapSize;
        this.level = level;
        this.grid = grid;
    }

    generateLevel() {
        this.setupAvailableFields();
        this.createViruses();
    }

    getLevel() {
        return this.tiles;
    }

    getVirusCount() {
        return this.LEVELS[this.level];
    }

    setupAvailableFields() {
        let minOffset = this.mapSize.height / 2;
        console.log("minOffset", minOffset);
        for(let i = minOffset; i < this.mapSize.height; i++) {
            for(let j = 0; j < this.mapSize.width; j++) {
                this.availableFields.push(new Point(j, i));
            }
        }
    }

    createViruses() {
        for(let i = 0; i < this.getVirusCount(); i++) {
            let randomIndex = Math.floor(Math.random() * this.availableFields.length);
            let randomField = this.availableFields[randomIndex];
            this.availableFields.splice(randomIndex, 1);
            console.log("randomField", randomField);
            this.tiles.push(
                new Tile(Options.TILE_SIZE, this.grid, randomField.x, randomField.y, Color.randomColor(), null, Options.TILE_UPDATE)
            );
        }
    }
}
