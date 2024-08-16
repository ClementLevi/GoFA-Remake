const crypto = require('crypto');
const uuid = require('uuid');

// 生成随机数
function getRandomNumber(seed, min, max) {
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const num = parseInt(hash.substring(0, 8), 16);
    return min + (num % (max - min + 1));
}

// 生成星系属性
function generateSystem(seed) {
    const color = getRandomNumber(seed, 1, 10);
    const appearance = getRandomNumber(seed + '1', 1, 5);
    const x = getRandomNumber(seed + '2', 0, 1999);
    const y = getRandomNumber(seed + '3', 0, 1999);
    const id = uuid.v4();

    return { color, appearance, x, y, uuid };
}

// 生成行星属性
function generatePlanet(seed) {
    const size = getRandomNumber(seed, 1, 18);
    const resources = Array.from({ length: 5 }, (_, i) => getRandomNumber(seed + (i + 1), 1, 10));
    const appearance = getRandomNumber(seed + '6', 1, 12);
    const id = uuid.v4();

    return { size, resources, appearance, uuid };
}

// 生成大地图
function generateMap(seed) {
    const galaxyCount = getRandomNumber(seed, 5, 10);
    const map = {};

    for (let i = 0; i < galaxyCount; i++) {
        const galaxySeed = seed + i.toString();
        const galaxy = generateSystem(galaxySeed);
        const planetCount = getRandomNumber(galaxySeed, 1, 9);
        const planets = [];

        for (let j = 0; j < planetCount; j++) {
            const planetSeed = galaxySeed + '_' + j.toString();
            const planet = generatePlanet(planetSeed);
            planets.push(planet);
        }

        galaxy.planets = planets;
        map[galaxy.uuid] = galaxy;
    }

    return map;
}

// 使用种子生成大地图
const seed = 'your_seed_here';
const map = generateMap(seed);

console.log(map);