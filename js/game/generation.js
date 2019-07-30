const GENERATOR_DEFAULT_SETTINGS = {
    size: 200,
    paths: null,
    lootRate: 0.02,
};

function generateSeed() {
    const length = 100;
    let str = "";
    for (let i = 0; i < length; i++) {
        str += "0123456789".charAt(Math.floor(Math.random() * 10));
    }
    return str;
}

function generateDungeon(seed, settings = GENERATOR_DEFAULT_SETTINGS) {
    let tiles = [
        {x: 0, y: 0, z: 0}
    ];

    let dungeon = {
        entrance: tiles[0],
        ending: tiles[tiles.length - 1],
        floor: tiles,
        walls: [],
        loot: []
    };

    let seedIndex1 = 0;
    let seedIndex2 = 1;

    let px = tiles[0].x;
    let py = tiles[0].y;

    function rn() {
        seedIndex1 = seed.length - 1 <= seedIndex1 ? 0 : seedIndex1 + 1;
        seedIndex2 = seed.length - 7 <= seedIndex2 ? 1 : seedIndex2 + 2;
        return (seed[seedIndex1] + seed[seedIndex2]) / 100;
    }

    function addPaths(numberOfPaths) {
        for (let n = 0; n < numberOfPaths; n++) {

            const xBias = 0.2 + (0.25 - rn() / 2);  // -1 <= bias >= 1
            const yBias = 0.2 + (0.25 - rn() / 2);
            let num = rn();

            if (n > 0) {
                const ps = Math.floor(num * tiles.length); // ps = path start index
                px = tiles[ps].x;
                py = tiles[ps].y;
            }

            for (let i = 1; i < settings.size; i++) { // Single strand

                num = rn();

                seedIndex1 = seed.length - 1 <= seedIndex1 ? 0 : seedIndex1 + 1;
                seedIndex2 = seed.length - 2 <= seedIndex2 ? 0 : seedIndex2 + 2;

                let nx = px;
                let ny = py;

                if (num < 0.5) {
                    nx = px + (num < 0.25 + xBias / 4 ? 1 : -1);
                } else {
                    ny = py + (num < 0.75 - yBias / 4 ? 1 : -1);
                }

                tiles.push({
                    x: nx,
                    y: ny,
                    z: 0
                });
                if (num < settings.lootRate) {
                    dungeon.loot.push({
                        x: nx,
                        y: ny,
                    });
                }

                px = nx;
                py = ny;
            }
        }

        //Cleanup of floor duplicates
        for (let i = 0; i < tiles.length; i++) {
            const thisTile = tiles[i];
            for (let j = 0; j < tiles.length; j++) {
                const thatTile = tiles[j];
                if (thisTile.x === thatTile.x &&
                    thisTile.y === thatTile.y &&
                    thisTile !== thatTile) {
                    tiles.splice(j, 1);
                }
            }
        }

        function floorOn(x, y) {
            let hasFloor = false;
            for (let tile of dungeon.floor) {
                if (tile.x === x && tile.y === y) {
                    hasFloor = true;
                    break;
                }
            }
            return hasFloor;
        }

        // Add walls
        for (let tile of dungeon.floor) {
            for (let coords of [
                {x: tile.x - 1, y: tile.y,      dir: 0}, // Facing right
                {x: tile.x + 1, y: tile.y,      dir: 1}, // Facing left
                {x: tile.x,     y: tile.y - 1,  dir: 2}, // Facing down
                {x: tile.x,     y: tile.y + 1,  dir: 3}, // Facing up
            ]) {
                if (!floorOn(coords.x, coords.y)) {
                    dungeon.walls.push({x: coords.x, y: coords.y, dir: coords.dir});
                }
            }
        }
        console.log(dungeon.walls.length);
        //Cleanup of wall duplicates
        for (let i = 0; i < dungeon.walls.length; i++) {
            const wall1 = dungeon.walls[i];
            for (let wall2 of dungeon.walls) {
                if (wall1 !== wall2 &&
                    wall1.x === wall2.x &&
                    wall1.y === wall2.y &&
                    wall1.dir === wall2.dir) {
                    dungeon.walls.splice(i, 1);
                }
            }
        }

        console.log(dungeon.walls.length);
        dungeon.ending = dungeon.floor[dungeon.floor.length - 1];
    }

    //Generation
    if (settings.paths == null) {
        addPaths(Math.floor(rn() * 17) + 1);
    } else {
        addPaths(settings.paths);
    }


    return dungeon;
}